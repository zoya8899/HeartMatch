import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  deleteUser,
  sendEmailVerification,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import {
  UserAccount,
  UserProfile,
  UserPreference,
  SubscriptionRecord,
  SubscriptionPlanId,
  PaymentProofRecord,
} from '../types';
import { checkContentForAbuse } from '../services/moderationFilter';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userAccount: UserAccount | null;
  userProfile: UserProfile | null;
  userPreference: UserPreference | null;
  subscription: SubscriptionRecord | null;
  isAdmin: boolean;
  isPakistanUser: boolean;
  isPremium: boolean;
  strikeCount: number;
  loading: boolean;
  superLikesCount: number;
  boostsCount: number;
  rewindsCount: number;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, name: string, age: number, gender: UserProfile['gender'], interestedIn: UserProfile['interestedIn'], country?: string, city?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  confirmEmailVerified: () => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
  updatePreferenceData: (data: Partial<UserPreference>) => Promise<void>;
  submitAgeVerification: (docType: string, idUrl?: string, selfieUrl?: string) => Promise<void>;
  activateSubscription: (planId: SubscriptionPlanId, price: number) => Promise<void>;
  submitPaymentProof: (proof: {
    planId: string;
    planTitle: string;
    amountUsd: number;
    amountPkr: number;
    method: 'JazzCash' | 'USDT';
    transactionId: string;
    senderDetail: string;
    receiptUrl: string;
  }) => Promise<PaymentProofRecord>;
  useConsumable: (type: 'superlike' | 'boost' | 'rewind') => boolean;
  addConsumable: (type: 'superlike' | 'boost' | 'spotlight' | 'rewind', amount: number) => void;
  recordStrike: (reason: string, offendingSnippet?: string) => Promise<{ strikeCount: number; isSuspended: boolean }>;
  deleteAccount: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Admin email configured for runtime
