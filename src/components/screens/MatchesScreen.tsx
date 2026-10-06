import React, { useState } from 'react';
import { Search, Heart, MessageCircle, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import { useMatch } from '../../contexts/MatchContext';
import { useChat } from '../../contexts/ChatContext';
import { MatchRecord } from '../../types';

interface MatchesScreenProps {
  onNavigate: (screen: string, extraData?: any) => void;
}

export const MatchesScreen: React.FC<MatchesScreenProps> = ({ onNavigate }) => {
  const { matches } = useMatch();
  const { setActiveMatch } = useChat();
  const [search, setSearch] = useState('');

  const filtered = matches.filter((m) => {
    const name = m.otherProfile?.name || '';
    const city = m.otherProfile?.city || '';
    return name.toLowerCase().includes(search.toLowerCase()) || city.toLowerCase().includes(search.toLowerCase());
  });

  const handleOpenChat = (m: MatchRecord) => {
    setActiveMatch(m);
    onNavigate('chat', { matchId: m.id });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-left space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => onNavigate('discover')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 mb-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Discover</span>
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-stone-900">Matches & Conversations</h1>
            <span className="bg-rose-50 text-rose-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-rose-200">
              {matches.length} Connected
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Real mutual connections ready for thoughtful conversations
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search connections..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-rose-500 focus:border-rose-500 shadow-xs"
          />
        </div>
      </div>

      {/* New Mutual Matches Bar */}
      {matches.length > 0 && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest block mb-4">
            Recent Mutual Connections
          </span>
          <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none">
            {matches.map((m) => {
              const p = m.otherProfile;
              return (
                <button
                  key={m.id}
                  onClick={() => handleOpenChat(m)}
                  className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none cursor-pointer"
                >
                  <div className="relative w-16 h-16 rounded-full p-0.5 hover:ring-2 hover:ring-rose-500 transition-all">
                    <img
                      src={p?.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                      alt={p?.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 ring-2 ring-white rounded-full" />
                  </div>
                  <span className="text-xs font-semibold text-stone-800 truncate max-w-[70px]">
                    {p?.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Conversation Thread List */}
      <div className="bg-white rounded-3xl shadow-sm border border-stone-200 divide-y divide-stone-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-500 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
              <Heart className="w-7 h-7" />
            </div>
            <h3 className="text-base font-serif font-bold text-stone-900">No active conversations</h3>
            <p className="text-xs text-stone-400 max-w-sm mx-auto leading-relaxed">
              Explore profiles in Discover and like individuals who share your interests to form mutual connections.
            </p>
            <button
              onClick={() => onNavigate('discover')}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold text-xs shadow-xs cursor-pointer"
            >
              Start Discovering
            </button>
          </div>
        ) : (
          filtered.map((m) => {
            const p = m.otherProfile;
            return (
              <div
                key={m.id}
                onClick={() => handleOpenChat(m)}
                className="p-4 hover:bg-stone-50/80 transition-colors flex items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={p?.photos?.[0]}
                      alt={p?.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-stone-200"
                    />
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 ring-2 ring-white rounded-full" />
                  </div>

                  <div className="min-w-0 text-left">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-stone-900 truncate">
                        {p?.name}, {p?.age}
                      </h4>
                      {p?.verified && (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-stone-500 truncate mt-0.5">
                      {m.lastMessageText || 'Mutual match! Say hello with an icebreaker.'}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-stone-400 block mb-1">
                    {m.lastMessageTime
                      ? new Date(m.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : ''}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 group-hover:text-rose-600">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
