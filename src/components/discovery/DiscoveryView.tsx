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
  Globe2,
  CheckCircle2,
  Info,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  MessageCircle,
  Sparkles,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useMatch } from '../../contexts/MatchContext';
import { UserPreference, UserProfile } from '../../types';

interface DiscoveryViewProps {
  onOpenMatches: (targetMatchId?: string) => void;
  onOpenPremium: () => void;
  onOpenSafetyModal: (targetUserId: string, targetName: string) => void;
}

export const DiscoveryView: React.FC<DiscoveryViewProps> = ({
  onOpenMatches,
  onOpenPremium,
  onOpenSafetyModal,
}) => {
  const { userProfile, userPreference, updatePreferenceData, subscription } = useAuth();
  const {
    currentCard,
    swipe,
    rewindLastSwipe,
    triggerProfileBoost,
    activeBoost,
    activeMatchCelebration,
    dismissCelebration,
    historyQueue,
    refreshDiscovery,
  } = useMatch();

  const [currentPhotoIdx, setCurrentPhotoIdx] = useState<number>(0);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);

  // Filter state
  const [filterMinAge, setFilterMinAge] = useState<number>(userPreference?.minAge || 21);
  const [filterMaxAge, setFilterMaxAge] = useState<number>(userPreference?.maxAge || 40);
  const [filterDistance, setFilterDistance] = useState<number>(userPreference?.maxDistanceKm || 50);
  const [filterInterestedIn, setFilterInterestedIn] = useState<UserPreference['interestedIn']>(
    userPreference?.interestedIn || 'everyone'
  );
  const [filterVerifiedOnly, setFilterVerifiedOnly] = useState<boolean>(
    userPreference?.verifiedOnly || false
  );

  const photos = currentCard?.photos && currentCard.photos.length > 0
    ? currentCard.photos
    : ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'];

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIdx((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIdx((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleApplyFilters = async () => {
    await updatePreferenceData({
      minAge: filterMinAge,
      maxAge: filterMaxAge,
      maxDistanceKm: filterDistance,
      interestedIn: filterInterestedIn,
      verifiedOnly: filterVerifiedOnly,
    });
    setShowFilterModal(false);
    refreshDiscovery();
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 text-left flex flex-col items-center">
      {/* Top Controls: Filter & Boost status */}
      <div className="w-full flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilterModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-50 shadow-xs transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-stone-500" />
            <span>Filters</span>
          </button>

          {activeBoost && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 border border-purple-200 rounded-full text-xs font-semibold text-purple-700 animate-pulse">
              <Zap className="w-3 h-3 fill-purple-600" />
              <span>Boost Active</span>
            </div>
          )}
        </div>

        <button
          onClick={() => triggerProfileBoost('boost')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-xs font-semibold hover:opacity-95 shadow-xs transition-all"
        >
          <Zap className="w-3.5 h-3.5 fill-white" />
          <span>Boost Me</span>
        </button>
      </div>

      {/* Main Card Container */}
      {currentCard ? (
        <div className="w-full bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden relative transition-all">
          {/* Photos Carousel */}
          <div
            className="relative h-[480px] sm:h-[520px] w-full bg-stone-900 cursor-pointer select-none group"
            onClick={() => setShowDetails(!showDetails)}
          >
            <img
              src={photos[currentPhotoIdx]}
              alt={currentCard.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/20 to-transparent" />

            {/* Photo Segment Indicators */}
            {photos.length > 1 && (
              <div className="absolute top-3 inset-x-3 flex items-center gap-1 z-10">
                {photos.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1 flex-1 rounded-full transition-all ${
                      idx === currentPhotoIdx ? 'bg-white' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Prev/Next Click Areas */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white opacity-0 group-hover:opacity-100 hover:bg-black/60 transition-opacity"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextPhoto}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white opacity-0 group-hover:opacity-100 hover:bg-black/60 transition-opacity"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Verified & Adult Badges */}
            <div className="absolute top-6 left-4 flex items-center gap-1.5 z-10">
              {currentCard.verified && (
                <div className="bg-emerald-500/90 backdrop-blur text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified 18+</span>
                </div>
              )}
            </div>

            {/* Card Bottom Meta */}
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
                    setShowDetails(!showDetails);
                  }}
                  className="p-1.5 bg-white/20 backdrop-blur hover:bg-white/30 rounded-full text-white transition-colors"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>

              {/* Approximate Location - Never exact */}
              <div className="flex items-center gap-1.5 text-xs text-stone-300 mt-1">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>{currentCard.city}, {currentCard.country} · Approx. 8 km away</span>
              </div>

              {/* Preview Bio */}
              <p className="text-xs text-stone-200 mt-2 line-clamp-2 leading-relaxed">
                {currentCard.bio}
              </p>

              {/* Top Interests preview */}
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

          {/* Expanded Profile Details Drawer */}
          {showDetails && (
            <div className="p-6 bg-white border-t border-stone-100 space-y-5 animate-in slide-in-from-bottom-2">
              <div>
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-1.5">
                  About {currentCard.name}
                </h4>
                <p className="text-xs text-stone-700 leading-relaxed">{currentCard.bio}</p>
              </div>

              {/* Attributes Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs text-stone-700 border-y border-stone-100 py-4">
                {currentCard.profession && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-stone-400" />
                    <span>{currentCard.profession}</span>
                  </div>
                )}
                {currentCard.education && (
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-stone-400" />
                    <span>{currentCard.education}</span>
                  </div>
                )}
                {currentCard.relationshipGoal && (
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span className="capitalize">Goal: {currentCard.relationshipGoal.replace('-', ' ')}</span>
                  </div>
                )}
                {currentCard.languages && currentCard.languages.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Globe2 className="w-4 h-4 text-stone-400" />
                    <span>{currentCard.languages.join(', ')}</span>
                  </div>
                )}
              </div>

              {/* Hobbies & Passions */}
              {currentCard.hobbies && currentCard.hobbies.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
                    Hobbies & Weekend Activities
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {currentCard.hobbies.map((h, i) => (
                      <span
                        key={i}
                        className="text-xs bg-stone-100 text-stone-800 px-3 py-1 rounded-md"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Safety Action: Report / Block */}
              <div className="pt-2 flex items-center justify-between text-xs text-stone-400">
                <span>18+ Verified Adult</span>
                <button
                  onClick={() => onOpenSafetyModal(currentCard.userId, currentCard.name)}
                  className="hover:text-rose-600 transition-colors"
                >
                  Report or Block
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons Toolbar */}
          <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-center gap-4 sm:gap-6">
            {/* Rewind */}
            <button
              onClick={rewindLastSwipe}
              disabled={historyQueue.length === 0}
              title="Rewind Last Swipe"
              className="w-12 h-12 rounded-full bg-white border border-stone-200 text-stone-600 hover:text-amber-600 hover:border-amber-300 flex items-center justify-center shadow-xs transition-transform hover:scale-105 disabled:opacity-40"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {/* Pass */}
            <button
              onClick={() => swipe('pass')}
              title="Pass"
              className="w-14 h-14 rounded-full bg-white border border-stone-200 text-stone-500 hover:text-rose-600 hover:border-rose-300 flex items-center justify-center shadow-xs transition-transform hover:scale-105"
            >
              <X className="w-6 h-6 stroke-[2.5]" />
            </button>

            {/* Super Like */}
            <button
              onClick={() => swipe('superlike')}
              title="Super Like"
              className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-500 hover:bg-amber-100 flex items-center justify-center shadow-xs transition-transform hover:scale-105"
            >
              <Star className="w-5 h-5 fill-amber-500" />
            </button>

            {/* Like */}
            <button
              onClick={() => swipe('like')}
              title="Like"
              className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-md transition-transform hover:scale-105"
            >
              <Heart className="w-7 h-7 fill-white" />
            </button>
          </div>
        </div>
      ) : (
        /* Empty State: Out of Profiles */
        <div className="w-full bg-white rounded-3xl p-10 shadow-sm border border-stone-200 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <Compass className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-serif font-bold text-stone-900">
            You've seen all nearby profiles
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
            Expand your age or distance preferences, or activate a Profile Boost to be seen by new members in your area.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setShowFilterModal(true)}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-xs"
            >
              Adjust Filter Settings
            </button>

            <button
              onClick={refreshDiscovery}
              className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg"
            >
              Reset Discovery Feed
            </button>
          </div>
        </div>
      )}

      {/* Match Celebration Modal with Confetti */}
      {activeMatchCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-in fade-in">
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
              You both share mutual chemistry. Start the conversation with an authentic opener.
            </p>

            {/* Profile Avatar Pair */}
            <div className="flex items-center justify-center gap-4 mb-8">
              {userProfile?.photos?.[0] ? (
                <img
                  src={userProfile.photos[0]}
                  alt="You"
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md ring-2 ring-rose-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-rose-600 to-rose-400 text-white font-bold text-2xl flex items-center justify-center border-4 border-white shadow-md ring-2 ring-rose-200">
                  {userProfile?.name?.charAt(0)?.toUpperCase() || '👤'}
                </div>
              )}
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
                  onOpenMatches(matchId);
                }}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Send Message to {activeMatchCelebration.profile.name}</span>
              </button>

              <button
                onClick={dismissCelebration}
                className="w-full py-2.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
              >
                Keep Swiping
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-bold text-stone-900">Discovery Filters</h3>
              <button
                onClick={() => setShowFilterModal(false)}
                className="p-1 rounded-md text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Age Range Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-stone-700 mb-1.5">
                <span>Age Range (18+)</span>
                <span className="text-rose-600 font-bold">{filterMinAge} – {filterMaxAge}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] text-stone-400">Min Age</span>
                  <input
                    type="range"
                    min={18}
                    max={65}
                    value={filterMinAge}
                    onChange={(e) => setFilterMinAge(Math.min(Number(e.target.value), filterMaxAge - 1))}
                    className="w-full accent-rose-600"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-stone-400">Max Age</span>
                  <input
                    type="range"
                    min={19}
                    max={75}
                    value={filterMaxAge}
                    onChange={(e) => setFilterMaxAge(Math.max(Number(e.target.value), filterMinAge + 1))}
                    className="w-full accent-rose-600"
                  />
                </div>
              </div>
            </div>

            {/* Distance Range */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-stone-700 mb-1.5">
                <span>Maximum Distance</span>
                <span className="text-rose-600 font-bold">{filterDistance} km</span>
              </div>
              <input
                type="range"
                min={5}
                max={200}
                value={filterDistance}
                onChange={(e) => setFilterDistance(Number(e.target.value))}
                className="w-full accent-rose-600"
              />
            </div>

            {/* Gender Preferences */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Interested In</label>
              <div className="grid grid-cols-3 gap-2">
                {(['men', 'women', 'everyone'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setFilterInterestedIn(opt)}
                    className={`py-2 text-xs font-medium rounded-lg capitalize border ${
                      filterInterestedIn === opt
                        ? 'bg-rose-50 border-rose-500 text-rose-700 font-bold'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Verified Only Toggle */}
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-stone-800">18+ Verified Profiles Only</p>
                <p className="text-[11px] text-stone-400">Only view profiles with verified identity badges</p>
              </div>
              <input
                type="checkbox"
                checked={filterVerifiedOnly}
                onChange={(e) => setFilterVerifiedOnly(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowFilterModal(false)}
                className="w-1/2 py-2.5 border border-stone-300 text-stone-700 text-xs font-medium rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyFilters}
                className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
