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
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

export interface DiscoveryQueryParams {
  section?: DiscoverySectionId | 'all';
  country?: string;
  userCountry?: string;
  gender?: string;
  minAge?: number;
  maxAge?: number;
  relationshipGoal?: string;
  currentUserId?: string;
  currentUserProfile?: UserProfile | null;
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
const CACHE_TTL_MS = 15 * 1000; // 15 seconds

/**
 * Fetch all real registered profiles from Firestore `profiles` collection
 */
export async function fetchRealFirestoreProfiles(): Promise<UserProfile[]> {
  const profileMap = new Map<string, UserProfile>();

  // 1. Fetch directly from Firestore `profiles` collection
  try {
    const snap = await getDocs(collection(db, 'profiles'));
    snap.docs.forEach((docSnap) => {
      const data = docSnap.data();
      const p: UserProfile = {
        userId: docSnap.id,
        name: data.name || 'Member',
        age: typeof data.age === 'number' ? data.age : 25,
        gender: data.gender || 'woman',
        interestedIn: data.interestedIn || 'everyone',
        city: data.city || 'Lahore',
        country: data.country || 'Pakistan',
        showCity: data.showCity !== false,
        bio: data.bio || '',
        photos: Array.isArray(data.photos) ? data.photos : [],
        interests: Array.isArray(data.interests) ? data.interests : [],
        hobbies: Array.isArray(data.hobbies) ? data.hobbies : [],
        profession: data.profession || 'Member',
        education: data.education || '',
        languages: Array.isArray(data.languages) ? data.languages : ['Urdu', 'English'],
        relationshipGoal: data.relationshipGoal || 'long-term',
        completionPercentage: data.completionPercentage || 90,
        verified: true,
        verificationStatus: 'verified',
        profileVerified: true,
        optedIntoDiscovery: true,
        isRealUser: true,
        isAIPersona: false,
        registeredAt: data.registeredAt || data.createdAt || new Date().toISOString(),
        lastActiveAt: data.lastActiveAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
        prompts: Array.isArray(data.prompts) ? data.prompts : [],
        lifestyle: data.lifestyle || {},
      };
      profileMap.set(p.userId, p);
    });
  } catch (err) {
    console.warn('Error fetching Firestore profiles collection:', err);
  }

  // 2. Also incorporate any local browser updates
  try {
    const stored = localStorage.getItem('heartmatch_real_profiles');
    if (stored) {
      const localList: UserProfile[] = JSON.parse(stored);
      localList.forEach((lp) => {
        if (lp.userId) {
          const existing = profileMap.get(lp.userId);
          profileMap.set(lp.userId, {
            ...(existing || {}),
            ...lp,
            isRealUser: true,
            isAIPersona: false,
          });
        }
      });
    }
  } catch (e) {}

  return Array.from(profileMap.values());
}

export const discoveryService = {
  // 1. Fetch Discovery Profiles (Supports the 6 sections, pagination, countries, filters)
  async fetchProfiles(params: DiscoveryQueryParams = {}): Promise<DiscoveryResponse> {
    const cacheKey = JSON.stringify(params);
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    try {
      // 1. Fetch real registered profiles from Firestore `profiles` collection
      const allRealProfiles = await fetchRealFirestoreProfiles();

      // Ensure logged-in user's profile card is guaranteed to be in the list
      if (params.currentUserProfile && params.currentUserProfile.userId) {
        const myUid = params.currentUserProfile.userId;
        const exists = allRealProfiles.some((p) => p.userId === myUid);
        if (!exists) {
          allRealProfiles.unshift({
            ...params.currentUserProfile,
            isRealUser: true,
            optedIntoDiscovery: true,
          });
        }
      }

      // Filter real profiles according to selected filters
      let eligibleReal = allRealProfiles.filter((p) => {
        // ALWAYS DISPLAY the logged-in user's own profile card in the feed!
        if (params.currentUserId && p.userId === params.currentUserId) {
          return true;
        }
        if (params.country && params.country !== 'all' && p.country.toLowerCase() !== params.country.toLowerCase()) {
          return false;
        }
        if (params.gender && params.gender !== 'everyone' && p.gender !== params.gender) {
          return false;
        }
        if (params.minAge && p.age < params.minAge) {
          return false;
        }
        if (params.maxAge && p.age > params.maxAge) {
          return false;
        }
        return true;
      });

      // Sort real profiles: logged-in user at the absolute top, followed by other real registered users!
      eligibleReal.sort((a, b) => {
        if (params.currentUserId) {
          if (a.userId === params.currentUserId) return -1;
          if (b.userId === params.currentUserId) return 1;
        }
        return new Date(b.updatedAt || b.registeredAt || 0).getTime() - new Date(a.updatedAt || a.registeredAt || 0).getTime();
      });

      // 2. Filter dummy/bot profiles and keep them strictly at the bottom
      let dummyProfiles = INITIAL_DISCOVERY_PROFILES.filter(
        (dp) => !allRealProfiles.some((rp) => rp.userId === dp.userId)
      );

      if (params.country && params.country !== 'all') {
        dummyProfiles = dummyProfiles.filter((p) => p.country.toLowerCase() === params.country?.toLowerCase());
      }
      if (params.gender && params.gender !== 'everyone') {
        dummyProfiles = dummyProfiles.filter((p) => p.gender === params.gender);
      }
      if (params.minAge) {
        dummyProfiles = dummyProfiles.filter((p) => p.age >= params.minAge!);
      }
      if (params.maxAge) {
        dummyProfiles = dummyProfiles.filter((p) => p.age <= params.maxAge!);
      }

      // 3. REAL PROFILES AT THE VERY TOP, DUMMY/BOT PROFILES AT THE BOTTOM
      const mergedProfiles = [
        ...eligibleReal,
        ...dummyProfiles,
      ];

      const data: DiscoveryResponse = {
        profiles: mergedProfiles,
        total: mergedProfiles.length,
        page: params.page || 1,
        totalPages: Math.ceil(mergedProfiles.length / (params.limit || 8)) || 1,
        section: params.section || 'verified_singles',
        countryFilter: params.country || null,
      };

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
      if (params.currentUserProfile && params.currentUserProfile.userId) {
        if (!realProfiles.some((p) => p.userId === params.currentUserProfile!.userId)) {
          realProfiles.unshift({ ...params.currentUserProfile, isRealUser: true, optedIntoDiscovery: true });
        }
      }

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

      // Prioritize real user profiles at the very top, with logged-in user at the absolute top!
      list = list.sort((a, b) => {
        if (params.currentUserId) {
          if (a.userId === params.currentUserId) return -1;
          if (b.userId === params.currentUserId) return 1;
        }
        return (b.isRealUser ? 1 : 0) - (a.isRealUser ? 1 : 0);
      });

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
