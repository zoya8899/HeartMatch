import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Image as ImageIcon,
  Sparkles,
  HeartHandshake,
  MoreVertical,
  ShieldAlert,
  UserX,
  Trash2,
  Check,
  CheckCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  MapPin,
  Flag,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import { MatchRecord, UserProfile, AICompatibilityResponse } from '../../types';
import { geminiService } from '../../services/geminiService';

interface ChatViewProps {
  match: MatchRecord;
  onOpenSafetyModal: (
    targetUserId: string,
    targetName: string,
    actionType: 'report' | 'block' | 'unmatch' | 'report_message',
    extra?: { messageId?: string; messageText?: string }
  ) => void;
  onCloseMobileChat?: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  match,
  onOpenSafetyModal,
  onCloseMobileChat,
}) => {
  const { currentUser, userProfile } = useAuth();
  const {
    messages,
    isTyping,
    sendingMessage,
    moderationWarning,
    sendMessage,
    deleteMessage,
    dismissWarning,
  } = useChat();

  const [inputVal, setInputVal] = useState<string>('');
  const [imageUrlInput, setImageUrlInput] = useState<string>('');
  const [showImageInput, setShowImageInput] = useState<boolean>(false);
  const [showMenu, setShowMenu] = useState<boolean>(false);

  // AI Modal States
  const [startersList, setStartersList] = useState<string[]>([]);
  const [loadingStarters, setLoadingStarters] = useState<boolean>(false);
  const [showStartersModal, setShowStartersModal] = useState<boolean>(false);

  const [compatibility, setCompatibility] = useState<AICompatibilityResponse | null>(null);
  const [loadingCompatibility, setLoadingCompatibility] = useState<boolean>(false);
  const [showCompatibilityModal, setShowCompatibilityModal] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const otherProfile = match.otherProfile || {
    userId: match.user1Id === currentUser?.uid ? match.user2Id : match.user1Id,
    name: 'Your Match',
    age: 26,
    gender: 'woman',
    interestedIn: 'everyone',
    city: 'New York',
    country: 'USA',
    bio: '',
    photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'],
    interests: ['Travel', 'Art'],
    hobbies: ['Music'],
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() && !imageUrlInput.trim()) return;

    const success = await sendMessage(inputVal, imageUrlInput || undefined);
    if (success) {
      setInputVal('');
      setImageUrlInput('');
      setShowImageInput(false);
    }
  };

  const handleFetchStarters = async () => {
    setShowStartersModal(true);
    setLoadingStarters(true);
    try {
      const res = await geminiService.getConversationStarters(
        userProfile || {},
        otherProfile
      );
      setStartersList(res.starters);
    } catch (e) {
      console.warn('Starters error:', e);
    }
    setLoadingStarters(false);
  };

  const handleFetchCompatibility = async () => {
    setShowCompatibilityModal(true);
    setLoadingCompatibility(true);
    try {
      const res = await geminiService.getCompatibility(
        userProfile || {},
        otherProfile
      );
      setCompatibility(res);
    } catch (e) {
      console.warn('Compatibility error:', e);
    }
    setLoadingCompatibility(false);
  };

  const pickStarter = (starterText: string) => {
    setInputVal(starterText);
    setShowStartersModal(false);
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Chat Top Header */}
      <div className="px-4 py-3 border-b border-stone-200 flex items-center justify-between bg-white z-10">
        <div className="flex items-center gap-3">
          {onCloseMobileChat && (
            <button
              onClick={onCloseMobileChat}
              className="md:hidden p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100"
            >
              ←
            </button>
          )}

          <div className="relative">
            <img
              src={otherProfile.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
              alt={otherProfile.name}
              className="w-10 h-10 rounded-full object-cover border border-stone-200"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
          </div>

          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-stone-900">{otherProfile.name}, {otherProfile.age}</h3>
              {otherProfile.verified && (
                <span title="18+ Verified Profile">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-stone-500">
              <MapPin className="w-3 h-3 text-rose-500" />
              <span>{otherProfile.city}, {otherProfile.country}</span>
            </div>
          </div>
        </div>

        {/* AI Wingman & Actions Toolbar */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* AI Conversation Starters Button */}
          <button
            onClick={handleFetchStarters}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-semibold transition-colors border border-rose-200 shadow-xs"
            title="Generate AI Icebreakers"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
            <span className="hidden sm:inline">AI Starters</span>
          </button>

          {/* AI Compatibility Button */}
          <button
            onClick={handleFetchCompatibility}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg text-xs font-semibold transition-colors border border-amber-200 shadow-xs"
            title="Match Chemistry Report"
          >
            <HeartHandshake className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Chemistry</span>
          </button>

          {/* Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-stone-200 py-1.5 z-20 animate-in fade-in"
                onMouseLeave={() => setShowMenu(false)}
              >
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onOpenSafetyModal(otherProfile.userId, otherProfile.name, 'unmatch');
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                >
                  <UserX className="w-4 h-4 text-stone-500" />
                  <span>Unmatch</span>
                </button>

                <button
                  onClick={() => {
                    setShowMenu(false);
                    onOpenSafetyModal(otherProfile.userId, otherProfile.name, 'block');
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                >
                  <ShieldAlert className="w-4 h-4 text-stone-500" />
                  <span>Block User</span>
                </button>

                <button
                  onClick={() => {
                    setShowMenu(false);
                    onOpenSafetyModal(otherProfile.userId, otherProfile.name, 'report');
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Report Conversation</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Safety Moderation Warning Banner */}
      {moderationWarning && (
        <div className="bg-rose-50 border-b border-rose-200 px-4 py-2 flex items-center justify-between text-xs text-rose-700 animate-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{moderationWarning}</span>
          </div>
          <button onClick={dismissWarning} className="text-rose-500 hover:text-rose-800">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Messages Thread Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-50/50">
        {/* Match Greeting Notice */}
        <div className="text-center py-6">
          <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-2 border border-rose-200 shadow-xs">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h4 className="text-xs font-bold text-stone-900">
            You matched with {otherProfile.name}
          </h4>
          <p className="text-[11px] text-stone-500 max-w-xs mx-auto mt-0.5">
            Encouraging genuine conversations. Remember to follow our respectful dating guidelines.
          </p>
        </div>

        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser?.uid;

          if (msg.deleted) {
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className="bg-stone-200/60 text-stone-400 text-xs italic px-3 py-1.5 rounded-xl">
                  This message was deleted.
                </div>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 group ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              {!isMe && (
                <img
                  src={otherProfile.photos?.[0]}
                  alt={otherProfile.name}
                  className="w-6 h-6 rounded-full object-cover shrink-0 mb-1"
                />
              )}

              <div
                className={`max-w-[75%] sm:max-w-md rounded-2xl p-3 shadow-xs text-left relative ${
                  isMe
                    ? 'bg-rose-600 text-white rounded-br-xs'
                    : 'bg-white text-stone-800 border border-stone-200 rounded-bl-xs'
                }`}
              >
                {/* Image message */}
                {msg.imageUrl && (
                  <div className="mb-2 rounded-lg overflow-hidden">
                    <img
                      src={msg.imageUrl}
                      alt="Shared media"
                      className="w-full max-h-60 object-cover"
                    />
                  </div>
                )}

                {/* Text message */}
                {msg.text && (
                  <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {msg.text}
                  </p>
                )}

                {/* Footer: timestamp & read receipt */}
                <div
                  className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${
                    isMe ? 'text-rose-200' : 'text-stone-400'
                  }`}
                >
                  <span>
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {isMe && (
                    <span>
                      {msg.read ? (
                        <CheckCheck className="w-3 h-3 text-white" />
                      ) : (
                        <Check className="w-3 h-3 text-rose-200" />
                      )}
                    </span>
                  )}
                </div>

                {/* Message delete action for sender */}
                {isMe && (
                  <button
                    onClick={() => deleteMessage(msg.id)}
                    title="Delete message"
                    className="absolute -left-6 top-2 p-1 text-stone-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}

                {/* Message report flag for recipient */}
                {!isMe && (
                  <button
                    onClick={() =>
                      onOpenSafetyModal(
                        otherProfile.userId,
                        otherProfile.name,
                        'report_message',
                        { messageId: msg.id, messageText: msg.text }
                      )
                    }
                    title="Report message to Safety Board"
                    className="absolute -right-6 top-2 p-1 text-stone-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Flag className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-stone-400 text-xs">
            <img
              src={otherProfile.photos?.[0]}
              alt={otherProfile.name}
              className="w-5 h-5 rounded-full object-cover"
            />
            <div className="bg-white border border-stone-200 px-3 py-1.5 rounded-full flex items-center gap-1 shadow-xs">
              <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Optional Image URL Input Drawer */}
      {showImageInput && (
        <div className="p-3 bg-stone-50 border-t border-stone-200 flex items-center gap-2">
          <input
            type="url"
            placeholder="Paste image URL (e.g. from photo album)..."
            value={imageUrlInput}
            onChange={(e) => setImageUrlInput(e.target.value)}
            className="flex-1 bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-xs focus:ring-rose-500 focus:border-rose-500"
          />
          <button
            type="button"
            onClick={() => setShowImageInput(false)}
            className="p-1.5 text-stone-500 hover:text-stone-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Chat Input Bar */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-stone-200 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowImageInput(!showImageInput)}
          title="Share photo"
          className="p-2 text-stone-500 hover:text-rose-600 rounded-lg hover:bg-stone-100 transition-colors"
        >
          <ImageIcon className="w-5 h-5" />
        </button>

        <input
          type="text"
          placeholder={`Message ${otherProfile.name}...`}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
        />

        <button
          type="submit"
          disabled={sendingMessage || (!inputVal.trim() && !imageUrlInput.trim())}
          className="p-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition-colors disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* AI Conversation Starters Modal */}
      {showStartersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 text-left space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-600" />
                <h3 className="text-sm font-bold text-stone-900">AI Conversation Starters</h3>
              </div>
              <button
                onClick={() => setShowStartersModal(false)}
                className="p-1 rounded-md text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingStarters ? (
              <div className="py-8 text-center text-xs text-stone-500">
                <Sparkles className="w-6 h-6 text-rose-500 animate-spin mx-auto mb-2" />
                <span>Crafting authentic openers based on both profiles...</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                <p className="text-xs text-stone-500">
                  Select a starter crafted from {otherProfile.name}'s hobbies and lifestyle:
                </p>

                {startersList.map((starter, i) => (
                  <button
                    key={i}
                    onClick={() => pickStarter(starter)}
                    className="w-full text-left p-3 rounded-xl border border-stone-200 hover:border-rose-400 hover:bg-rose-50/50 text-xs text-stone-800 transition-all leading-relaxed"
                  >
                    "{starter}"
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Compatibility Report Modal */}
      {showCompatibilityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 text-left space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-stone-900">
                  Match Chemistry & Compatibility
                </h3>
              </div>
              <button
                onClick={() => setShowCompatibilityModal(false)}
                className="p-1 rounded-md text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingCompatibility ? (
              <div className="py-8 text-center text-xs text-stone-500">
                <HeartHandshake className="w-6 h-6 text-amber-500 animate-pulse mx-auto mb-2" />
                <span>Analyzing shared interests and communication synergy...</span>
              </div>
            ) : compatibility ? (
              <div className="space-y-4 text-xs">
                {/* Score */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-amber-900">Overall Synergy Score</h4>
                    <p className="text-[11px] text-amber-700">Based on lifestyle, values, and goals</p>
                  </div>
                  <span className="text-3xl font-serif font-bold text-amber-900">
                    {compatibility.score}%
                  </span>
                </div>

                <div>
                  <h5 className="font-bold text-stone-900 mb-1">Why You Connect</h5>
                  <p className="text-stone-600 leading-relaxed">{compatibility.summary}</p>
                </div>

                <div>
                  <h5 className="font-bold text-stone-900 mb-1.5">Shared Strengths</h5>
                  <ul className="space-y-1.5">
                    {compatibility.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-stone-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <h5 className="font-bold text-stone-900 mb-0.5">Wingman Tip for Date 1</h5>
                  <p className="text-stone-600 text-[11px]">{compatibility.advice}</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
