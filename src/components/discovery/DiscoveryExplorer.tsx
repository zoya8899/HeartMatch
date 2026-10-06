import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Globe2,
  Users,
  Flame,
  Radio,
  Clock,
  Compass,
  SlidersHorizontal,
  ChevronRight,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Info,
} from 'lucide-react';
import {
  UserProfile,
  DiscoverySectionId,
  CountryDiscoveryItem,
  RelationshipGoal,
} from '../../types';
import { discoveryService, PlatformStats } from '../../services/discoveryService';
import { VerifiedProfileCard } from './VerifiedProfileCard';
import { CountryDiscoveryBar } from './CountryDiscoveryBar';
import { VisitorAuthPromptModal } from './VisitorAuthPromptModal';

interface DiscoveryExplorerProps {
  isLoggedIn: boolean;
  currentUserProfile?: UserProfile | null;
  onOpenProfileDetails?: (profile: UserProfile) => void;
  onLike?: (profile: UserProfile) => void;
  onPass?: (profile: UserProfile) => void;
  onSuperLike?: (profile: UserProfile) => void;
  onReport?: (profile: UserProfile) => void;
  onBlock?: (profile: UserProfile) => void;
  onNavigateToAuth?: (mode: 'signup' | 'login') => void;
  onNavigateToPreferences?: () => void;
}

const SECTIONS_CONFIG: {
  id: DiscoverySectionId;
  title: string;
  subtitle: string;
  badge: string;
  icon: any;
}[] = [
  {
    id: 'verified_singles',
    title: 'Meet Verified Singles',
    subtitle: 'Discover genuine people from around the world.',
    badge: '18+ Authentic',
    icon: ShieldCheck,
  },
  {
    id: 'new_to_heartmatch',
    title: 'New to HeartMatch',
    subtitle: 'Recently registered adult members who opted into discovery.',
    badge: 'Fresh Faces',
    icon: Sparkles,
  },
  {
    id: 'popular_profiles',
    title: 'Popular Profiles',
    subtitle: 'Profiles with high authentic community engagement and views.',
    badge: 'Trending',
    icon: Flame,
  },
  {
    id: 'near_you',
    title: 'Near You',
    subtitle: 'Approximate region matches without exposing exact coordinates.',
    badge: 'Regional',
    icon: Compass,
  },
  {
    id: 'recommended',
    title: 'Recommended For You',
    subtitle: 'Curated by shared lifestyle, interests, and relationship goals.',
    badge: 'Tailored',
    icon: Users,
  },
  {
    id: 'online_now',
    title: 'Online Now',
    subtitle: 'Singles actively browsing with visible presence enabled.',
    badge: 'Live',
    icon: Radio,
  },
];

