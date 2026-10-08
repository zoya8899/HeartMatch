import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  updateDoc,
} from 'firebase/firestore';
import confetti from 'canvas-confetti';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import { useAuth } from './AuthContext';
import {
  UserProfile,
  MatchRecord,
  LikeRecord,
  NotificationRecord,
  BoostRecord,
} from '../types';
import { INITIAL_DISCOVERY_PROFILES } from '../services/seedData';

interface MatchContextType {
  discoveryProfiles: UserProfile[];
  currentCard: UserProfile | null;
  matches: MatchRecord[];
  activeMatchCelebration: { match: MatchRecord; profile: UserProfile } | null;
  activeBoost: BoostRecord | null;
  loadingDiscovery: boolean;
  historyQueue: { profile: UserProfile; action: 'like' | 'pass' | 'superlike'; likeDocId?: string }[];
  swipe: (action: 'like' | 'pass' | 'superlike') => Promise<void>;
  swipeProfile: (targetProfile: UserProfile, action: 'like' | 'pass' | 'superlike') => Promise<void>;
  rewindLastSwipe: () => Promise<boolean>;
  triggerProfileBoost: (type: 'boost' | 'spotlight') => Promise<void>;
  dismissCelebration: () => void;
  unmatchUser: (matchId: string) => Promise<void>;
  blockUser: (targetUserId: string, matchId?: string) => Promise<void>;
  reportUser: (targetUserId: string, reason: string, details: string, matchId?: string) => Promise<void>;
  refreshDiscovery: () => void;
}

const MatchContext = createContext<MatchContextType | undefined>(undefined);

