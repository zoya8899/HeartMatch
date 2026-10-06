import React, { useState, useEffect } from 'react';
import { MessageCircle, Search, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { useMatch } from '../../contexts/MatchContext';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { MatchRecord } from '../../types';
import { ChatView } from '../chat/ChatView';

interface MatchesViewProps {
  initialMatchId?: string;
  onOpenSafetyModal: (
    targetUserId: string,
    targetName: string,
    actionType: 'report' | 'block' | 'unmatch' | 'report_message',
    extra?: { messageId?: string; messageText?: string }
  ) => void;
  onExploreDiscovery: () => void;
}

export const MatchesView: React.FC<MatchesViewProps> = ({
  initialMatchId,
  onOpenSafetyModal,
  onExploreDiscovery,
}) => {
  const { currentUser } = useAuth();
  const { matches } = useMatch();
  const { activeMatch, setActiveMatch } = useChat();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  useEffect(() => {
    if (initialMatchId && matches.length > 0) {
      const found = matches.find((m) => m.id === initialMatchId);
      if (found) {
        setActiveMatch(found);
        setMobileChatOpen(true);
      }
    } else if (!activeMatch && matches.length > 0) {
      setActiveMatch(matches[0]);
    }
  }, [initialMatchId, matches]);

  const filteredMatches = matches.filter((m) => {
    const name = m.otherProfile?.name || '';
    const city = m.otherProfile?.city || '';
    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      city.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleSelectMatch = (m: MatchRecord) => {
    setActiveMatch(m);
    setMobileChatOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-80px)]">
      <div className="bg-white rounded-3xl shadow-sm border border-stone-200 h-full overflow-hidden flex">
        {/* Left Column: Matches & Conversation List */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-stone-200 flex flex-col bg-white ${
            mobileChatOpen ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Header & Search */}
          <div className="p-4 border-b border-stone-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-serif font-bold text-stone-900">Connections</h2>
              <span className="text-xs bg-rose-50 text-rose-700 font-semibold px-2 py-0.5 rounded-full border border-rose-200">
                {matches.length} Mutual
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search matches by name or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-1.5 text-xs focus:ring-rose-500 focus:border-rose-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Recent Matches Horizontal Scroll */}
          {matches.length > 0 && (
            <div className="p-3 border-b border-stone-100">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-2 text-left px-1">
                New Mutual Matches
              </span>
              <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
                {matches.map((m) => {
                  const profile = m.otherProfile;
                  const isSelected = activeMatch?.id === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => handleSelectMatch(m)}
                      className="flex flex-col items-center gap-1 shrink-0 group focus:outline-none"
                    >
                      <div
                        className={`relative w-14 h-14 rounded-full p-0.5 transition-all ${
                          isSelected
                            ? 'ring-2 ring-rose-600'
                            : 'hover:ring-2 hover:ring-rose-300'
                        }`}
                      >
                        <img
                          src={profile?.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                          alt={profile?.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                        {profile?.verified && (
                          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 text-white rounded-full flex items-center justify-center ring-2 ring-white text-[9px]">
                            ✓
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-stone-700 truncate max-w-[60px]">
                        {profile?.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
            {filteredMatches.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-500 space-y-3">
                <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                  <Heart className="w-6 h-6" />
                </div>
                <p className="font-semibold text-stone-800">No conversations yet</p>
                <p className="text-[11px] text-stone-400">
                  Like profiles in Discover to create genuine mutual connections.
                </p>
                <button
                  onClick={onExploreDiscovery}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg text-xs"
                >
                  Start Discovering
                </button>
              </div>
            ) : (
              filteredMatches.map((m) => {
                const profile = m.otherProfile;
                const isSelected = activeMatch?.id === m.id;

                return (
                  <div
                    key={m.id}
                    onClick={() => handleSelectMatch(m)}
                    className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors text-left ${
                      isSelected ? 'bg-rose-50/60' : 'hover:bg-stone-50'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={profile?.photos?.[0]}
                        alt={profile?.name}
                        className="w-12 h-12 rounded-full object-cover border border-stone-200"
                      />
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-stone-900 truncate">
                          {profile?.name}, {profile?.age}
                        </h4>
                        <span className="text-[10px] text-stone-400 shrink-0">
                          {m.lastMessageTime
                            ? new Date(m.lastMessageTime).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''}
                        </span>
                      </div>

                      <p className="text-xs text-stone-500 truncate mt-0.5">
                        {m.lastMessageText || 'Mutual match! Send an opener.'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat Window or Placeholder */}
        <div
          className={`flex-1 flex flex-col bg-white ${
            mobileChatOpen ? 'flex' : 'hidden md:flex'
          }`}
        >
          {activeMatch ? (
            <ChatView
              match={activeMatch}
              onOpenSafetyModal={onOpenSafetyModal}
              onCloseMobileChat={() => setMobileChatOpen(false)}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-stone-400">
              <div className="w-16 h-16 rounded-3xl bg-stone-100 flex items-center justify-center text-stone-400 mb-4">
                <MessageCircle className="w-8 h-8" />
              </div>
              <h3 className="text-base font-serif font-bold text-stone-900 mb-1">
                Your Conversations
              </h3>
              <p className="text-xs text-stone-500 max-w-sm">
                Select a mutual match from the left to start a real-time conversation or use our AI wingman for thoughtful icebreakers.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