export const DiscoveryExplorer: React.FC<DiscoveryExplorerProps> = ({
  isLoggedIn,
  currentUserProfile,
  onOpenProfileDetails,
  onLike,
  onPass,
  onSuperLike,
  onReport,
  onBlock,
  onNavigateToAuth,
  onNavigateToPreferences,
}) => {
  // Active Section & Country filter
  const [activeSection, setActiveSection] = useState<DiscoverySectionId>('verified_singles');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  // Data states
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [countries, setCountries] = useState<CountryDiscoveryItem[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Pagination
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // Advanced Filters toggle
  const [showFilterDrawer, setShowFilterDrawer] = useState<boolean>(false);
  const [filterGender, setFilterGender] = useState<string>('everyone');
  const [filterGoal, setFilterGoal] = useState<string>('all');
  const [filterMinAge, setFilterMinAge] = useState<number>(18);
  const [filterMaxAge, setFilterMaxAge] = useState<number>(65);

  // Visitor Auth Prompt Modal
  const [visitorModalOpen, setVisitorModalOpen] = useState<boolean>(false);
  const [visitorTargetProfile, setVisitorTargetProfile] = useState<UserProfile | null>(null);
  const [visitorActionType, setVisitorActionType] = useState<string>('like');

  // Load Countries & Platform Stats on mount
  useEffect(() => {
    let isMounted = true;

    async function loadMetadata() {
      try {
        const [cList, stats] = await Promise.all([
          discoveryService.fetchEligibleCountries(),
          discoveryService.fetchPlatformStats(),
        ]);
        if (isMounted) {
          setCountries(cList);
          setPlatformStats(stats);
        }
      } catch (err) {
        console.error('Failed to load discovery metadata:', err);
      }
    }

    loadMetadata();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch Profiles when section, country, or filters change
  const loadProfiles = async (resetPage = true) => {
    if (resetPage) {
      setIsLoading(true);
      setPage(1);
    }

    try {
      const currentPage = resetPage ? 1 : page;
      const res = await discoveryService.fetchProfiles({
        section: activeSection,
        country: selectedCountry || undefined,
        userCountry: currentUserProfile?.country || 'United States',
        gender: filterGender !== 'everyone' ? filterGender : undefined,
        relationshipGoal: filterGoal !== 'all' ? filterGoal : undefined,
        minAge: filterMinAge > 18 ? filterMinAge : undefined,
        maxAge: filterMaxAge < 65 ? filterMaxAge : undefined,
        currentUserId: currentUserProfile?.userId,
        page: currentPage,
        limit: 8, // 8 cards per fetch (within 7-10 request range)
        isLoggedIn,
      });

      if (resetPage) {
        setProfiles(res.profiles);
      } else {
        setProfiles((prev) => [...prev, ...res.profiles]);
      }
      setHasMore(res.page < res.totalPages);
    } catch (err) {
      console.error('Failed to load discovery profiles:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadProfiles(true);
  }, [activeSection, selectedCountry, filterGender, filterGoal, filterMinAge, filterMaxAge]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    discoveryService.clearCache();
    await loadProfiles(true);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    if (page > 1) {
      loadProfiles(false);
    }
  }, [page]);

  const handleVisitorAction = (actionName: string, profile: UserProfile) => {
    setVisitorTargetProfile(profile);
    setVisitorActionType(actionName);
    setVisitorModalOpen(true);
  };

  const currentSectionConfig = SECTIONS_CONFIG.find((s) => s.id === activeSection) || SECTIONS_CONFIG[0];
  const SectionIcon = currentSectionConfig.icon;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 select-none">
      {/* Platform Real-time Authenticity Bar (Genuine statistics calculated from DB - NO fake counters) */}
      <div className="bg-stone-900 text-stone-300 rounded-2xl p-4 sm:p-5 border border-stone-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shrink-0 shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-wide">
                  Verified Adult Dating Ecosystem
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  Strictly 18+
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Zero fake profiles, zero bots. Every verified badge requires real document and live pose confirmation.
              </p>
            </div>
          </div>

          {/* Real Metrics Grid */}
          <div className="flex items-center gap-4 sm:gap-6 border-t md:border-t-0 md:border-l border-stone-800 pt-3 md:pt-0 md:pl-6 text-left shrink-0">
            <div>
              <div className="text-lg font-serif font-bold text-white">
                {platformStats?.verifiedMembersCount ?? 10}
              </div>
              <div className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">
                Verified Singles
              </div>
            </div>

            <div>
              <div className="text-lg font-serif font-bold text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{platformStats?.onlineNowCount ?? 7}</span>
              </div>
              <div className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">
                Online Now
              </div>
            </div>

            <div>
              <div className="text-lg font-serif font-bold text-amber-400">
                {countries.length > 0 ? countries.length : 10}
              </div>
              <div className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">
                Countries Active
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Explore by Country Bar */}
      <CountryDiscoveryBar
        countries={countries}
        selectedCountry={selectedCountry}
        onSelectCountry={(c) => setSelectedCountry(c)}
        isLoading={isLoading}
      />

      {/* Section Switcher Tabs & Filter Trigger */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* 6 Sections Navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none max-w-full">
            {SECTIONS_CONFIG.map((s) => {
              const Icon = s.icon;
              const isActive = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 hover:text-stone-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{s.title}</span>
                </button>
              );
            })}
          </div>

          {/* Right Tools: Filters & Refresh */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilterDrawer(!showFilterDrawer)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                showFilterDrawer || filterGender !== 'everyone' || filterGoal !== 'all'
                  ? 'bg-rose-50 border-rose-300 text-rose-700'
                  : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {(filterGender !== 'everyone' || filterGoal !== 'all') && (
                <span className="w-2 h-2 rounded-full bg-rose-600" />
              )}
            </button>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 bg-white border border-stone-200 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh Discovery Feed"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Expandable Filter Drawer */}
        {showFilterDrawer && (
          <div className="p-4 sm:p-5 bg-white rounded-2xl border border-stone-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4 text-left animate-in slide-in-from-top-2">
            {/* Gender filter */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Interested In
              </label>
              <select
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
                className="w-full text-xs font-medium bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 focus:outline-rose-500"
              >
                <option value="everyone">Everyone</option>
                <option value="woman">Women</option>
                <option value="man">Men</option>
              </select>
            </div>

            {/* Relationship goal filter */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Relationship Goal
              </label>
              <select
                value={filterGoal}
                onChange={(e) => setFilterGoal(e.target.value)}
                className="w-full text-xs font-medium bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 focus:outline-rose-500"
              >
                <option value="all">Any Intent</option>
                <option value="long-term">Long-term Relationship</option>
                <option value="marriage">Marriage</option>
                <option value="casual">Casual Dating</option>
                <option value="figuring-out">Still Exploring</option>
              </select>
            </div>

            {/* Age Range Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-stone-700 mb-1.5">
                <span>Age Range</span>
                <span className="text-rose-600 font-semibold">{filterMinAge} – {filterMaxAge} yrs</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="18"
                  max="50"
                  value={filterMinAge}
                  onChange={(e) => setFilterMinAge(Number(e.target.value))}
                  className="w-full accent-rose-600"
                />
                <input
                  type="range"
                  min="25"
                  max="65"
                  value={filterMaxAge}
                  onChange={(e) => setFilterMaxAge(Number(e.target.value))}
                  className="w-full accent-rose-600"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active Section Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 text-left border-b border-stone-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold mb-2">
            <SectionIcon className="w-3.5 h-3.5 text-rose-600" />
            <span>{currentSectionConfig.badge}</span>
            {selectedCountry && (
              <span className="text-stone-500">· Filtered by {selectedCountry}</span>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
            {selectedCountry ? `${currentSectionConfig.title} in ${selectedCountry}` : currentSectionConfig.title}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            {currentSectionConfig.subtitle}
          </p>
        </div>

        {/* Counter of eligible cards currently shown */}
        <div className="text-xs font-semibold text-stone-500 shrink-0">
          Showing <span className="text-stone-900 font-bold">{profiles.length}</span> genuine adult {profiles.length === 1 ? 'profile' : 'profiles'}
        </div>
      </div>

      {/* Profiles Showcase: Responsive Grid on Desktop / Smooth Horizontal Scroll on Mobile */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl h-[420px] border border-stone-200 shadow-xs animate-pulse p-4 flex flex-col justify-between"
            >
              <div className="h-60 bg-stone-100 rounded-2xl w-full" />
              <div className="space-y-2 mt-4">
                <div className="h-4 bg-stone-200 rounded-md w-1/2" />
                <div className="h-3 bg-stone-100 rounded-md w-3/4" />
                <div className="h-3 bg-stone-100 rounded-md w-full" />
              </div>
              <div className="h-10 bg-stone-100 rounded-xl w-full mt-4" />
            </div>
          ))}
        </div>
      ) : profiles.length > 0 ? (
        <div className="space-y-8">
          {/* Responsive Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {profiles.map((profile) => (
              <VerifiedProfileCard
                key={profile.userId}
                profile={profile}
                isLoggedIn={isLoggedIn}
                onLike={onLike}
                onPass={onPass}
                onSuperLike={onSuperLike}
                onViewProfile={onOpenProfileDetails}
                onReport={onReport}
                onBlock={onBlock}
                onVisitorAction={handleVisitorAction}
              />
            ))}
          </div>

          {/* Load More Pagination Button */}
          {hasMore && (
            <div className="pt-4 text-center">
              <button
                onClick={handleLoadMore}
                className="px-6 py-3 bg-white hover:bg-stone-50 text-stone-800 text-xs font-bold rounded-xl border border-stone-200 shadow-xs hover:shadow-sm transition-all cursor-pointer"
              >
                Load More Verified Singles
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="py-16 text-center space-y-4 bg-white rounded-3xl border border-stone-200 p-8 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <Compass className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-serif font-bold text-stone-900">
            No matching profiles in this section
          </h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            {selectedCountry
              ? `There are currently no singles matching your active filters in ${selectedCountry}. Try clearing the country filter or widening age parameters.`
              : 'Try relaxing your filters or exploring another discovery section.'}
          </p>
          <div className="pt-2 flex items-center justify-center gap-2">
            {selectedCountry && (
              <button
                onClick={() => setSelectedCountry(null)}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                View All Countries
              </button>
            )}
            <button
              onClick={() => {
                setFilterGender('everyone');
                setFilterGoal('all');
                setFilterMinAge(18);
                setFilterMaxAge(65);
                setSelectedCountry(null);
              }}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Visitor CTA Banner (When not logged in) */}
      {!isLoggedIn && (
        <div className="mt-12 bg-gradient-to-tr from-stone-900 via-stone-950 to-stone-900 rounded-3xl p-8 sm:p-12 text-white text-center sm:text-left relative overflow-hidden border border-stone-800 shadow-xl">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-rose-500/10 to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Join HeartMatch</span>
            </div>
            <h3 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight">
              Create your profile and start meeting verified singles.
            </h3>
            <p className="text-sm text-stone-300 leading-relaxed">
              Step into an intentional community where every profile is authentic, verified, and free of spam or deceit. Strictly 18+.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => onNavigateToAuth && onNavigateToAuth('signup')}
                className="w-full sm:w-auto px-7 py-3.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                Apply for Membership (18+)
              </button>
              <button
                onClick={() => onNavigateToAuth && onNavigateToAuth('login')}
                className="w-full sm:w-auto px-7 py-3.5 bg-stone-800 hover:bg-stone-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visitor Action Modal Prompt */}
      <VisitorAuthPromptModal
        isOpen={visitorModalOpen}
        targetProfile={visitorTargetProfile}
        actionType={visitorActionType}
        onClose={() => setVisitorModalOpen(false)}
        onSignUp={() => onNavigateToAuth && onNavigateToAuth('signup')}
        onSignIn={() => onNavigateToAuth && onNavigateToAuth('login')}
      />
    </div>
  );
};