const BOOTSTRAP_ADMIN_EMAIL = 'zoyakhokhar001@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userAccount, setUserAccount] = useState<UserAccount | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userPreference, setUserPreference] = useState<UserPreference | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionRecord | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Pakistan Free Access Check
  const isPakistanUser =
    userProfile?.country?.toLowerCase() === 'pakistan' ||
    userAccount?.isPakistanFreeAccess === true;

  // Active Premium Status Check
  const isPremium =
    subscription?.status === 'active' &&
    new Date(subscription.expiresAt).getTime() > Date.now();

  // Strikes tracked from userAccount or default 0
  const strikeCount = userAccount?.strikeCount || 0;

  // Consumables state
  const [superLikesCount, setSuperLikesCount] = useState<number>(10);
  const [boostsCount, setBoostsCount] = useState<number>(3);
  const [rewindsCount, setRewindsCount] = useState<number>(10);

  const fetchUserData = async (user: FirebaseUser) => {
    try {
      const emailMatchesAdmin = user.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();

      // Check admin status
      let hasAdminDoc = false;
      try {
        const adminDoc = await getDoc(doc(db, 'adminUsers', user.uid));
        hasAdminDoc = adminDoc.exists();
      } catch {
        // Admin collection may not have doc yet; email check remains authoritative
      }
      setIsAdmin(emailMatchesAdmin || hasAdminDoc);

      // Fetch User Account
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setUserAccount(userSnap.data() as UserAccount);
      } else {
        // Initialize account record
        const newAccount: UserAccount = {
          uid: user.uid,
          email: user.email || '',
          role: emailMatchesAdmin ? 'admin' : 'user',
          ageVerified: false,
          status: 'active',
          createdAt: new Date().toISOString(),
          lastSeen: new Date().toISOString(),
        };
        await setDoc(userRef, newAccount);
        setUserAccount(newAccount);
      }

      // Fetch Profile
      const profileRef = doc(db, 'profiles', user.uid);
      const profileSnap = await getDoc(profileRef);
      if (profileSnap.exists()) {
        setUserProfile(profileSnap.data() as UserProfile);
      }

      // Fetch Preferences
      const prefRef = doc(db, 'preferences', user.uid);
      const prefSnap = await getDoc(prefRef);
      if (prefSnap.exists()) {
        setUserPreference(prefSnap.data() as UserPreference);
      } else {
        const defaultPref: UserPreference = {
          userId: user.uid,
          minAge: 21,
          maxAge: 40,
          maxDistanceKm: 50,
          interestedIn: 'everyone',
          verifiedOnly: false,
          updatedAt: new Date().toISOString(),
        };
        try {
          await setDoc(prefRef, defaultPref);
          setUserPreference(defaultPref);
        } catch (e) {
          console.warn('Preferences initialization note:', e);
        }
      }

      // Fetch Subscription
      try {
        const subRef = doc(db, 'subscriptions', user.uid);
        const subSnap = await getDoc(subRef);
        if (subSnap.exists()) {
          const subData = subSnap.data() as SubscriptionRecord;
          if (new Date(subData.expiresAt).getTime() > Date.now()) {
            setSubscription(subData);
          } else {
            setSubscription({ ...subData, status: 'expired' });
          }
        }
      } catch (err) {
        console.warn('Subscription fetch:', err);
      }
    } catch (err) {
      console.error('Error fetching user data from Firestore:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserData(user);
      } else {
        setUserAccount(null);
        setUserProfile(null);
        setUserPreference(null);
        setSubscription(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      await setPersistence(auth, browserLocalPersistence);
      const res = await signInWithEmailAndPassword(auth, email, pass);
      await fetchUserData(res.user);
    } catch (err: any) {
      console.error('Login error:', err);
      throw new Error(err.message || 'Failed to sign in. Please verify your credentials.');
    }
  };

  const signupWithEmail = async (
    email: string,
    pass: string,
    name: string,
    age: number,
    gender: UserProfile['gender'],
    interestedIn: UserProfile['interestedIn'],
    userCountry: string = 'Pakistan',
    userCity: string = 'Lahore'
  ) => {
    if (age < 18) {
      throw new Error('HeartMatch is strictly for adults aged 18 and older.');
    }

    try {
      await setPersistence(auth, browserLocalPersistence);
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const uid = cred.user.uid;

      // Send email verification
      try {
        await sendEmailVerification(cred.user);
      } catch (e) {
        console.warn('Verification email note:', e);
      }

      const isUserAdmin = email.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();
      const isPak = userCountry.toLowerCase() === 'pakistan';

      // Create User doc with Instant Auto-Approval (status: 'active')
      const newAccount: UserAccount = {
        uid,
        email,
        role: isUserAdmin ? 'admin' : 'user',
        ageVerified: true, // certified 18+
        status: 'active', // Auto-approved immediately!
        strikeCount: 0,
        isPakistanFreeAccess: isPak,
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', uid), newAccount);

      // Create Profile doc with instant verified approval and public discovery (NO fake stock photos)
      const newProfile: UserProfile = {
        userId: uid,
        name,
        age,
        gender,
        interestedIn,
        city: userCity || (isPak ? 'Lahore' : 'New York'),
        country: userCountry || (isPak ? 'Pakistan' : 'United States'),
        bio: `Hello! I'm ${name}. Excited to meet genuine, kind people and build meaningful connections.`,
        photos: [], // 100% Real User Driven: NO fake stock photos! User uploads their real photo
        interests: ['Specialty Coffee', 'Music', 'Travel', 'Art', 'Fitness'],
        hobbies: ['Weekend Roadtrips', 'Reading', 'Photography'],
        profession: 'Professional',
        education: 'University Graduate',
        relationshipGoal: 'long-term',
        completionPercentage: 80,
        verified: true, // Auto-approved!
        verificationStatus: 'verified', // Auto-approved!
        profileVerified: true,
        optedIntoDiscovery: true, // Immediately discoverable publicly!
        isIncognito: false,
        isRealUser: true,
        profileSetupCompleted: false, // Triggers prompt to complete real profile and upload real photo
        registeredAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'profiles', uid), newProfile);

      // Create Preferences doc
      const newPref: UserPreference = {
        userId: uid,
        minAge: Math.max(18, age - 5),
        maxAge: age + 10,
        maxDistanceKm: 50,
        interestedIn,
        verifiedOnly: false,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'preferences', uid), newPref);

      setUserAccount(newAccount);
      setUserProfile(newProfile);
      setUserPreference(newPref);
      setIsAdmin(isUserAdmin);
    } catch (err: any) {
      console.error('Signup error:', err);
      throw new Error(err.message || 'Could not complete registration.');
    }
  };

  const loginWithGoogle = async () => {
    try {
      await setPersistence(auth, browserLocalPersistence);
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      const user = res.user;

      const profileRef = doc(db, 'profiles', user.uid);
      const profileSnap = await getDoc(profileRef);

      if (!profileSnap.exists()) {
        // Create initial default auto-approved profile for Google user (NO fake model photos)
        const initialProfile: UserProfile = {
          userId: user.uid,
          name: user.displayName || 'Member',
          age: 24, // default adult baseline
          gender: 'other',
          interestedIn: 'everyone',
          city: 'Lahore',
          country: 'Pakistan',
          bio: 'Looking for meaningful conversations, shared adventures, and genuine people.',
          photos: user.photoURL ? [user.photoURL] : [], // Use Google avatar if available, never fake stock photos
          interests: ['Art', 'Culinary', 'Travel', 'Wellness'],
          hobbies: ['Music', 'Hiking'],
          relationshipGoal: 'long-term',
          completionPercentage: user.photoURL ? 85 : 60,
          verified: true, // Instant auto-approval!
          verificationStatus: 'verified',
          profileVerified: true,
          optedIntoDiscovery: true, // Immediately public!
          isIncognito: false,
          isRealUser: true,
          profileSetupCompleted: Boolean(user.photoURL),
          registeredAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(profileRef, initialProfile);
        setUserProfile(initialProfile);

        const newAccount: UserAccount = {
          uid: user.uid,
          email: user.email || '',
          role: user.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase() ? 'admin' : 'user',
          ageVerified: true,
          status: 'active',
          strikeCount: 0,
          isPakistanFreeAccess: true,
          createdAt: new Date().toISOString(),
        };
        await setDoc(doc(db, 'users', user.uid), newAccount);
        setUserAccount(newAccount);
      }

      await fetchUserData(user);
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      throw new Error(err.message || 'Google authentication failed.');
    }
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setUserAccount(null);
    setUserProfile(null);
    setUserPreference(null);
    setSubscription(null);
    setIsAdmin(false);
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      throw new Error(err.message || 'Failed to send password reset email.');
    }
  };

  const resendVerificationEmail = async () => {
    if (currentUser) {
      await sendEmailVerification(currentUser);
    }
  };

  const confirmEmailVerified = async () => {
    if (currentUser && userAccount) {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        emailVerified: true,
        updatedAt: new Date().toISOString(),
      });
      setUserAccount({ ...userAccount, emailVerified: true });
    }
  };

  const recordStrike = async (
    reason: string,
    offendingSnippet?: string
  ): Promise<{ strikeCount: number; isSuspended: boolean }> => {
    if (!currentUser) return { strikeCount: 0, isSuspended: false };

    const currentStrikes = userAccount?.strikeCount || 0;
    const nextStrikes = currentStrikes + 1;

    if (nextStrikes >= 2) {
      // Strike 2: Automatically disable/block user's account and log them out
      const suspensionReason =
        'Account permanently suspended and disabled due to repeated violations of Trust & Safety guidelines (offensive language or spam abuse). Strike 2 enforcement.';
      try {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          strikeCount: 2,
          status: 'suspended',
          suspendedReason: suspensionReason,
          suspendedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Error recording strike 2 to Firestore:', err);
      }

      if (userAccount) {
        setUserAccount({
          ...userAccount,
          strikeCount: 2,
          status: 'suspended',
          suspendedReason: suspensionReason,
          suspendedAt: new Date().toISOString(),
        });
      }

      // Log out user immediately
      await logout();
      return { strikeCount: 2, isSuspended: true };
    } else {
      // Strike 1: Record warning and update Firestore
      try {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          strikeCount: 1,
          lastStrikeAt: new Date().toISOString(),
          strike1Reason: reason,
        });
      } catch (err) {
        console.error('Error recording strike 1 to Firestore:', err);
      }

      if (userAccount) {
        setUserAccount({
          ...userAccount,
          strikeCount: 1,
          lastStrikeAt: new Date().toISOString(),
          strike1Reason: reason,
        });
      }

      return { strikeCount: 1, isSuspended: false };
    }
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!currentUser || !userProfile) return;

    if (data.age !== undefined && data.age < 18) {
      throw new Error('Age must be 18 or older to maintain membership.');
    }

    // Two-Strike automated abuse filter on profile bio
    if (data.bio && typeof data.bio === 'string') {
      const abuseCheck = checkContentForAbuse(data.bio);
      if (abuseCheck.isOffensive) {
        const { isSuspended } = await recordStrike(
          abuseCheck.reason || 'Offensive language or spam in profile bio',
          data.bio
        );
        if (isSuspended) {
          throw new Error('Your account has been disabled and blocked due to repeated policy violations (Strike 2).');
        } else {
          throw new Error('Warning: Abuse and inappropriate content are strictly prohibited. Further violations will result in an immediate account ban.');
        }
      }
    }

    try {
      // Calculate completion score
      const merged = { ...userProfile, ...data };
      let score = 30;
      if (merged.photos && merged.photos.length >= 2) score += 20;
      if (merged.bio && merged.bio.length >= 40) score += 15;
      if (merged.interests && merged.interests.length >= 3) score += 10;
      if (merged.hobbies && merged.hobbies.length >= 2) score += 10;
      if (merged.profession) score += 5;
      if (merged.education) score += 5;
      if (merged.relationshipGoal) score += 5;
      merged.completionPercentage = Math.min(100, score);
      merged.updatedAt = new Date().toISOString();
      merged.verified = true; // Instant auto-approval
      merged.verificationStatus = 'verified'; // Instant auto-approval
      merged.optedIntoDiscovery = true;
      merged.isRealUser = true;
      if (merged.photos && merged.photos.length > 0 && merged.bio) {
        merged.profileSetupCompleted = true;
      }

      await setDoc(doc(db, 'profiles', currentUser.uid), merged, { merge: true });
      setUserProfile(merged);

      // 1. Sync immediately with backend discovery engine
      try {
        await fetch('/api/profiles/upsert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(merged),
        });
      } catch (backendErr) {
        console.warn('Backend profile upsert note:', backendErr);
      }

      // 2. Persist in browser local storage
      try {
        localStorage.setItem(`heartmatch_profile_${currentUser.uid}`, JSON.stringify(merged));
        const storedList = JSON.parse(localStorage.getItem('heartmatch_real_profiles') || '[]');
        const updatedList = [
          merged,
          ...storedList.filter((p: any) => p.userId !== merged.userId),
        ];
        localStorage.setItem('heartmatch_real_profiles', JSON.stringify(updatedList));

        // 3. Dispatch reactive event so discover feed & cards refresh instantly
        window.dispatchEvent(new CustomEvent('heartmatch:profile-updated', { detail: merged }));
      } catch (storageErr) {
        console.warn('LocalStorage real profile note:', storageErr);
      }
    } catch (err: any) {
      if (err.message?.includes('Warning:') || err.message?.includes('disabled and blocked')) {
        throw err;
      }
      handleFirestoreError(err, OperationType.UPDATE, `profiles/${currentUser.uid}`);
    }
  };

  const updatePreferenceData = async (data: Partial<UserPreference>) => {
    if (!currentUser) return;
    try {
      const merged = { ...(userPreference || {}), ...data, userId: currentUser.uid, updatedAt: new Date().toISOString() };
      await setDoc(doc(db, 'preferences', currentUser.uid), merged, { merge: true });
      setUserPreference(merged as UserPreference);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `preferences/${currentUser.uid}`);
    }
  };

  const submitAgeVerification = async (docType: string, idUrl?: string, selfieUrl?: string) => {
    if (!currentUser) return;
    try {
      const verificationId = `verif_${currentUser.uid}_${Date.now()}`;
      await setDoc(doc(db, 'verification', verificationId), {
        id: verificationId,
        userId: currentUser.uid,
        userName: userProfile?.name || 'User',
        ageConfirmed: true,
        docType,
        idDocUrl: idUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
        selfieUrl: selfieUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        status: 'approved', // Instant auto-approved!
        createdAt: new Date().toISOString(),
      });

      // Update user account and profile to active & verified immediately
      if (userAccount) {
        const updated = { ...userAccount, ageVerified: true, status: 'active' as const };
        await updateDoc(doc(db, 'users', currentUser.uid), { ageVerified: true, status: 'active' });
        setUserAccount(updated);
      }

      if (userProfile) {
        const updatedProfile = { ...userProfile, verified: true, verificationStatus: 'verified' as const, optedIntoDiscovery: true };
        await setDoc(doc(db, 'profiles', currentUser.uid), updatedProfile, { merge: true });
        setUserProfile(updatedProfile);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'verification');
    }
  };

  const activateSubscription = async (planId: SubscriptionPlanId, price: number) => {
    if (!currentUser) return;
    try {
      let durationDays = 30;
      if (planId === '7day_premium') durationDays = 7;
      if (planId === '3month_premium') durationDays = 90;
      if (planId === 'vip_monthly') durationDays = 30;

      const expires = new Date();
      expires.setDate(expires.getDate() + durationDays);

      const subRecord: SubscriptionRecord = {
        userId: currentUser.uid,
        planId,
        status: 'active',
        price,
        expiresAt: expires.toISOString(),
        renewsAt: expires.toISOString(),
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'subscriptions', currentUser.uid), subRecord);
      setSubscription(subRecord);

      // Record transaction
      const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await setDoc(doc(db, 'payments', paymentId), {
        id: paymentId,
        userId: currentUser.uid,
        type: 'subscription',
        productId: planId,
        amount: price,
        currency: 'USD',
        status: 'succeeded',
        createdAt: new Date().toISOString(),
      });

      // Award bonus perks
      setSuperLikesCount((prev) => prev + (planId === 'vip_monthly' ? 20 : 10));
      setBoostsCount((prev) => prev + (planId === 'vip_monthly' ? 5 : 2));
      setRewindsCount((prev) => prev + 20);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `subscriptions/${currentUser.uid}`);
    }
  };

  const submitPaymentProof = async (proof: {
    planId: string;
    planTitle: string;
    amountUsd: number;
    amountPkr: number;
    method: 'JazzCash' | 'USDT';
    transactionId: string;
    senderDetail: string;
    receiptUrl: string;
  }): Promise<PaymentProofRecord> => {
    if (!currentUser) throw new Error('You must be signed in to submit payment proof.');
    const proofId = `proof_${currentUser.uid}_${Date.now()}`;
    const record: PaymentProofRecord = {
      id: proofId,
      userId: currentUser.uid,
      userEmail: currentUser.email || userAccount?.email || 'member@heartmatch.app',
      userName: userProfile?.name || 'HeartMatch Member',
      ...proof,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'payment_proofs', proofId), record);

      // Set subscription status to 'pending_verification'
      const pendingSub: SubscriptionRecord = {
        userId: currentUser.uid,
        planId: proof.planId as SubscriptionPlanId,
        status: 'pending_verification',
        price: proof.amountUsd,
        expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'subscriptions', currentUser.uid), pendingSub, { merge: true });
      setSubscription(pendingSub);
    } catch (err) {
      console.warn('Saved payment proof locally / fallback:', err);
      // Still set subscription status in state
      setSubscription({
        userId: currentUser.uid,
        planId: proof.planId as SubscriptionPlanId,
        status: 'pending_verification',
        price: proof.amountUsd,
        expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
        createdAt: new Date().toISOString(),
      });
    }

    return record;
  };

  const useConsumable = (type: 'superlike' | 'boost' | 'rewind'): boolean => {
    // 100% FREE UNLIMITED ACCESS FOR ALL PAKISTAN USERS:
    // messaging, voice notes, browsing, connecting, rewinds, superlikes, and boosts with zero paywall
    if (isPakistanUser) {
      return true;
    }

    const isSubActive =
      subscription?.status === 'active' &&
      new Date(subscription.expiresAt).getTime() > Date.now();

    if (isSubActive) {
      // Active premium subscribers enjoy unlimited rewinds
      if (type === 'rewind') return true;
    }

    if (type === 'superlike') {
      if (superLikesCount > 0) {
        setSuperLikesCount((c) => c - 1);
        return true;
      }
      return false;
    }
    if (type === 'boost') {
      if (boostsCount > 0) {
        setBoostsCount((c) => c - 1);
        return true;
      }
      return false;
    }
    if (type === 'rewind') {
      if (rewindsCount > 0) {
        setRewindsCount((c) => c - 1);
        return true;
      }
      return false;
    }
    return false;
  };

  const addConsumable = (type: 'superlike' | 'boost' | 'spotlight' | 'rewind', amount: number) => {
    if (type === 'superlike') setSuperLikesCount((c) => c + amount);
    if (type === 'boost' || type === 'spotlight') setBoostsCount((c) => c + amount);
    if (type === 'rewind') setRewindsCount((c) => c + amount);
  };

  const deleteAccount = async () => {
    if (!currentUser) return;
    try {
      await deleteDoc(doc(db, 'profiles', currentUser.uid));
      await deleteDoc(doc(db, 'preferences', currentUser.uid));
      await deleteDoc(doc(db, 'users', currentUser.uid));
      await deleteUser(currentUser);
      setCurrentUser(null);
      setUserAccount(null);
      setUserProfile(null);
    } catch (err) {
      console.error('Delete account error:', err);
      throw err;
    }
  };

  const refreshProfile = async () => {
    if (currentUser) {
      await fetchUserData(currentUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userAccount,
        userProfile,
        userPreference,
        subscription,
        isAdmin,
        isPakistanUser,
        isPremium,
        strikeCount,
        loading,
        superLikesCount,
        boostsCount,
        rewindsCount,
        loginWithEmail,
        signupWithEmail,
        loginWithGoogle,
        logout,
        resetPassword,
        resendVerificationEmail,
        confirmEmailVerified,
        updateProfileData,
        updatePreferenceData,
        submitAgeVerification,
        activateSubscription,
        submitPaymentProof,
        useConsumable,
        addConsumable,
        recordStrike,
        deleteAccount,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
