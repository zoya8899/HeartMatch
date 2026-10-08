import type { ProductItem, UserProfile } from '../types/index.ts';
import { AI_PERSONAS } from './aiPersonas.ts';

export const DEFAULT_PRODUCTS: ProductItem[] = [
  {
    id: '7day_premium',
    title: '7-Day Premium',
    description: 'Perfect for a week of unlimited matches and enhanced discovery.',
    price: 9.99,
    interval: '7days',
    badge: 'Starter',
    category: 'subscription',
    features: [
      'Unlimited Likes',
      'See Who Liked You',
      '5 Free Super Likes',
      '1 Free Profile Boost',
      'Unlimited Rewinds'
    ],
    isActive: true,
  },
  {
    id: 'monthly_premium',
    title: 'Monthly Premium',
    description: 'Our most popular plan for intentional daters looking for real connections.',
    price: 24.99,
    interval: '1month',
    badge: 'Most Popular',
    category: 'subscription',
    features: [
      'All 7-Day features included',
      'Advanced Filters (Lifestyle, Goals)',
      'Incognito Browsing Mode',
      'Priority Likes Delivery',
      '15 Free Super Likes per month',
      '2 Free Boosts per month'
    ],
    isActive: true,
  },
  {
    id: '3month_premium',
    title: '3-Month Premium',
    description: 'Best value for singles committed to finding their special person.',
    price: 49.99,
    interval: '3months',
    badge: 'Best Value',
    category: 'subscription',
    features: [
      'Save over 33% compared to monthly',
      'All Monthly Premium benefits',
      'Continuous Priority Discovery',
      '30 Super Likes bundle',
      '5 Boost passes included',
      'VIP Verified Profile Badge'
    ],
    isActive: true,
  },
  {
    id: 'vip_monthly',
    title: 'VIP Monthly',
    description: 'The ultimate dating experience with personalized AI matchmaking insights.',
    price: 59.99,
    interval: '1month',
    badge: 'Exclusive',
    category: 'subscription',
    features: [
      'Unrestricted VIP Discovery',
      'See Who Liked You instantly',
      'Direct First Message before matching',
      'AI Wingman & Deep Compatibility Reports',
      'Daily Profile Boost during peak hours',
      'Dedicated Priority Safety Concierge'
    ],
    isActive: true,
  },
  // One-time consumables
  {
    id: 'superlikes_pack_5',
    title: '5 Super Likes',
    description: 'Stand out from the crowd and let them know you are genuinely interested.',
    price: 4.99,
    interval: 'one_time',
    category: 'consumable',
    consumableType: 'superlike',
    quantity: 5,
    features: ['3x higher response rate', 'Notifies the person immediately'],
    isActive: true,
  },
  {
    id: 'profile_boost',
    title: 'Profile Boost (30 Mins)',
    description: 'Skip the line and be one of the top profiles in your area for 30 minutes.',
    price: 3.99,
    interval: 'one_time',
    category: 'consumable',
    consumableType: 'boost',
    quantity: 1,
    features: ['Up to 10x more profile views', 'Peak evening visibility'],
    isActive: true,
  },
  {
    id: 'spotlight_pass',
    title: 'Spotlight (1 Hour)',
    description: 'Featured prominently at the top of recommended discovery feeds.',
    price: 7.99,
    interval: 'one_time',
    category: 'consumable',
    consumableType: 'spotlight',
    quantity: 1,
    features: ['Highlighted golden border', 'Top tier placement across your city'],
    isActive: true,
  },
  {
    id: 'rewind_pack_10',
    title: '10 Rewinds',
    description: 'Accidentally passed on someone great? Undo your last swipe instantly.',
    price: 2.99,
    interval: 'one_time',
    category: 'consumable',
    consumableType: 'rewind',
    quantity: 10,
    features: ['Revisit passed profiles', 'Second chance connections'],
    isActive: true,
  }
];

export const ELIGIBLE_DISCOVERY_COUNTRIES: { name: string; flag: string; code: string }[] = [
  { name: 'Pakistan', flag: '🇵🇰', code: 'PK' },
  { name: 'United States', flag: '🇺🇸', code: 'US' },
  { name: 'United Kingdom', flag: '🇬🇧', code: 'GB' },
  { name: 'Canada', flag: '🇨🇦', code: 'CA' },
  { name: 'Australia', flag: '🇦🇺', code: 'AU' },
  { name: 'United Arab Emirates', flag: '🇦🇪', code: 'AE' },
  { name: 'Germany', flag: '🇩🇪', code: 'DE' },
  { name: 'France', flag: '🇫🇷', code: 'FR' },
  { name: 'Spain', flag: '🇪🇸', code: 'ES' },
  { name: 'Italy', flag: '🇮🇹', code: 'IT' },
  { name: 'Netherlands', flag: '🇳🇱', code: 'NL' },
];

export const INITIAL_DISCOVERY_PROFILES: UserProfile[] = [...AI_PERSONAS];

export const INITIAL_PROFILE_ACTIVITIES: Record<string, {
  userId: string;
  viewsCount: number;
  likesReceivedCount: number;
  matchesCount: number;
  lastActiveAt: string;
  isOnline: boolean;
}> = {
  user_sophia_ny: {
    userId: 'user_sophia_ny',
    viewsCount: 342,
    likesReceivedCount: 184,
    matchesCount: 26,
    lastActiveAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    isOnline: true,
  },
  user_liam_london: {
    userId: 'user_liam_london',
    viewsCount: 289,
    likesReceivedCount: 147,
    matchesCount: 19,
    lastActiveAt: new Date(Date.now() - 9 * 60 * 1000).toISOString(),
    isOnline: true,
  },
  user_elena_dubai: {
    userId: 'user_elena_dubai',
    viewsCount: 412,
    likesReceivedCount: 231,
    matchesCount: 34,
    lastActiveAt: new Date(Date.now() - 11 * 60 * 1000).toISOString(),
    isOnline: true,
  },
  user_marcus_toronto: {
    userId: 'user_marcus_toronto',
    viewsCount: 215,
    likesReceivedCount: 98,
    matchesCount: 14,
    lastActiveAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    isOnline: false,
  },
  user_chloe_sydney: {
    userId: 'user_chloe_sydney',
    viewsCount: 198,
    likesReceivedCount: 112,
    matchesCount: 15,
    lastActiveAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    isOnline: true,
  },
  user_julian_berlin: {
    userId: 'user_julian_berlin',
    viewsCount: 267,
    likesReceivedCount: 135,
    matchesCount: 18,
    lastActiveAt: new Date(Date.now() - 13 * 60 * 1000).toISOString(),
    isOnline: true,
  },
  user_camille_paris: {
    userId: 'user_camille_paris',
    viewsCount: 380,
    likesReceivedCount: 195,
    matchesCount: 28,
    lastActiveAt: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
    isOnline: true,
  },
  user_mateo_barcelona: {
    userId: 'user_mateo_barcelona',
    viewsCount: 189,
    likesReceivedCount: 88,
    matchesCount: 12,
    lastActiveAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    isOnline: false,
  },
  user_chiara_milan: {
    userId: 'user_chiara_milan',
    viewsCount: 356,
    likesReceivedCount: 178,
    matchesCount: 24,
    lastActiveAt: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
    isOnline: true,
  },
  user_lucas_amsterdam: {
    userId: 'user_lucas_amsterdam',
    viewsCount: 228,
    likesReceivedCount: 104,
    matchesCount: 16,
    lastActiveAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    isOnline: true,
  },
};
