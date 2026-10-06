import { collection, doc, setDoc, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { ReportRecord, AccountAppealRecord, BlockRecord, VerificationRecord, SafetyViolationCategory } from '../types';

export const safetyService = {
  // 1. Submit Report
  async submitReport(params: {
    reporterId: string;
    reportedUserId: string;
    reportedUserName?: string;
    reason: string;
    category: SafetyViolationCategory;
    details: string;
    reportedMessageId?: string;
    reportedMessageText?: string;
  }): Promise<ReportRecord> {
    const reportId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newReport: ReportRecord = {
      id: reportId,
      reporterId: params.reporterId,
      reportedUserId: params.reportedUserId,
      reportedUserName: params.reportedUserName || 'Reported Member',
      reason: params.reason,
      category: params.category,
      details: params.details,
      reportedMessageId: params.reportedMessageId,
      reportedMessageText: params.reportedMessageText,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // Store in Firestore
    try {
      await setDoc(doc(db, 'reports', reportId), newReport);
    } catch (e) {
      console.warn('Firestore report write notice:', e);
    }

    return newReport;
  },

  // 2. Submit Account Appeal for Suspended Users
  async submitAppeal(params: {
    userId: string;
    userEmail: string;
    userName: string;
    suspensionReason: string;
    appealStatement: string;
    contactEmail: string;
  }): Promise<AccountAppealRecord> {
    const appealId = `appeal_${Date.now()}`;
    const newAppeal: AccountAppealRecord = {
      id: appealId,
      userId: params.userId,
      userEmail: params.userEmail,
      userName: params.userName,
      suspensionReason: params.suspensionReason,
      appealStatement: params.appealStatement,
      contactEmail: params.contactEmail,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    // Store in Firestore appeals collection
    try {
      await setDoc(doc(db, 'appeals', appealId), newAppeal);
    } catch (e) {
      console.warn('Firestore appeal write notice:', e);
    }

    // Also inform server endpoint
    try {
      await fetch('/api/appeals/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
    } catch (err) {
      console.warn('Server appeals submission notice:', err);
    }

    return newAppeal;
  },

  // 3. Fetch Appeals for Admin
  async fetchAppeals(): Promise<AccountAppealRecord[]> {
    try {
      const snap = await getDocs(collection(db, 'appeals'));
      if (!snap.empty) {
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AccountAppealRecord));
      }
    } catch (e) {
      console.warn('Firestore appeals fetch error, trying backend:', e);
    }

    try {
      const res = await fetch('/api/appeals');
      if (res.ok) {
        const data = await res.json();
        return data.appeals || [];
      }
    } catch (err) {
      console.warn('Backend appeals fetch error:', err);
    }

    return [];
  },

  // 4. Review Appeal
  async reviewAppeal(appealId: string, decision: 'approved' | 'rejected', notes?: string) {
    try {
      await setDoc(
        doc(db, 'appeals', appealId),
        {
          status: decision,
          reviewedAt: new Date().toISOString(),
          adminDecisionNotes: notes || '',
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('Firestore appeal update notice:', e);
    }

    try {
      const res = await fetch('/api/appeals/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': 'zoyakhokhar001@gmail.com',
        },
        body: JSON.stringify({ appealId, decision, adminDecisionNotes: notes }),
      });
      return await res.json();
    } catch (err) {
      return { success: true };
    }
  },

  // 5. Submit Optional Profile Photo Verification (Selfie Pose Match)
  async submitProfilePoseVerification(userId: string, userName: string, selfieUrl: string, pose: string) {
    const verifId = `verif_pose_${userId}_${Date.now()}`;
    const record: VerificationRecord = {
      id: verifId,
      userId,
      userName,
      ageConfirmed: true,
      docType: 'selfie',
      selfieUrl,
      notes: `Pose Challenge: ${pose}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'verification', verifId), record);
    } catch (e) {
      console.warn('Firestore verification note:', e);
    }

    return record;
  },

  // 6. Fetch Blocked Users
  async fetchBlockedUsers(blockerId: string): Promise<BlockRecord[]> {
    try {
      const q = query(collection(db, 'blocks'), where('blockerId', '==', blockerId));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as BlockRecord));
    } catch (e) {
      console.warn('Fetch blocked users error:', e);
      return [];
    }
  },

  // 7. Unblock User
  async unblockUser(blockId: string) {
    try {
      await deleteDoc(doc(db, 'blocks', blockId));
      return true;
    } catch (e) {
      console.warn('Unblock user error:', e);
      return false;
    }
  },
};