export const MatchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, userProfile, userPreference, subscription, useConsumable, addConsumable } = useAuth();

  const [discoveryProfiles, setDiscoveryProfiles] = useState<UserProfile[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [activeMatchCelebration, setActiveMatchCelebration] = useState<{ match: MatchRecord; profile: UserProfile } | null>(null);
  const [activeBoost, setActiveBoost] = useState<BoostRecord | null>(null);
  const [loadingDiscovery, setLoadingDiscovery] = useState<boolean>(true);
  const [historyQueue, setHistoryQueue] = useState<{ profile: UserProfile; action: 'like' | 'pass' | 'superlike'; likeDocId?: string }[]>([]);

  // Load and filter discovery profiles
  const loadDiscoveryProfiles = () => {
    setLoadingDiscovery(true);

    // Retrieve real community registered profiles from browser state
    let realProfiles: UserProfile[] = [];
    try {
      const stored = localStorage.getItem('heartmatch_real_profiles');
      if (stored) realProfiles = JSON.parse(stored);
    } catch (e) {}

    // Exclude current user from candidate cards
    const filteredReal = realProfiles.filter((p) => !currentUser || p.userId !== currentUser.uid);

    // Prioritize real users first, followed by the 20 AI personas
    let candidates = [
      ...filteredReal,
      ...INITIAL_DISCOVERY_PROFILES.filter(
        (p) => (!currentUser || p.userId !== currentUser.uid) && !filteredReal.some((rp) => rp.userId === p.userId)
      ),
    ];

    // Exclude current user
    if (currentUser) {
      candidates = candidates.filter((p) => p.userId !== currentUser.uid);
    }

    // Apply User Preferences
    if (userPreference) {
      if (userPreference.interestedIn === 'women') {
        candidates = candidates.filter((p) => p.gender === 'woman');
      } else if (userPreference.interestedIn === 'men') {
        candidates = candidates.filter((p) => p.gender === 'man');
      }

      if (userPreference.minAge) {
        candidates = candidates.filter((p) => p.age >= userPreference.minAge);
      }
      if (userPreference.maxAge) {
        candidates = candidates.filter((p) => p.age <= userPreference.maxAge);
      }
      if (userPreference.verifiedOnly) {
        candidates = candidates.filter((p) => p.verified === true);
      }
    }

    // Always sort real users first
    candidates = candidates.sort((a, b) => (b.isRealUser ? 1 : 0) - (a.isRealUser ? 1 : 0));

    setDiscoveryProfiles(candidates);
    setCurrentCardIndex(0);
    setLoadingDiscovery(false);
  };

  useEffect(() => {
    loadDiscoveryProfiles();

    const handleProfileUpdate = () => {
      loadDiscoveryProfiles();
    };

    window.addEventListener('heartmatch:profile-updated', handleProfileUpdate);
    return () => {
      window.removeEventListener('heartmatch:profile-updated', handleProfileUpdate);
    };
  }, [currentUser, userPreference]);

  // Listen to matches for current user
  useEffect(() => {
    if (!currentUser) {
      setMatches([]);
      return;
    }

    const matchesQuery1 = query(
      collection(db, 'matches'),
      where('user1Id', '==', currentUser.uid)
    );

    const unsub1 = onSnapshot(matchesQuery1, (snap1) => {
      const list1 = snap1.docs.map((d) => ({ id: d.id, ...d.data() } as MatchRecord));

      // Also listen to user2Id
      const matchesQuery2 = query(
        collection(db, 'matches'),
        where('user2Id', '==', currentUser.uid)
      );

      const unsub2 = onSnapshot(matchesQuery2, (snap2) => {
        const list2 = snap2.docs.map((d) => ({ id: d.id, ...d.data() } as MatchRecord));
        const combined = [...list1, ...list2].filter((m) => m.status === 'active');

        // Attach other profile details
        const enriched = combined.map((m) => {
          const otherId = m.user1Id === currentUser.uid ? m.user2Id : m.user1Id;
          const found = INITIAL_DISCOVERY_PROFILES.find((p) => p.userId === otherId);
          return {
            ...m,
            otherProfile: found || {
              userId: otherId,
              name: 'HeartMatch Member',
              age: 26,
              gender: 'woman',
              interestedIn: 'everyone',
              city: 'London',
              country: 'United Kingdom',
              bio: 'Active connection on HeartMatch.',
              photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'],
              interests: ['Travel', 'Art'],
              hobbies: ['Music'],
              verified: true,
            },
          };
        });

        setMatches(enriched);
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'matches');
      });

      return () => unsub2();
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'matches');
    });

    return () => unsub1();
  }, [currentUser]);

  const currentCard = discoveryProfiles[currentCardIndex] || null;

  const triggerMatchCelebration = (match: MatchRecord, targetProfile: UserProfile) => {
    setActiveMatchCelebration({ match, profile: targetProfile });
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#e11d48', '#f43f5e', '#fb7185', '#fda4af', '#f59e0b'],
    });
  };

  const swipeProfile = async (targetProfile: UserProfile, action: 'like' | 'pass' | 'superlike') => {
    if (!currentUser) return;

    // Check consumables for superlike
    if (action === 'superlike') {
      const hasConsumable = useConsumable('superlike');
      if (!hasConsumable && subscription?.status !== 'active') {
        alert('You have run out of Super Likes. Upgrade to Premium or purchase more in the shop!');
        return;
      }
    }

    const likeDocId = `like_${currentUser.uid}_${targetProfile.userId}`;

    try {
      // Record like in Firestore
      await setDoc(doc(db, 'likes', likeDocId), {
        userId: currentUser.uid,
        targetUserId: targetProfile.userId,
        type: action,
        createdAt: new Date().toISOString(),
      });

      // Push to history queue for rewind capability
      setHistoryQueue((prev) => [
        ...prev,
        { profile: targetProfile, action, likeDocId },
      ]);

      // If like or superlike, check if it forms a mutual match
      if (action === 'like' || action === 'superlike') {
        // Create match
        const matchId = `match_${[currentUser.uid, targetProfile.userId].sort().join('_')}`;
        const newMatch: MatchRecord = {
          id: matchId,
          user1Id: currentUser.uid,
          user2Id: targetProfile.userId,
          matchedAt: new Date().toISOString(),
          status: 'active',
          lastMessageText: action === 'superlike' ? 'Sent a Super Like!' : "It's a Match! Say hello.",
          lastMessageTime: new Date().toISOString(),
        };

        await setDoc(doc(db, 'matches', matchId), newMatch);

        // Create in-app notification
        const notifId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        await setDoc(doc(db, 'notifications', notifId), {
          id: notifId,
          userId: currentUser.uid,
          type: action === 'superlike' ? 'superlike' : 'match',
          title: action === 'superlike' ? `Super Like from ${targetProfile.name}!` : `New Match with ${targetProfile.name}!`,
          body: `You and ${targetProfile.name} liked each other! Start the conversation.`,
          read: false,
          link: `/matches?id=${matchId}`,
          createdAt: new Date().toISOString(),
        });

        triggerMatchCelebration(newMatch, targetProfile);
      }
    } catch (err) {
      console.error('Error processing swipe:', err);
    }
  };

  const swipe = async (action: 'like' | 'pass' | 'superlike') => {
    if (!currentCard || !currentUser) return;
    await swipeProfile(currentCard, action);
    setCurrentCardIndex((prev) => prev + 1);
  };

  const rewindLastSwipe = async (): Promise<boolean> => {
    if (historyQueue.length === 0 || currentCardIndex === 0) return false;

    const allowed = useConsumable('rewind');
    if (!allowed && subscription?.status !== 'active') {
      alert('Rewinds require Premium membership or a Rewind pack.');
      return false;
    }

    const lastSwiped = historyQueue[historyQueue.length - 1];
    if (lastSwiped?.likeDocId) {
      try {
        await deleteDoc(doc(db, 'likes', lastSwiped.likeDocId));
      } catch (e) {
        console.warn('Rewind doc deletion note:', e);
      }
    }

    setHistoryQueue((prev) => prev.slice(0, prev.length - 1));
    setCurrentCardIndex((prev) => Math.max(0, prev - 1));
    return true;
  };

  const triggerProfileBoost = async (type: 'boost' | 'spotlight') => {
    if (!currentUser) return;
    const allowed = useConsumable('boost');
    if (!allowed && subscription?.status !== 'active') {
      alert('You have no Boost passes remaining. Purchase one in the shop or upgrade to VIP!');
      return;
    }

    const durationMins = type === 'spotlight' ? 60 : 30;
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + durationMins);

    const boostDoc: BoostRecord = {
      id: `boost_${currentUser.uid}_${Date.now()}`,
      userId: currentUser.uid,
      type,
      expiresAt: expires.toISOString(),
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'boosts', boostDoc.id), boostDoc);
      setActiveBoost(boostDoc);

      // Set timeout to deactivate
      setTimeout(() => {
        setActiveBoost(null);
      }, durationMins * 60 * 1000);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'boosts');
    }
  };

  const dismissCelebration = () => {
    setActiveMatchCelebration(null);
  };

  const unmatchUser = async (matchId: string) => {
    if (!currentUser) return;
    try {
      await updateDoc(doc(db, 'matches', matchId), {
        status: 'unmatched',
        unmatchedBy: currentUser.uid,
      });
      setMatches((prev) => prev.filter((m) => m.id !== matchId));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `matches/${matchId}`);
    }
  };

  const blockUser = async (targetUserId: string, matchId?: string) => {
    if (!currentUser) return;
    try {
      const blockId = `block_${currentUser.uid}_${targetUserId}`;
      await setDoc(doc(db, 'blocks', blockId), {
        id: blockId,
        blockerId: currentUser.uid,
        blockedUserId: targetUserId,
        createdAt: new Date().toISOString(),
      });

      if (matchId) {
        await unmatchUser(matchId);
      }

      // Remove from discovery
      setDiscoveryProfiles((prev) => prev.filter((p) => p.userId !== targetUserId));
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'blocks');
    }
  };

  const reportUser = async (targetUserId: string, reason: string, details: string, matchId?: string) => {
    if (!currentUser) return;
    try {
      const reportId = `report_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await setDoc(doc(db, 'reports', reportId), {
        id: reportId,
        reporterId: currentUser.uid,
        reportedUserId: targetUserId,
        reason,
        details,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });

      // Automatically offer to block as well
      await blockUser(targetUserId, matchId);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'reports');
    }
  };

  const refreshDiscovery = () => {
    loadDiscoveryProfiles();
  };

  return (
    <MatchContext.Provider
      value={{
        discoveryProfiles,
        currentCard,
        matches,
        activeMatchCelebration,
        activeBoost,
        loadingDiscovery,
        historyQueue,
        swipe,
        swipeProfile,
        rewindLastSwipe,
        triggerProfileBoost,
        dismissCelebration,
        unmatchUser,
        blockUser,
        reportUser,
        refreshDiscovery,
      }}
    >
      {children}
    </MatchContext.Provider>
  );
};

export const useMatch = () => {
  const context = useContext(MatchContext);
  if (!context) throw new Error('useMatch must be used within a MatchProvider');
  return context;
};
