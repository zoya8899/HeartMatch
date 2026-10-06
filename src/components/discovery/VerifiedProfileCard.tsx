import React, { useState } from 'react';
import {
  Heart,
  X,
  Star,
  ShieldCheck,
  MapPin,
  Clock,
  Sparkles,
  Info,
  Flag,
  Ban,
  Radio,
  Eye,
  CheckCircle,
} from 'lucide-react';
import { UserProfile } from '../../types';

interface VerifiedProfileCardProps {
  profile: UserProfile;
  isLoggedIn: boolean;
  onLike?: (profile: UserProfile) => void;
  onPass?: (profile: UserProfile) => void;
  onSuperLike?: (profile: UserProfile) => void;
  onViewProfile?: (profile: UserProfile) => void;
  onReport?: (profile: UserProfile) => void;
  onBlock?: (profile: UserProfile) => void;
  onVisitorAction?: (actionName: string, profile: UserProfile) => void;
}

const COUNTRY_FLAGS: Record<string, string> = {
  'United States': '🇺🇸',
  'United Kingdom': '🇬🇧',
  'Canada': '🇨🇦',
  'Australia': '🇦🇺',
  'United Arab Emirates': '🇦🇪',
  'Germany': '🇩🇪',
  'France': '🇫🇷',
  'Spain': '🇪🇸',
  'Italy': '🇮🇹',
  'Netherlands': '🇳🇱',
};

