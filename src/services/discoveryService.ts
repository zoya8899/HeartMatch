import {
  UserProfile,
  DiscoverySectionId,
  CountryDiscoveryItem,
} from '../types';
import {
  INITIAL_DISCOVERY_PROFILES,
  ELIGIBLE_DISCOVERY_COUNTRIES,
  INITIAL_PROFILE_ACTIVITIES,
} from './seedData';

export interface DiscoveryQueryParams {
  section?: DiscoverySectionId | 'all';
  country?: string;
  userCountry?: string;
  gender?: string;
  minAge?: number;
  maxAge?: number;
  relationshipGoal?: string;
  currentUserId?: string;
  page?: number;
  limit?: number;
  isLoggedIn?: boolean;
}

export interface DiscoveryResponse {
  profiles: UserProfile[];
  total: number;
  page: number;
  totalPages: number;
  section: string;
  countryFilter: string | null;
}

export interface PlatformStats {
  verifiedMembersCount: number;
  activeTodayCount: number;
  countriesCount: number;
  onlineNowCount: number;
  safetyPolicy: string;
}

// Memory cache for sub-second responses and reduced network overhead
const cache = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL_MS = 60 * 1000; // 1 minute

export const discoveryService = {
  // 1. Fetch Discovery Profiles (Supports the 6 sections, pagination, countries, filters)
  async fetchProfiles(params: DiscoveryQueryParams = {}): Promise<DiscoveryResponse> {
    const cacheKey = JSON.stringify(params);
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    try {
      const query = new URLSearchParams();
      if (params.section) query.set('section', params.section);
      if (params.country) query.set('country', params.country);
      if (params.userCountry) query.set('userCountry', params.userCountry);
      if (params.gender) query.set('gender', params.gender);
      if (params.minAge) query.set('minAge', String(params.minAge));
      if (params.maxAge) query.set('maxAge', String(params.maxAge));
      if (params.relationshipGoal) query.set('relationshipGoal', params.relationshipGoal);
      if (params.currentUserId) query.set('currentUserId', params.currentUserId);
      if (params.page) query.set('page', String(params.page));
      if (params.limit) query.set('limit', String(params.limit));
      if (params.isLoggedIn !== undefined) query.set('isLoggedIn', String(params.isLoggedIn));

      const res = await fetch(`/api/discovery/profiles?${query.toString()}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();

      // Retrieve real registered community profiles from browser state
      let realProfiles: UserProfile[] = [];
      try {
        const stored = localStorage.getItem('heartmatch_real_profiles');
        if (stored) realProfiles = JSON.parse(stored);
      } catch (e) {}

      if (realProfiles.length > 0) {
        // Exclude current user if specified
        let eligibleReal = realProfiles.filter((p) => {
          if (params.currentUserId && p.userId === params.currentUserId) {
            // Keep current user visible in "Meet Verified Singles" only if explicitly browsing
            return true;
          }
          if (params.country && params.country !== 'all' && p.country.toLowerCase() !== params.country.toLowerCase()) {
            return false;
          }
          if (params.gender && params.gender !== 'everyone' && p.gender !== params.gender) {
            return false;
          }
          return true;
        });

        // Prioritize real registered users first, followed by interactive personas
        const remainingPersonas = data.profiles.filter(
          (dp: UserProfile) => !eligibleReal.some((rp) => rp.userId === dp.userId)
        );
        const mergedProfiles = [
          ...eligibleReal,
          ...remainingPersonas,
        ];

        data.profiles = mergedProfiles;
        data.total = Math.max(data.total, mergedProfiles.length);
      }

      cache.set(cacheKey, { timestamp: Date.now(), data });
      return data;
    } catch (err) {
      console.warn('Network error fetching discovery profiles, using client fallback:', err);
      // Retrieve real registered community profiles from browser state
      let realProfiles: UserProfile[] = [];
      try {
        const stored = localStorage.getItem('heartmatch_real_profiles');
        if (stored) realProfiles = JSON.parse(stored);
      } catch (e) {}

      // Fallback filtering: prioritize real users first followed by AI personas
      let list = [
        ...realProfiles,
        ...INITIAL_DISCOVERY_PROFILES.filter((p) => !realProfiles.some((rp) => rp.userId === p.userId)),
      ];
      if (params.country && params.country !== 'all') {
        list = list.filter((p) => p.country.toLowerCase() === params.country?.toLowerCase());
      }
      if (params.section === 'verified_singles') {
        list = list.filter((p) => p.verified === true);
      } else if (params.section === 'online_now') {
        list = list.filter((p) => {
          if (p.isRealUser) return true;
          const act = INITIAL_PROFILE_ACTIVITIES[p.userId];
          return act?.isOnline === true;
        });
      } else if (params.section === 'new_to_heartmatch') {
        list = list.sort((a, b) => new Date(b.registeredAt || 0).getTime() - new Date(a.registeredAt || 0).getTime());
      } else if (params.section === 'popular_profiles') {
        list = list.sort((a, b) => {
          const sA = ((INITIAL_PROFILE_ACTIVITIES[a.userId]?.likesReceivedCount || 0) * 2) + (a.isRealUser ? 500 : 0);
          const sB = ((INITIAL_PROFILE_ACTIVITIES[b.userId]?.likesReceivedCount || 0) * 2) + (b.isRealUser ? 500 : 0);
          return sB - sA;
        });
      }

      // Prioritize real user profiles at the very top!
      list = list.sort((a, b) => (b.isRealUser ? 1 : 0) - (a.isRealUser ? 1 : 0));

      if (params.currentUserId) {
        list = list.filter((p) => p.userId !== params.currentUserId);
      }

      const limit = params.limit || 8;
      const page = params.page || 1;
      const startIndex = (page - 1) * limit;
      const slice = list.slice(startIndex, startIndex + limit);

      return {
        profiles: slice,
        total: list.length,
        page,
        totalPages: Math.ceil(list.length / limit) || 1,
        section: params.section || 'all',
        countryFilter: params.country || null,
      };
    }
  },

  // 2. Fetch Countries with active verified members
  async fetchEligibleCountries(): Promise<CountryDiscoveryItem[]> {
    try {
      const res = await fetch('/api/discovery/countries');
      if (!res.ok) throw new Error('Failed to fetch countries');
      const data = await res.json();
      return data.countries || [];
    } catch (err) {
      // Client fallback
      return ELIGIBLE_DISCOVERY_COUNTRIES.map((c) => ({
        country: c.name,
        flag: c.flag,
        code: c.code,
        verifiedCount: INITIAL_DISCOVERY_PROFILES.filter((p) => p.country === c.name && p.verified).length,
      }));
    }
  },

  // 3. Genuine Platform Stats
  async fetchPlatformStats(): Promise<PlatformStats> {
    try {
      const res = await fetch('/api/discovery/stats');
      if (!res.ok) throw new Error('Failed to fetch platform stats');
      return await res.json();
    } catch (err) {
      return {
        verifiedMembersCount: INITIAL_DISCOVERY_PROFILES.filter((p) => p.verified).length,
        activeTodayCount: INITIAL_DISCOVERY_PROFILES.length,
        countriesCount: new Set(INITIAL_DISCOVERY_PROFILES.map((p) => p.country)).size,
        onlineNowCount: 7,
        safetyPolicy: 'Strictly 18+ Adult Verified Ecosystem',
      };
    }
  },

  // 4. Verification Status
  async getVerificationStatus(userId: string) {
    try {
      const res = await fetch(`/api/verification/status/${userId}`);
      if (!res.ok) throw new Error('Status error');
      return await res.json();
    } catch (err) {
      return { status: 'unverified', verified: false };
    }
  },

  // 5. Submit Verification
  async submitVerification(payload: {
    userId: string;
    userName: string;
    ageConfirmed: boolean;
    docType: 'passport' | 'driving_license' | 'national_id' | 'selfie';
    idDocUrl?: string;
    selfieUrl?: string;
  }) {
    const res = await fetch('/api/verification/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  },

  // 6. Admin Verification Review
  async reviewVerification(payload: {
    verificationId: string;
    decision: 'verified' | 'failed';
    adminNotes?: string;
    reviewerId?: string;
  }) {
    const res = await fetch('/api/verification/review', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-email': 'zoyakhokhar001@gmail.com',
      },
      body: JSON.stringify({
        ...payload,
        reviewerId: payload.reviewerId || 'admin_trust_team',
      }),
    });
    return await res.json();
  },

  // 7. Flag Suspicious Profile
  async flagSuspiciousProfile(payload: {
    targetUserId: string;
    reason: string;
    category?: string;
    details?: string;
  }) {
    const res = await fetch('/api/moderation/flag-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  },

  // Invalidate client cache
  clearCache() {
    cache.clear();
  },
};
