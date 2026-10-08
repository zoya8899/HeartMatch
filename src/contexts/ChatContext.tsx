import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import { useAuth } from './AuthContext';
import { MessageRecord, MatchRecord } from '../types';
import { geminiService } from '../services/geminiService';
import { checkContentForAbuse, STRIKE_1_WARNING_BANNER } from '../services/moderationFilter';

interface ChatContextType {
  activeMatch: MatchRecord | null;
  messages: MessageRecord[];
  isTyping: boolean;
  sendingMessage: boolean;
  moderationWarning: string | null;
  setActiveMatch: (match: MatchRecord | null) => void;
  sendMessage: (text: string, imageUrl?: string, voiceNoteUrl?: string, voiceDuration?: string) => Promise<boolean>;
  sendVoiceNote: (voiceUrl: string, duration?: string) => Promise<boolean>;
  deleteMessage: (messageId: string) => Promise<void>;
  markMessagesAsRead: () => Promise<void>;
  dismissWarning: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, userProfile, recordStrike } = useAuth();
  const [activeMatch, setActiveMatch] = useState<MatchRecord | null>(null);
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [sendingMessage, setSendingMessage] = useState<boolean>(false);
  const [moderationWarning, setModerationWarning] = useState<string | null>(null);

  // Subscribe to real-time messages in active match
  useEffect(() => {
    if (!currentUser || !activeMatch) {
      setMessages([]);
      return;
    }

    const messagesRef = collection(db, 'matches', activeMatch.id, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      } as MessageRecord));
      setMessages(msgs);

      // Auto mark incoming unread messages as read
      const unreadFromOther = msgs.filter((m) => m.receiverId === currentUser.uid && !m.read);
      if (unreadFromOther.length > 0) {
        unreadFromOther.forEach((m) => {
          updateDoc(doc(db, 'matches', activeMatch.id, 'messages', m.id), { read: true }).catch(() => {});
        });
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, `matches/${activeMatch.id}/messages`);
    });

    return () => unsubscribe();
  }, [currentUser, activeMatch]);

  const sendMessage = async (
    text: string,
    imageUrl?: string,
    voiceNoteUrl?: string,
    voiceDuration?: string
  ): Promise<boolean> => {
    if (!currentUser || !activeMatch || (!text.trim() && !imageUrl && !voiceNoteUrl)) return false;

    setSendingMessage(true);
    setModerationWarning(null);

    try {
      // 1. Two-Strike Abuse & Spam Moderation Filter (Urdu / Roman Urdu abuses, explicit terms, links/spam)
      if (text.trim()) {
        const abuseCheck = checkContentForAbuse(text);
        if (abuseCheck.isOffensive) {
          // Block message instantly so it is NEVER delivered!
          const { isSuspended } = await recordStrike(
            abuseCheck.reason || 'Offensive language or spam',
            text.trim()
          );

          if (isSuspended) {
            setModerationWarning(
              'Your account has been permanently disabled and blocked due to repeated violations of HeartMatch community guidelines (Strike 2).'
            );
          } else {
            // Strike 1 banner
            setModerationWarning(STRIKE_1_WARNING_BANNER);
          }

          setSendingMessage(false);
          return false; // Message is rejected and NOT delivered!
        }
      }

      let isFlagged = false;
      let flagReasonText: string | undefined = undefined;

      // Optional AI Safety secondary check
      if (text.trim()) {
        try {
          const modResult = await geminiService.moderateMessage(text);
          if (modResult.flaggedForReview || !modResult.safe) {
            isFlagged = true;
            flagReasonText = modResult.reason || 'Flagged by AI safety filter for human review';
          }
        } catch {
          // fallback gracefully
        }
      }

      const receiverId = activeMatch.user1Id === currentUser.uid ? activeMatch.user2Id : activeMatch.user1Id;
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      const newMsg: MessageRecord = {
        id: messageId,
        matchId: activeMatch.id,
        senderId: currentUser.uid,
        receiverId,
        text: text.trim(),
        imageUrl: imageUrl || '',
        voiceNoteUrl: voiceNoteUrl || '',
        voiceDuration: voiceDuration || '',
        read: false,
        deleted: false,
        flagged: isFlagged,
        flagReason: flagReasonText,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'matches', activeMatch.id, 'messages', messageId), newMsg);

      // Update parent match record's last message
      const lastMessageLabel = voiceNoteUrl
        ? '🎤 Voice Note'
        : imageUrl
        ? '📷 Sent a photo'
        : text.trim();

      await updateDoc(doc(db, 'matches', activeMatch.id), {
        lastMessageText: lastMessageLabel,
        lastMessageTime: new Date().toISOString(),
      });

      // Simulate match partner reply for realistic interactive conversation testing
      if (text.trim() || voiceNoteUrl) {
        triggerInteractiveMatchReply(text.trim() || 'Sent a voice note');
      }

      setSendingMessage(false);
      return true;
    } catch (err) {
      console.error('Error sending message:', err);
      setSendingMessage(false);
      return false;
    }
  };

  const sendVoiceNote = async (voiceUrl: string, duration: string = '0:15'): Promise<boolean> => {
    return sendMessage('', undefined, voiceUrl, duration);
  };

  const triggerInteractiveMatchReply = (userMessage: string) => {
    if (!activeMatch || !currentUser) return;
    const matchCopy = { ...activeMatch };
    const receiverId = matchCopy.user1Id === currentUser.uid ? matchCopy.user2Id : matchCopy.user1Id;
    const otherName = matchCopy.otherProfile?.name || 'Your Match';

    // Show typing indicator after a brief pause
    setTimeout(() => {
      setIsTyping(true);

      setTimeout(async () => {
        setIsTyping(false);

        // Generate contextual response
        let replyText = `Thanks for writing, ${userProfile?.name || 'friend'}! I really appreciate your message. How is your day going?`;
        if (userMessage.toLowerCase().includes('coffee') || userMessage.toLowerCase().includes('cafe')) {
          replyText = `I am a huge fan of specialty coffee! Do you have a favorite spot you like to frequent?`;
        } else if (userMessage.toLowerCase().includes('travel') || userMessage.toLowerCase().includes('trip')) {
          replyText = `Traveling is one of my greatest passions. What's the most memorable place you have visited so far?`;
        } else if (userMessage.toLowerCase().includes('weekend') || userMessage.toLowerCase().includes('fun')) {
          replyText = `Weekends are all about unwinding and good food. What are your plans for this weekend?`;
        }

        const replyId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const autoMsg: MessageRecord = {
          id: replyId,
          matchId: matchCopy.id,
          senderId: receiverId,
          receiverId: currentUser.uid,
          text: replyText,
          read: false,
          deleted: false,
          createdAt: new Date().toISOString(),
        };

        try {
          await setDoc(doc(db, 'matches', matchCopy.id, 'messages', replyId), autoMsg);
          await updateDoc(doc(db, 'matches', matchCopy.id), {
            lastMessageText: replyText,
            lastMessageTime: new Date().toISOString(),
          });
        } catch (e) {
          console.warn('Interactive reply note:', e);
        }
      }, 2000);
    }, 1200);
  };

  const deleteMessage = async (messageId: string) => {
    if (!activeMatch) return;
    try {
      await updateDoc(doc(db, 'matches', activeMatch.id, 'messages', messageId), {
        deleted: true,
        text: 'This message was deleted.',
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `matches/${activeMatch.id}/messages/${messageId}`);
    }
  };

  const markMessagesAsRead = async () => {
    if (!currentUser || !activeMatch) return;
    const unread = messages.filter((m) => m.receiverId === currentUser.uid && !m.read);
    unread.forEach(async (m) => {
      try {
        await updateDoc(doc(db, 'matches', activeMatch.id, 'messages', m.id), { read: true });
      } catch (e) {
        console.warn('Mark read note:', e);
      }
    });
  };

  const dismissWarning = () => {
    setModerationWarning(null);
  };

  return (
    <ChatContext.Provider
      value={{
        activeMatch,
        messages,
        isTyping,
        sendingMessage,
        moderationWarning,
        setActiveMatch,
        sendMessage,
        sendVoiceNote,
        deleteMessage,
        markMessagesAsRead,
        dismissWarning,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
};