export const VerifiedProfileCard: React.FC<VerifiedProfileCardProps> = ({
  profile,
  isLoggedIn,
  onLike,
  onPass,
  onSuperLike,
  onViewProfile,
  onReport,
  onBlock,
  onVisitorAction,
}) => {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [actionFeedback, setActionFeedback] = useState<'liked' | 'passed' | 'superliked' | null>(null);

  const photos = profile.photos && profile.photos.length > 0
    ? profile.photos
    : ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'];

  const flag = COUNTRY_FLAGS[profile.country] || '🌐';

  const isVerifiedGenuinely = profile.verified === true && (profile.verificationStatus === 'verified' || !profile.verificationStatus);

  // Active recently: only when supported by activity data (within last 3 hours)
  const isRecentlyActive = (profile as any).activeRecently === true;
  const isOnline = (profile as any).isOnline === true;

  const handleAction = (e: React.MouseEvent, type: 'like' | 'pass' | 'superlike') => {
    e.stopPropagation();
    if (!isLoggedIn) {
      if (onVisitorAction) onVisitorAction(type, profile);
      return;
    }

    setActionFeedback(type === 'like' ? 'liked' : type === 'pass' ? 'passed' : 'superliked');
    setTimeout(() => {
      setActionFeedback(null);
      if (type === 'like' && onLike) onLike(profile);
      else if (type === 'pass' && onPass) onPass(profile);
      else if (type === 'superlike' && onSuperLike) onSuperLike(profile);
    }, 350);
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewProfile) onViewProfile(profile);
  };

  return (
    <div
      onClick={handleView}
      className={`group relative bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer ${
        actionFeedback === 'liked'
          ? 'ring-4 ring-rose-400 scale-[0.98]'
          : actionFeedback === 'passed'
          ? 'opacity-40 scale-[0.98]'
          : actionFeedback === 'superliked'
          ? 'ring-4 ring-amber-400 scale-[0.98]'
          : ''
      }`}
    >
      {/* Photo Area */}
      <div className="relative aspect-[3/4] w-full bg-stone-900 overflow-hidden select-none">
        <img
          src={photos[photoIndex]}
          alt={profile.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/20 to-stone-950/30" />

        {/* Top Badges Row */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
          {/* Genuine Verification Badge */}
          {isVerifiedGenuinely ? (
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/90 backdrop-blur-md text-white text-[11px] font-bold shadow-md tracking-wide"
              title="Identity & Age Verified (18+ Government ID & Live Selfie Match)"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified 18+</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-stone-300 text-[10px] font-medium">
              <span>Member</span>
            </div>
          )}

          {/* Activity indicator: Online Now or Active Recently */}
          {isOnline ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 backdrop-blur-md border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Online Now</span>
            </div>
          ) : isRecentlyActive ? (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-900/80 backdrop-blur-md text-stone-200 text-[10px] font-medium">
              <Clock className="w-3 h-3 text-stone-400" />
              <span>Active recently</span>
            </div>
          ) : null}
        </div>

        {/* Multi-photo switcher if available */}
        {photos.length > 1 && (
          <div className="absolute top-12 inset-x-3 flex items-center gap-1 z-10">
            {photos.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPhotoIndex(i);
                }}
                className={`h-1 flex-1 rounded-full transition-all ${
                  i === photoIndex ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        )}

        {/* Bottom Details Inside Photo */}
        <div className="absolute bottom-3 inset-x-4 text-white z-10">
          {/* Name & Age */}
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <h3 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-white drop-shadow-xs">
                {profile.name}, {profile.age}
              </h3>
            </div>
            <span className="text-xl" title={profile.country}>{flag}</span>
          </div>

          {/* Location: Country + City only when user has chosen to display it */}
          <div className="flex items-center gap-1 text-xs text-stone-200 mt-1">
            <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="truncate">
              {profile.showCity !== false && profile.city ? `${profile.city}, ` : ''}
              {profile.country}
            </span>
          </div>

          {/* Relationship Goal Badge */}
          {profile.relationshipGoal && (
            <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-[10px] font-medium text-stone-100 border border-white/10 capitalize">
              <Sparkles className="w-2.5 h-2.5 text-amber-300" />
              <span>{profile.relationshipGoal.replace('-', ' ')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3 text-left bg-white">
        {/* Short Bio */}
        <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
          {profile.bio || 'Looking for genuine adult connections with mutual respect and chemistry.'}
        </p>

        {/* 2-4 Interests */}
        {profile.interests && profile.interests.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {profile.interests.slice(0, 3).map((item, idx) => (
              <span
                key={idx}
                className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200"
              >
                {item}
              </span>
            ))}
            {profile.interests.length > 3 && (
              <span className="text-[10px] text-stone-400 self-center">
                +{profile.interests.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Action Buttons Toolbar */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-1">
          {/* Left mini tools: Report / Block */}
          {isLoggedIn ? (
            <div className="flex items-center gap-1 text-stone-400">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onReport) onReport(profile);
                }}
                className="p-1.5 rounded-lg hover:bg-stone-100 hover:text-stone-700 transition-colors"
                title="Report Profile"
                aria-label={`Report ${profile.name}'s profile`}
              >
                <Flag className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onBlock) onBlock(profile);
                }}
                className="p-1.5 rounded-lg hover:bg-stone-100 hover:text-stone-700 transition-colors"
                title="Block Profile"
                aria-label={`Block ${profile.name}'s profile`}
              >
                <Ban className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <span className="text-[10px] text-stone-400 font-medium">18+ Verified Member</span>
          )}

          {/* Primary Action Buttons: Pass, Super Like, Like */}
          <div className="flex items-center gap-1.5">
            {/* Pass */}
            <button
              type="button"
              onClick={(e) => handleAction(e, 'pass')}
              className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-transform hover:scale-105 cursor-pointer"
              title="Pass"
              aria-label={`Pass on ${profile.name}`}
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* Super Like */}
            <button
              type="button"
              onClick={(e) => handleAction(e, 'superlike')}
              className="w-9 h-9 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-500 flex items-center justify-center transition-transform hover:scale-105 cursor-pointer"
              title="Super Like"
              aria-label={`Super Like ${profile.name}`}
            >
              <Star className="w-4 h-4 fill-amber-500" />
            </button>

            {/* Like */}
            <button
              type="button"
              onClick={(e) => handleAction(e, 'like')}
              className="w-10 h-10 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-sm hover:shadow-md transition-transform hover:scale-105 cursor-pointer"
              title="Like"
              aria-label={`Like ${profile.name}`}
            >
              <Heart className="w-5 h-5 fill-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
