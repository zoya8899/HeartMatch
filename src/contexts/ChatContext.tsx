import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import { useAuth } from './AuthContext';
import { MessageRecord, MatchRecord, UserProfile } from '../types';
import { geminiService } from '../services/geminiService';
import { checkContentForAbuse, STRIKE_1_WARNING_BANNER } from '../services/moderationFilter';

interface ChatContextType {
  activeMatch: MatchRecord | null;
  messages: MessageRecord[];
  isTyping: boolean;
  sendingMessage: boolean;
  moderationWarning: string | null;
  setActiveMatch: (match: MatchRecord | null) => void;
  startChatWithProfile: (profile: UserProfile) => Promise<MatchRecord | null>;
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

  // Subscribe to real-time messages in active match using Firestore `messages` collection
  useEffect(() => {
    if (!currentUser || !activeMatch) {
      setMessages([]);
      return;
    }

    const receiverId = activeMatch.user1Id === currentUser.uid ? activeMatch.user2Id : activeMatch.user1Id;
    const conversationId = [currentUser.uid, receiverId].sort().join('_');

    // Pre-load saved messages from localStorage immediately so messages never vanish
    try {
      const cached = localStorage.getItem(`heartmatch_chat_${conversationId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch (e) {}

    // 1. Real-time snapshot listener on top-level `messages` collection
    const messagesCol = collection(db, 'messages');
    const q = query(
      messagesCol,
      where('conversationId', '==', conversationId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveMessages = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          isRead: data.isRead ?? data.read ?? false,
          read: data.read ?? data.isRead ?? false,
        } as MessageRecord;
      });

      // Sort messages in ascending order by createdAt
      liveMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      setMessages((prev) => {
        // Keep optimistic messages that are currently in flight
        const liveIds = new Set(liveMessages.map((m) => m.id));
        const pendingOptimistic = prev.filter(
          (m) => !liveIds.has(m.id) && m.senderId === currentUser.uid
        );
        const merged = [...liveMessages, ...pendingOptimistic];
        merged.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        return merged;
      });

      // Auto mark incoming unread messages as read
      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.receiverId === currentUser.uid && (!data.isRead || !data.read)) {
          updateDoc(doc(db, 'messages', docSnap.id), { isRead: true, read: true }).catch(() => {});
        }
      });
    }, (err) => {
      console.warn('Real-time snapshot listener on /messages error:', err);
    });

    // 2. Also listen to subcollection `matches/{id}/messages` if applicable
    const subColRef = collection(db, 'matches', activeMatch.id, 'messages');
    const unsubscribeSub = onSnapshot(subColRef, (snapshot) => {
      if (snapshot.empty) return;
      const subMsgs = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          isRead: data.isRead ?? data.read ?? false,
          read: data.read ?? data.isRead ?? false,
        } as MessageRecord;
      });

      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const newFromSub = subMsgs.filter((m) => !existingIds.has(m.id));
        if (newFromSub.length === 0) return prev;
        const merged = [...prev, ...newFromSub];
        merged.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        return merged;
      });
    }, () => {});

    return () => {
      unsubscribe();
      unsubscribeSub();
    };
  }, [currentUser, activeMatch]);

  // Persist messages to local storage whenever updated
  useEffect(() => {
    if (!currentUser || !activeMatch || messages.length === 0) return;
    const receiverId = activeMatch.user1Id === currentUser.uid ? activeMatch.user2Id : activeMatch.user1Id;
    const conversationId = [currentUser.uid, receiverId].sort().join('_');
    try {
      localStorage.setItem(`heartmatch_chat_${conversationId}`, JSON.stringify(messages));
    } catch (e) {}
  }, [messages, currentUser, activeMatch]);

  /**
   * Starts a direct conversation thread with any profile
   */
  const startChatWithProfile = async (targetProfile: UserProfile): Promise<MatchRecord | null> => {
    if (!currentUser) return null;
    const matchId = `match_${[currentUser.uid, targetProfile.userId].sort().join('_')}`;
    const newMatch: MatchRecord = {
      id: matchId,
      user1Id: currentUser.uid,
      user2Id: targetProfile.userId,
      status: 'active',
      matchedAt: new Date().toISOString(),
      otherProfile: targetProfile,
      lastMessageText: 'Active conversation',
      lastMessageTime: new Date().toISOString(),
    };

    setActiveMatch(newMatch);

    try {
      await setDoc(doc(db, 'matches', matchId), {
        id: matchId,
        user1Id: currentUser.uid,
        user2Id: targetProfile.userId,
        status: 'active',
        matchedAt: new Date().toISOString(),
        lastMessageText: 'Active conversation',
        lastMessageTime: new Date().toISOString(),
      }, { merge: true });
    } catch (err) {
      console.warn('Could not upsert match doc:', err);
    }

    return newMatch;
  };

  /**
   * Sends a message immediately appending to active chat and writing to Firestore `messages`
   */
  const sendMessage = async (
    text: string,
    imageUrl?: string,
    voiceNoteUrl?: string,
    voiceDuration?: string
  ): Promise<boolean> => {
    if (!currentUser || !activeMatch || (!text.trim() && !imageUrl && !voiceNoteUrl)) return false;

    const receiverId = activeMatch.user1Id === currentUser.uid ? activeMatch.user2Id : activeMatch.user1Id;
    const conversationId = [currentUser.uid, receiverId].sort().join('_');
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const createdAt = new Date().toISOString();

    // 1. Immediate optimistic append to active chat screen
    const optimisticMsg: MessageRecord = {
      id: messageId,
      matchId: activeMatch.id,
      senderId: currentUser.uid,
      receiverId,
      text: text.trim(),
      imageUrl: imageUrl || '',
      voiceNoteUrl: voiceNoteUrl || '',
      voiceDuration: voiceDuration || '',
      read: false,
      isRead: false,
      conversationId,
      deleted: false,
      createdAt,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setSendingMessage(true);
    setModerationWarning(null);

    // 2. Abuse Check Filter
    if (text.trim()) {
      const abuseCheck = checkContentForAbuse(text);
      if (abuseCheck.isOffensive) {
        // Rollback optimistic message so it is not visible
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
        const { isSuspended } = await recordStrike(
          abuseCheck.reason || 'Offensive language or spam',
          text.trim()
        );

        if (isSuspended) {
          setModerationWarning(
            'Your account has been permanently disabled and blocked due to repeated violations of HeartMatch community guidelines (Strike 2).'
          );
        } else {
          setModerationWarning(STRIKE_1_WARNING_BANNER);
        }

        setSendingMessage(false);
        return false;
      }
    }

    try {
      // 3. Write message to Firestore collection `messages` (fields: senderId, receiverId, text, createdAt, isRead)
      const firestoreMsg = {
        id: messageId,
        senderId: currentUser.uid,
        receiverId,
        text: text.trim(),
        createdAt,
        isRead: false,
        read: false,
        conversationId,
        matchId: activeMatch.id,
        imageUrl: imageUrl || '',
        voiceNoteUrl: voiceNoteUrl || '',
        voiceDuration: voiceDuration || '',
      };

      await setDoc(doc(db, 'messages', messageId), firestoreMsg);

      // Also mirror to matches subcollection
      try {
        await setDoc(doc(db, 'matches', activeMatch.id, 'messages', messageId), firestoreMsg);
      } catch (e) {}

      // Update parent match record's last message
      const lastMessageLabel = voiceNoteUrl
        ? '🎤 Voice Note'
        : imageUrl
        ? '📷 Sent a photo'
        : text.trim();

      try {
        await setDoc(doc(db, 'matches', activeMatch.id), {
          id: activeMatch.id,
          user1Id: activeMatch.user1Id,
          user2Id: activeMatch.user2Id,
          status: 'active',
          lastMessageText: lastMessageLabel,
          lastMessageTime: createdAt,
        }, { merge: true });
      } catch (e) {}

      // 4. Trigger simulated interactive reply for realistic testing
      if (text.trim() || voiceNoteUrl) {
        triggerInteractiveMatchReply(text.trim() || 'Sent a voice note', receiverId, conversationId);
      }

      setSendingMessage(false);
      return true;
    } catch (err) {
      console.error('Error writing message to Firestore:', err);
      setSendingMessage(false);
      return false;
    }
  };

  const sendVoiceNote = async (voiceUrl: string, duration: string = '0:15'): Promise<boolean> => {
    return sendMessage('', undefined, voiceUrl, duration);
  };

  const triggerInteractiveMatchReply = (userMessage: string, receiverId: string, conversationId: string) => {
    if (!activeMatch || !currentUser) return;
    const matchCopy = { ...activeMatch };

    // Capture conversation history context before delay
    const historySnapshot = messages.slice(-8).map((m) => ({
      sender: m.senderId === currentUser.uid ? ('user' as const) : ('persona' as const),
      text: m.text,
    }));

    // Realistic delay before persona starts typing (500-900ms)
    setTimeout(() => {
      setIsTyping(true);

      // Natural typing delay between 2000ms and 3800ms (2 to 4 seconds)
      const typingDuration = Math.floor(Math.random() * 1600) + 2200;

      // Start fetching Gemini API response in parallel with the typing delay
      const aiReplyPromise = geminiService.sendPersonaChatMessage({
        personaId: receiverId,
        userMessage,
        conversationHistory: historySnapshot,
        userProfile: userProfile || {},
      });

      setTimeout(async () => {
        let replyText = '';
        try {
          replyText = await aiReplyPromise;
        } catch (e) {
          replyText = `Thanks for your message! It is so nice connecting with you on HeartMatch. How has your day been going?`;
        }

        setIsTyping(false);

        const replyId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const replyCreatedAt = new Date().toISOString();

        const personaMsg: MessageRecord = {
          id: replyId,
          matchId: matchCopy.id,
          senderId: receiverId,
          receiverId: currentUser.uid,
          text: replyText,
          isRead: false,
          read: false,
          conversationId,
          deleted: false,
          createdAt: replyCreatedAt,
        };

        // 1. Immediately append to active chat screen so response appears instantly
        setMessages((prev) => {
          if (prev.some((m) => m.id === replyId)) return prev;
          return [...prev, personaMsg];
        });

        // 2. Persist in Firestore messages collection
        try {
          await setDoc(doc(db, 'messages', replyId), personaMsg);
        } catch (err) {
          console.warn('Could not persist persona reply to Firestore /messages:', err);
        }

        // 3. Mirror in matches subcollection and update match lastMessageText
        try {
          await setDoc(doc(db, 'matches', matchCopy.id, 'messages', replyId), personaMsg);
          await setDoc(doc(db, 'matches', matchCopy.id), {
            id: matchCopy.id,
            user1Id: matchCopy.user1Id,
            user2Id: matchCopy.user2Id,
            status: 'active',
            lastMessageText: replyText,
            lastMessageTime: replyCreatedAt,
          }, { merge: true });
        } catch (e) {
          console.warn('Match doc update error:', e);
        }
      }, typingDuration);
    }, 600);
  };

  const deleteMessage = async (messageId: string) => {
    try {
      await updateDoc(doc(db, 'messages', messageId), {
        deleted: true,
        text: 'This message was deleted.',
      });
      if (activeMatch) {
        await updateDoc(doc(db, 'matches', activeMatch.id, 'messages', messageId), {
          deleted: true,
          text: 'This message was deleted.',
        }).catch(() => {});
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `messages/${messageId}`);
    }
  };

  const markMessagesAsRead = async () => {
    if (!currentUser) return;
    const unread = messages.filter((m) => m.receiverId === currentUser.uid && (!m.isRead || !m.read));
    unread.forEach(async (m) => {
      try {
        await updateDoc(doc(db, 'messages', m.id), { isRead: true, read: true });
      } catch (e) {}
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
        startChatWithProfile,
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
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
