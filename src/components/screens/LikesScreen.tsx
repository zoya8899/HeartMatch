import React, { useState } from 'react';
import {
  Heart,
  Crown,
  Lock,
  Star,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useMatch } from '../../contexts/MatchContext';
import { INITIAL_DISCOVERY_PROFILES } from '../../services/seedData';
import { UserProfile } from '../../types';

interface LikesScreenProps {
  onNavigate: (screen: string) => void;
  onOpenProfile: (profile: UserProfile) => void;
}

export const LikesScreen: React.FC<LikesScreenProps> = ({ onNavigate, onOpenProfile }) => {
  const { subscription } = useAuth();
  const { swipeProfile } = useMatch();

  const [activeSubTab, setActiveSubTab] = useState<'received' | 'sent'>('received');

  const isPremium = subscription?.status === 'active';

  // Sample incoming likes
  const incomingLikesProfiles = INITIAL_DISCOVERY_PROFILES.slice(0, 4);

  const handleInstantMatch = async (profile: UserProfile, e: React.MouseEvent) => {
    e.stopPropagation();
    await swipeProfile(profile, 'like');
    onNavigate('matches');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-left space-y-6">
      {/* Top Header */}
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
            <h1 className="text-2xl font-serif font-bold text-stone-900">Likes & Admirers</h1>
            <span className="bg-rose-50 text-rose-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-rose-200">
              {incomingLikesProfiles.length} New
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Adult daters who have already expressed interest in getting to know you
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl">
          <button
            onClick={() => setActiveSubTab('received')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeSubTab === 'received' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Received Likes ({incomingLikesProfiles.length})
          </button>
          <button
            onClick={() => setActiveSubTab('sent')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeSubTab === 'sent' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Likes Sent
          </button>
        </div>
      </div>

      {/* Non-Premium Promotion Banner */}
      {!isPremium && activeSubTab === 'received' && (
        <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-md">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-200" />
              <h3 className="text-lg font-serif font-bold">Unblur Who Liked You</h3>
            </div>
            <p className="text-xs text-rose-100 leading-relaxed">
              Upgrade to HeartMatch Premium or VIP to immediately see everyone who liked you and match instantly without waiting to swipe.
            </p>
          </div>

          <button
            onClick={() => onNavigate('premium_plans')}
            className="px-6 py-3 bg-white text-stone-950 hover:bg-stone-50 font-bold text-xs rounded-xl shadow-sm transition-all hover:scale-105 shrink-0 cursor-pointer"
          >
            Upgrade to Reveal
          </button>
        </div>
      )}

      {/* Grid of Profiles */}
      {activeSubTab === 'received' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {incomingLikesProfiles.map((p, idx) => (
            <div
              key={p.userId}
              onClick={() => {
                if (isPremium) onOpenProfile(p);
                else onNavigate('premium_plans');
              }}
              className="group relative aspect-[3/4] rounded-3xl overflow-hidden bg-stone-900 border border-stone-200 shadow-sm cursor-pointer"
            >
              {/* Photo (Blurred if non-premium) */}
              <img
                src={p.photos?.[0]}
                alt={p.name}
                className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                  !isPremium ? 'blur-lg scale-110 opacity-70' : ''
                }`}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />

              {!isPremium ? (
                /* Blurred Locked Overlay */
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-white">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-2">
                    <Lock className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold">Liked You</span>
                  <span className="text-[10px] text-stone-300">Around {p.city}</span>
                </div>
              ) : (
                /* Unblurred Premium View */
                <div className="absolute bottom-4 inset-x-4 text-white text-left">
                  <h4 className="text-base font-serif font-bold">{p.name}, {p.age}</h4>
                  <p className="text-[11px] text-stone-300 truncate">{p.city}</p>

                  <button
                    onClick={(e) => handleInstantMatch(p, e)}
                    className="w-full mt-2 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Heart className="w-3.5 h-3.5 fill-white" />
                    <span>Match Back</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Likes Sent View */
        <div className="bg-white rounded-3xl p-10 border border-stone-200 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
            <Star className="w-7 h-7 fill-amber-500" />
          </div>
          <h3 className="text-base font-serif font-bold text-stone-900">Your Outgoing Likes & Super Likes</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
            Profiles you like are notified immediately. When they like you back, you'll be connected in Matches.
          </p>
          <button
            onClick={() => onNavigate('discover')}
            className="px-5 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
          >
            Discover More Profiles
          </button>
        </div>
      )}
    </div>
  );
};
