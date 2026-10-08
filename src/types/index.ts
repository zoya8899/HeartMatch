export type Role = 'user' | 'admin';

export interface UserAccount {
  uid: string;
  email: string;
  role: Role;
  ageVerified: boolean;
  emailVerified?: boolean;
  status: 'active' | 'suspended' | 'deleted';
  suspendedReason?: string;
  suspendedAt?: string;
  strikeCount?: number;
  lastStrikeAt?: string;
  strike1Reason?: string;
  isPakistanFreeAccess?: boolean;
  createdAt: string;
  updatedAt?: string;
  lastSeen?: string;
}

export type Gender = 'woman' | 'man' | 'nonbinary' | 'other';
export type InterestedIn = 'men' | 'women' | 'everyone';
export type RelationshipGoal = 'long-term' | 'marriage' | 'casual' | 'figuring-out';

export interface ProfilePrompt {
  id: string;
  question: string;
  answer: string;
}

export interface UserLifestyle {
  drinking?: 'never' | 'socially' | 'frequently';
  smoking?: 'no' | 'socially' | 'yes';
  workout?: 'daily' | 'often' | 'sometimes';
  pets?: string;
  height?: string;
}

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'failed';

export interface UserProfile {
  userId: string;
  name: string;
  age: number;
  gender: Gender;
  interestedIn: InterestedIn;
  city: string;
  country: string;
  showCity?: boolean;
  bio: string;
  photos: string[];
  interests: string[];
  hobbies: string[];
  profession?: string;
  education?: string;
  languages?: string[];
  relationshipGoal?: RelationshipGoal;
  completionPercentage?: number;
  verified?: boolean; // 18+ Age & Document Verified
  verificationStatus?: VerificationStatus; // Unverified | Verification Pending | Verified | Verification Failed
  profileVerified?: boolean; // Optional Selfie Pose Match Verified
  profileVerificationPose?: string;
  isIncognito?: boolean;
  hideDistance?: boolean;
  coarseLocationOnly?: boolean;
  readReceiptsEnabled?: boolean;
  optedIntoDiscovery?: boolean;
  onlineStatusVisibility?: boolean;
  lastActiveAt?: string;
  registeredAt?: string;
  prompts?: ProfilePrompt[];
  lifestyle?: UserLifestyle;
  voiceNote?: {
    topic: string;
    duration: string;
    audioUrl?: string;
  };
  updatedAt?: string;
}

export interface DiscoveryPreferences {
  userId: string;
  minAge: number;
  maxAge: number;
  maxDistanceKm?: number;
  interestedIn: InterestedIn;
  countries?: string[];
  relationshipGoals?: RelationshipGoal[];
  interests?: string[];
  languages?: string[];
  verifiedOnly?: boolean;
  updatedAt?: string;
}

export interface ProfileActivity {
  userId: string;
  viewsCount: number;
  likesReceivedCount: number;
  matchesCount: number;
  lastActiveAt: string;
  isOnline: boolean;
  updatedAt?: string;
}

export type DiscoverySectionId =
  | 'verified_singles'
  | 'new_to_heartmatch'
  | 'popular_profiles'
  | 'near_you'
  | 'recommended'
  | 'online_now';

export interface CountryDiscoveryItem {
  country: string;
  flag: string;
  code: string;
  verifiedCount: number;
}

export interface UserPreference {
  userId: string;
  minAge: number;
  maxAge: number;
  maxDistanceKm: number;
  interestedIn: InterestedIn;
  relationshipGoals?: RelationshipGoal[];
  verifiedOnly?: boolean;
  updatedAt?: string;
}

export interface LikeRecord {
  id?: string;
  userId: string;
  targetUserId: string;
  type: 'like' | 'superlike' | 'pass';
  createdAt: string;
}

export interface MatchRecord {
  id: string;
  user1Id: string;
  user2Id: string;
  matchedAt: string;
  lastMessageText?: string;
  lastMessageTime?: string;
  status: 'active' | 'unmatched';
  unmatchedBy?: string;
  otherProfile?: UserProfile;
}

export interface MessageRecord {
  id: string;
  matchId: string;
  senderId: string;
  receiverId: string;
  text: string;
  imageUrl?: string;
  voiceNoteUrl?: string;
  voiceDuration?: string;
  read: boolean;
  deleted?: boolean;
  createdAt: string;
  flagged?: boolean;
  flagReason?: string;
}

export type SubscriptionPlanId = '7day_premium' | 'monthly_premium' | '3month_premium' | 'vip_monthly';

export interface SubscriptionRecord {
  userId: string;
  planId: SubscriptionPlanId;
  status: 'active' | 'canceled' | 'expired' | 'pending_verification';
  price: number;
  expiresAt: string;
  renewsAt?: string;
  createdAt: string;
}

export interface PaymentProofRecord {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  planId: string;
  planTitle: string;
  amountUsd: number;
  amountPkr: number;
  method: 'JazzCash' | 'USDT';
  transactionId: string;
  senderDetail: string;
  receiptUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  adminDecisionNotes?: string;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  type: 'subscription' | 'consumable';
  productId: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'refunded';
  createdAt: string;
  details?: string;
}

export interface ProductItem {
  id: string;
  title: string;
  description: string;
  price: number;
  interval?: '7days' | '1month' | '3months' | 'one_time';
  badge?: string;
  category: 'subscription' | 'consumable';
  features: string[];
  isActive: boolean;
  consumableType?: 'superlike' | 'boost' | 'spotlight' | 'rewind';
  quantity?: number;
}

export type SafetyViolationCategory =
  | 'harassment'
  | 'scam_fraud'
  | 'spam'
  | 'offensive_content'
  | 'underage'
  | 'impersonation'
  | 'other';

export interface ReportRecord {
  id: string;
  reporterId: string;
  reportedUserId: string;
  reportedUserName?: string;
  reason: string;
  category?: SafetyViolationCategory;
  details: string;
  reportedMessageId?: string;
  reportedMessageText?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: string;
  adminNotes?: string;
  actionTaken?: 'warned' | 'suspended' | 'banned' | 'dismissed';
}

export interface AccountAppealRecord {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  suspensionReason: string;
  appealStatement: string;
  contactEmail: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  adminDecisionNotes?: string;
}

export interface BlockRecord {
  id: string;
  blockerId: string;
  blockedUserId: string;
  createdAt: string;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  type: 'match' | 'message' | 'like' | 'superlike' | 'system' | 'subscription';
  title: string;
  body: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface BoostRecord {
  id: string;
  userId: string;
  type: 'boost' | 'spotlight';
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
}

export interface VerificationRecord {
  id: string;
  userId: string;
  userName?: string;
  ageConfirmed: boolean;
  docType: 'passport' | 'driving_license' | 'national_id' | 'selfie';
  idDocUrl?: string;
  selfieUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  reviewedBy?: string;
  createdAt: string;
}

export interface AdminUserRecord {
  uid: string;
  email: string;
  role: 'admin' | 'superadmin';
  createdAt: string;
}

// AI Service API response types
export interface AIBioResponse {
  bio: string;
  suggestions: string[];
}

export interface AIStartersResponse {
  starters: string[];
}

export interface AICompatibilityResponse {
  score: number;
  summary: string;
  highlights: string[];
  advice: string;
}

export interface AIModerationResponse {
  safe: boolean;
  flaggedForReview?: boolean;
  reason?: string | null;
  category?: string;
}

export interface AISuspiciousResponse {
  suspicious: boolean;
  riskScore: number;
  reasons: string[];
  recommendations: string;
}
