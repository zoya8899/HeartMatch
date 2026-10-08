import React, { useState } from 'react';
import { ArrowLeft, MessageCircle, Sparkles, Heart, Users } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import { useMatch } from '../../contexts/MatchContext';
import { ChatView } from '../chat/ChatView';
import { AI_PERSONAS } from '../../services/aiPersonas';
import { UserProfile } from '../../types';

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
  const { activeMatch, setActiveMatch, startChatWithProfile } = useChat();
  const { matches } = useMatch();
  const [personaFilter, setPersonaFilter] = useState<'all' | 'pakistan' | 'uk'>('all');

  const currentMatch = activeMatch || (matches.length > 0 ? matches[0] : null);

  const filteredPersonas = AI_PERSONAS.filter((p) => {
    if (personaFilter === 'pakistan') return p.country.toLowerCase() === 'pakistan';
    if (personaFilter === 'uk') return p.country.toLowerCase().includes('united kingdom');
    return true;
  });

  const handleSelectPersona = async (persona: UserProfile) => {
    await startChatWithProfile(persona);
  };

  if (!currentMatch) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-stone-500 space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-rose-600 text-white flex items-center justify-center mx-auto shadow-md">
          <Sparkles className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-serif font-bold text-stone-900">20 Intelligent AI Chat Personas</h2>
          <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
            10 Pakistani Girls (Urdu/English polite authentic replies) + 10 UK Boys (casual British banter).
            Powered by real-time Gemini API with persistent chat memory!
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPersonaFilter('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              personaFilter === 'all'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            All 20 Personas
          </button>
          <button
            onClick={() => setPersonaFilter('pakistan')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              personaFilter === 'pakistan'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            🇵🇰 Pakistani Girls (10)
          </button>
          <button
            onClick={() => setPersonaFilter('uk')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              personaFilter === 'uk'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            🇬🇧 UK Boys (10)
          </button>
        </div>

        {/* 20 Personas Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-left">
          {filteredPersonas.map((single) => {
            const isPak = single.country.toLowerCase() === 'pakistan';
            return (
              <div
                key={single.userId}
                className="p-3.5 bg-white border border-stone-200 hover:border-rose-400 rounded-2xl flex flex-col justify-between gap-3 shadow-xs transition-all hover:shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="relative shrink-0">
                    <img
                      src={single.photos?.[0]}
                      alt={single.name}
                      className="w-12 h-12 rounded-full object-cover border border-stone-200"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-stone-900 truncate">
                        {single.name}, {single.age}
                      </h4>
                      <span className="text-[10px]">{isPak ? '🇵🇰' : '🇬🇧'}</span>
                    </div>
                    <p className="text-[11px] font-medium text-stone-600 truncate">{single.profession}</p>
                    <p className="text-[10px] text-stone-400 truncate">{single.city}, {single.country}</p>
                  </div>
                </div>

                <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                  {single.bio}
                </p>

                <div className="pt-1 flex items-center justify-between border-t border-stone-100">
                  <span className="text-[10px] font-semibold text-rose-600">
                    {isPak ? 'Urdu & English' : 'British English'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSelectPersona(single)}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-xl shrink-0 cursor-pointer transition-colors shadow-xs"
                  >
                    Chat Now
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 flex items-center justify-center gap-3">
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
    <div className="max-w-4xl mx-auto px-4 py-4 h-[calc(100vh-80px)] flex flex-col">
      {/* Switch Persona Quick Ribbon */}
      <div className="mb-2 flex items-center justify-between bg-white px-3 py-1.5 rounded-2xl border border-stone-200 shadow-xs text-left">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
          <button
            onClick={() => setActiveMatch(null)}
            className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 px-2 py-1 rounded-lg hover:bg-rose-50 flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" />
            <span>All 20 AI Personas</span>
          </button>
          <span className="text-stone-300">|</span>
          {AI_PERSONAS.slice(0, 8).map((p) => (
            <button
              key={p.userId}
              onClick={() => handleSelectPersona(p)}
              className={`text-[11px] font-medium px-2 py-0.5 rounded-lg shrink-0 flex items-center gap-1 cursor-pointer transition-colors ${
                currentMatch?.otherProfile?.userId === p.userId
                  ? 'bg-rose-100 text-rose-800 font-bold'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <span>{p.country.toLowerCase() === 'pakistan' ? '🇵🇰' : '🇬🇧'}</span>
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden flex-1 flex flex-col">
        <ChatView
          match={currentMatch}
          onOpenSafetyModal={onOpenSafetyModal}
          onCloseMobileChat={() => setActiveMatch(null)}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  );
};
