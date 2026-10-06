import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import { useMatch } from '../../contexts/MatchContext';
import { ChatView } from '../chat/ChatView';

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
  const { activeMatch } = useChat();
  const { matches } = useMatch();

  const currentMatch = activeMatch || matches[0];

  if (!currentMatch) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center text-stone-500 space-y-4">
        <h3 className="text-xl font-serif font-bold text-stone-900">No match selected</h3>
        <p className="text-xs">Please select a connection to begin chatting.</p>
        <button
          onClick={() => onNavigate('matches')}
          className="px-5 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-semibold"
        >
          View Matches List
        </button>
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
        />
      </div>
    </div>
  );
};
