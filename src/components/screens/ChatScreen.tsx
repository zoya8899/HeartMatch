import React from 'react';
import { ArrowLeft, MessageCircle, Sparkles, Heart } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import { useMatch } from '../../contexts/MatchContext';
import { ChatView } from '../chat/ChatView';
import { INITIAL_DISCOVERY_PROFILES } from '../../services/seedData';

interface ChatScreenProps {
  onNavigate: (screen: string, extra?: any) => void;
  onOpenSafetyModal: (
    targetUserId: string,
    targetName: string,
    actionType: 'report' | 'block' | 'unmatch' | 'report_message',
    extra?: { messageId?: string; messageText?: string }
  ) => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  onNavigate,
  onOpenSafetyModal,
}) => {
  const { activeMatch, startChatWithProfile } = useChat();
  const { matches, discoveryProfiles } = useMatch();

  const currentMatch = activeMatch || matches[0];

  const availableSingles = (discoveryProfiles && discoveryProfiles.length > 0)
    ? discoveryProfiles.slice(0, 4)
    : INITIAL_DISCOVERY_PROFILES.slice(0, 4);

  if (!currentMatch) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center text-stone-500 space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
          <MessageCircle className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-xl font-serif font-bold text-stone-900">Start a Conversation</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Choose a verified single below or explore your matches to begin messaging in real time.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          {availableSingles.map((single) => (
            <div
              key={single.userId}
              className="p-3 bg-white border border-stone-200 rounded-2xl flex items-center justify-between gap-3 shadow-xs hover:border-rose-300 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={single.photos?.[0]}
                  alt={single.name}
                  className="w-11 h-11 rounded-full object-cover shrink-0 border border-stone-200"
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-stone-900 truncate">{single.name}, {single.age}</h4>
                  <p className="text-[10px] text-stone-400 truncate">{single.city}, {single.country}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={async () => {
                  await startChatWithProfile(single);
                }}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-xl shrink-0 cursor-pointer transition-colors"
              >
                Chat
              </button>
            </div>
          ))}
        </div>

        <div className="pt-2">
          <button
            onClick={() => onNavigate('discover')}
            className="px-6 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Explore Discover Feed
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 h-[calc(100vh-80px)] flex flex-col">
      <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden flex-1 flex flex-col">
        <ChatView
          match={currentMatch}
          onOpenSafetyModal={onOpenSafetyModal}
          onCloseMobileChat={() => onNavigate('matches')}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  );
};
