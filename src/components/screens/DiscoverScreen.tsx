import React, { useState } from 'react';
import {
  Heart,
  X,
  Star,
  RotateCcw,
  Zap,
  SlidersHorizontal,
  MapPin,
  Briefcase,
  GraduationCap,
  CheckCircle2,
  Info,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Compass,
  Sparkles,
  Volume2,
  MessageCircle,
  LayoutGrid,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useMatch } from '../../contexts/MatchContext';
import { UserProfile } from '../../types';
import { DiscoveryExplorer } from '../discovery/DiscoveryExplorer';
import { InternationalUpgradeModal } from '../modals/InternationalUpgradeModal';

interface DiscoverScreenProps {
  onNavigate: (screen: string, extraData?: any) => void;
  onOpenProfileDetails: (profile: UserProfile) => void;
}

export const DiscoverScreen: React.FC<DiscoverScreenProps> = ({
  onNavigate,
  onOpenProfileDetails,
}) => {
  const { userProfile, isPakistanUser, isPremium } = useAuth();
  const {
    currentCard,
    swipe,
    swipeProfile,
    rewindLastSwipe,
    triggerProfileBoost,
    activeBoost,
    activeMatchCelebration,
    dismissCelebration,
    historyQueue,
    refreshDiscovery,
  } = useMatch();

  // Mode: 'explore' (Verified Profiles & Sections grid) vs 'swipe' (Card deck swipe)
  const [viewMode, setViewMode] = useState<'explore' | 'swipe'>('explore');

  const [photoIndex, setPhotoIndex] = useState(0);
  const [swipingDirection, setSwipingDirection] = useState<'left' | 'right' | 'up' | null>(null);

  // International upgrade modal in swipe mode
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeCardTarget, setUpgradeCardTarget] = useState<UserProfile | null>(null);

  const photos = currentCard?.photos && currentCard.photos.length > 0
    ? currentCard.photos
    : ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'];

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleSwipeAction = async (action: 'like' | 'pass' | 'superlike') => {
    if (action !== 'pass' && currentCard && currentCard.country && currentCard.country.toLowerCase() !== 'pakistan') {
      if (isPakistanUser && !isPremium) {
        setUpgradeCardTarget(currentCard);
        setUpgradeModalOpen(true);
        return;
      }
    }

    setSwipingDirection(action === 'like' ? 'right' : action === 'pass' ? 'left' : 'up');
    setTimeout(async () => {
      await swipe(action);
      setSwipingDirection(null);
      setPhotoIndex(0);
    }, 280);
  };

  const handleOpenCardDetails = (profile: UserProfile) => {
    if (profile.country && profile.country.toLowerCase() !== 'pakistan') {
      if (isPakistanUser && !isPremium) {
        setUpgradeCardTarget(profile);
        setUpgradeModalOpen(true);
        return;
      }
    }
    onOpenProfileDetails(profile);
  };

  return (
    <div className="w-full text-left select-none pb-12">
      {/* View Switcher & Top Action Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-3">
          {/* Toggle between Explore Verified Singles and Card Swipe Deck */}
          <div className="inline-flex p-1 bg-stone-100 rounded-2xl border border-stone-200">
            <button
              onClick={() => setViewMode('explore')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'explore'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-rose-600" />
              <span>Explore Verified Singles</span>
            </button>

            <button
              onClick={() => setViewMode('swipe')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'swipe'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-rose-600" />
              <span>Card Deck (Swipe)</span>
            </button>
          </div>

          {/* Right Controls: Filters, Boost, Who Liked You */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('dating_preferences')}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-50 shadow-xs transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-stone-500" />
              <span>Preferences</span>
            </button>

            {activeBoost && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-full text-xs font-semibold text-purple-700 animate-pulse">
                <Zap className="w-3.5 h-3.5 fill-purple-600" />
                <span className="hidden sm:inline">Boost Active</span>
              </div>
            )}

            <button
              onClick={() => onNavigate('likes')}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold hover:bg-rose-100 transition-colors cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5 fill-rose-600" />
              <span>Who Liked You</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mode 1: High-Engagement Verified Profiles Discovery Explorer */}
      {viewMode === 'explore' ? (
        <DiscoveryExplorer
          isLoggedIn={true}
          currentUserProfile={userProfile}
          onOpenProfileDetails={onOpenProfileDetails}
          onLike={(p) => swipeProfile(p, 'like')}
          onPass={(p) => swipeProfile(p, 'pass')}
          onSuperLike={(p) => swipeProfile(p, 'superlike')}
          onReport={(p) => onNavigate('report_user', { targetId: p.userId, targetName: p.name })}
          onBlock={(p) => {
            if (confirm(`Block ${p.name}? You will no longer see each other.`)) {
              swipeProfile(p, 'pass');
            }
          }}
          onNavigateToPreferences={() => onNavigate('dating_preferences')}
          onNavigateToPremium={() => onNavigate('premium_plans')}
        />
      ) : (
        /* Mode 2: Classic Card Stack Swipe Deck */
        <div className="max-w-xl mx-auto px-4 py-6 text-left flex flex-col items-center">
          {currentCard ? (
            <div
              className={`w-full bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden relative transition-all duration-300 transform ${
                swipingDirection === 'right'
                  ? 'translate-x-32 rotate-6 opacity-0'
                  : swipingDirection === 'left'
                  ? '-translate-x-32 -rotate-6 opacity-0'
                  : swipingDirection === 'up'
                  ? '-translate-y-32 scale-95 opacity-0'
                  : 'translate-x-0 rotate-0 opacity-100'
              }`}
            >
              {/* Photos Container */}
              <div
                className="relative h-[490px] sm:h-[530px] w-full bg-stone-900 cursor-pointer group"
                onClick={() => handleOpenCardDetails(currentCard)}
              >
                <img
                  src={photos[photoIndex]}
                  alt={currentCard.name}
                  className="w-full h-full object-cover transition-opacity duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/20 to-transparent" />

                {/* Photo Segment Indicators */}
                {photos.length > 1 && (
                  <div className="absolute top-3 inset-x-4 flex items-center gap-1.5 z-10">
                    {photos.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          idx === photoIndex ? 'bg-white' : 'bg-white/40'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Prev/Next Touch Areas */}
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevPhoto}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white opacity-0 group-hover:opacity-100 hover:bg-black/60 transition-opacity"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNextPhoto}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white opacity-0 group-hover:opacity-100 hover:bg-black/60 transition-opacity"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Top Badges */}
                <div className="absolute top-6 left-4 flex items-center gap-2 z-10">
                  {currentCard.verified && (
                    <div className="bg-emerald-500/90 backdrop-blur text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>18+ Verified Adult</span>
                    </div>
                  )}
                </div>

                {/* Bottom Details Overlay */}
                <div className="absolute bottom-5 inset-x-5 text-white z-10">
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline gap-2">
                      <h2 className="text-3xl font-serif font-bold tracking-tight">
                        {currentCard.name}, {currentCard.age}
                      </h2>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenProfileDetails(currentCard);
                      }}
                      className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur rounded-full text-white transition-colors cursor-pointer"
                      title="View complete profile"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>

                  {/* General City / Distance without revealing exact GPS */}
                  <div className="flex items-center gap-1.5 text-xs text-stone-300 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span>
                      {currentCard.showCity !== false && currentCard.city ? `${currentCard.city}, ` : ''}
                      {currentCard.country} · Approximate region
                    </span>
                  </div>

                  {/* Bio Preview */}
                  <p className="text-xs text-stone-200 mt-2 line-clamp-2 leading-relaxed">
                    {currentCard.bio}
                  </p>

                  {/* Prompt Highlight if present */}
                  {currentCard.prompts && currentCard.prompts.length > 0 && (
                    <div className="mt-2.5 p-2.5 bg-black/40 backdrop-blur rounded-xl border border-white/10 text-xs">
                      <span className="text-[10px] font-bold text-amber-400 block uppercase">
                        {currentCard.prompts[0].question}
                      </span>
                      <p className="text-stone-200 italic mt-0.5 line-clamp-1">
                        "{currentCard.prompts[0].answer}"
                      </p>
                    </div>
                  )}

                  {/* Passion Tags */}
                  {currentCard.interests && currentCard.interests.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {currentCard.interests.slice(0, 3).map((item, i) => (
                        <span
                          key={i}
                          className="text-[11px] font-medium bg-black/40 backdrop-blur px-2.5 py-0.5 rounded-md text-stone-200 border border-white/10"
                        >
                          {item}
                        </span>
                      ))}
                      {currentCard.interests.length > 3 && (
                        <span className="text-[11px] text-stone-400 self-center">
                          +{currentCard.interests.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons Toolbar */}
              <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-center gap-5">
                {/* Rewind */}
                <button
                  onClick={rewindLastSwipe}
                  disabled={historyQueue.length === 0}
                  title="Undo last swipe"
                  className="w-12 h-12 rounded-full bg-white border border-stone-200 text-stone-600 hover:text-amber-600 hover:border-amber-300 flex items-center justify-center shadow-xs transition-transform hover:scale-105 disabled:opacity-40 cursor-pointer"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>

                {/* Pass */}
                <button
                  onClick={() => handleSwipeAction('pass')}
                  title="Pass"
                  className="w-14 h-14 rounded-full bg-white border border-stone-200 text-stone-500 hover:text-rose-600 hover:border-rose-300 flex items-center justify-center shadow-xs transition-transform hover:scale-105 cursor-pointer"
                >
                  <X className="w-6 h-6 stroke-[2.5]" />
                </button>

                {/* Super Like */}
                <button
                  onClick={() => handleSwipeAction('superlike')}
                  title="Super Like"
                  className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-500 hover:bg-amber-100 flex items-center justify-center shadow-xs transition-transform hover:scale-105 cursor-pointer"
                >
                  <Star className="w-5 h-5 fill-amber-500" />
                </button>

                {/* Like */}
                <button
                  onClick={() => handleSwipeAction('like')}
                  title="Like"
                  className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-md transition-transform hover:scale-105 cursor-pointer"
                >
                  <Heart className="w-7 h-7 fill-white" />
                </button>
              </div>
            </div>
          ) : (
            /* Out of Profiles */
            <div className="w-full bg-white rounded-3xl p-10 shadow-sm border border-stone-200 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <Compass className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-serif font-bold text-stone-900">
                You're all caught up for now!
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                Expand your distance or age filter parameters, or switch to Explore mode to browse singles across other countries.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => setViewMode('explore')}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer"
                >
                  Browse Explore Grid
                </button>

                <button
                  onClick={refreshDiscovery}
                  className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Reset Deck
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Match Celebration Screen Overlay */}
      {activeMatchCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-stone-200 text-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-amber-400 via-rose-500 to-purple-600" />

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold mb-4">
              <Sparkles className="w-3.5 h-3.5 fill-rose-500" />
              <span>It's a Mutual Match!</span>
            </div>

            <h3 className="text-3xl font-serif font-bold text-stone-900 mb-2">
              You and {activeMatchCelebration.profile.name} liked each other
            </h3>
            <p className="text-xs text-stone-500 mb-6">
              Mutual chemistry confirmed. Send a thoughtful opener to start the conversation.
            </p>

            <div className="flex items-center justify-center gap-4 mb-8">
              <img
                src={userProfile?.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                alt="You"
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md ring-2 ring-rose-200"
              />
              <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md">
                <Heart className="w-5 h-5 fill-white" />
              </div>
              <img
                src={activeMatchCelebration.profile.photos?.[0]}
                alt={activeMatchCelebration.profile.name}
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md ring-2 ring-rose-200"
              />
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  const matchId = activeMatchCelebration.match.id;
                  dismissCelebration();
                  onNavigate('chat', { matchId });
                }}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Send Message to {activeMatchCelebration.profile.name}</span>
              </button>

              <button
                onClick={dismissCelebration}
                className="w-full py-2.5 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
              >
                Keep Exploring
              </button>
            </div>
          </div>
        </div>
      )}

      {/* International Upgrade Modal for Card Deck Mode */}
      <InternationalUpgradeModal
        isOpen={upgradeModalOpen}
        targetCountry={upgradeCardTarget?.country}
        targetProfileName={upgradeCardTarget?.name}
        onClose={() => setUpgradeModalOpen(false)}
        onUpgrade={() => {
          setUpgradeModalOpen(false);
          onNavigate('premium_plans');
        }}
        onExplorePakistan={() => {
          setUpgradeModalOpen(false);
          setViewMode('explore');
        }}
      />
    </div>
  );
};

