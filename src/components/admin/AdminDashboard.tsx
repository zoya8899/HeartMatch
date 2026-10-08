import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldAlert,
  CreditCard,
  Tag,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileCheck,
  TrendingUp,
  Settings,
  Plus,
  RefreshCw,
  Eye,
  Lock,
  Flag,
  MessageSquare,
  BadgeCheck,
  UserCheck,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import {
  collection,
  query,
  getDocs,
  doc,
  updateDoc,
  setDoc,
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { useProducts } from '../../contexts/ProductsContext';
import { safetyService } from '../../services/safetyService';
import { discoveryService } from '../../services/discoveryService';
import {
  ProductItem,
  ReportRecord,
  VerificationRecord,
  AccountAppealRecord,
  UserProfile,
  PaymentProofRecord,
} from '../../types';
import { DEFAULT_PRODUCTS } from '../../services/seedData';
import { formatDualPrice } from '../../utils/currency';

export const AdminDashboard: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const { products: contextProducts, updateProduct, refreshProducts } = useProducts();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'payments' | 'verifications' | 'moderation' | 'appeals' | 'pricing' | 'promos'
  >('payments');

  // Products pricing catalog state
  const [products, setProducts] = useState<ProductItem[]>(contextProducts || DEFAULT_PRODUCTS);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editTitle, setEditTitle] = useState<string>('');

  // Moderation reports & AI flags
  const [reports, setReports] = useState<ReportRecord[]>([
    {
      id: 'rep_sample_1',
      reporterId: 'user_alex',
      reportedUserId: 'user_suspicious_99',
      reportedUserName: 'FakeBot_crypto',
      reason: 'scam_fraud',
      category: 'scam_fraud',
      details: 'Offered crypto investment scheme and urged to move to Telegram.',
      status: 'pending',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'rep_sample_2',
      reporterId: 'user_sophia_ny',
      reportedUserId: 'user_impatient_32',
      reportedUserName: 'Unverified_user',
      reason: 'harassment',
      category: 'harassment',
      details: 'Sent aggressive unsolicited messages when not replying instantly.',
      reportedMessageText: 'Why arent you answering me right now? Pick up!',
      status: 'pending',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'rep_sample_3',
      reporterId: 'system_ai',
      reportedUserId: 'user_spam_bot_7',
      reportedUserName: 'CashApp_Promoter',
      reason: 'spam',
      category: 'spam',
      details: 'AI Automated Flag: Repeatedly sending off-platform affiliate links.',
      reportedMessageText: 'Get $50 free bonus on bit-wallet.cc sign up here!',
      status: 'pending',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
  ]);

  // Account Appeals queue
  const [appeals, setAppeals] = useState<AccountAppealRecord[]>([
    {
      id: 'appeal_01',
      userId: 'user_david_miller',
      userEmail: 'david.miller@example.com',
      userName: 'David Miller (30)',
      suspensionReason: 'Flagged for mentioning crypto in chat conversation',
      appealStatement: 'I am a fintech software engineer at a retail bank and was discussing my job with a match. I have never solicited funds, conducted commercial activities, or violated community guidelines.',
      contactEmail: 'david.miller@example.com',
      status: 'pending',
      submittedAt: new Date(Date.now() - 14400000).toISOString(),
    },
  ]);

  // Verification queue (18+ Age & Document + Optional Profile Photo Verification)
  const [verifications, setVerifications] = useState<VerificationRecord[]>([
    {
      id: 'ver_01',
      userId: 'user_sophia_ny',
      userName: 'Sophia (27)',
      ageConfirmed: true,
      docType: 'selfie',
      notes: 'Pose Challenge: Peace Sign by cheek',
      idDocUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      status: 'approved',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ver_02',
      userId: 'user_marcus_toronto',
      userName: 'Marcus (32)',
      ageConfirmed: true,
      docType: 'passport',
      notes: '18+ Government ID Audit',
      idDocUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
      status: 'pending',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ver_03',
      userId: 'user_elena_london',
      userName: 'Elena (26)',
      ageConfirmed: true,
      docType: 'selfie',
      notes: 'Pose Challenge: Thumbs-up with a smile',
      idDocUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
      status: 'pending',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
  ]);

  // Pending Payments Review Queue (Manual Verification: JazzCash & USDT)
  const [paymentProofs, setPaymentProofs] = useState<PaymentProofRecord[]>([
    {
      id: 'proof_demo_01',
      userId: 'user_usman_lahore',
      userEmail: 'usman.ali@gmail.com',
      userName: 'Usman Ali (28)',
      planId: 'monthly_premium',
      planTitle: 'Monthly Premium',
      amountUsd: 24.99,
      amountPkr: 7000,
      method: 'JazzCash',
      transactionId: 'TID-JC-984210492',
      senderDetail: '03001234567',
      receiptUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
      status: 'pending',
      submittedAt: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: 'proof_demo_02',
      userId: 'user_bilal_karachi',
      userEmail: 'bilal.k@outlook.com',
      userName: 'Bilal Khan (31)',
      planId: '7day_premium',
      planTitle: '7-Day Premium',
      amountUsd: 9.99,
      amountPkr: 2800,
      method: 'USDT',
      transactionId: '0x8f2a41d9c02e5b7a19283e4c8d92f1b0a8c291823719283719283719283',
      senderDetail: 'TYq1b9XkLmN8oPqRsTuVwXyZ1234567890',
      receiptUrl: 'https://images.unsplash.com/photo-1580048915913-4f8f5cb481c4?auto=format&fit=crop&w=600&q=80',
      status: 'pending',
      submittedAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ]);
  const [selectedSlipUrl, setSelectedSlipUrl] = useState<string | null>(null);

  // Promo codes
  const [promoCodes, setPromoCodes] = useState<{ code: string; discount: string; uses: number; active: boolean }[]>([
    { code: 'WELCOME50', discount: '50% Off First Month', uses: 142, active: true },
    { code: 'LOVE20', discount: '20% Off All Plans', uses: 89, active: true },
    { code: 'VIP100', discount: '100% Free VIP Trial', uses: 35, active: true },
  ]);
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoDiscount, setNewPromoDiscount] = useState('');

  // Synchronize products
  useEffect(() => {
    if (contextProducts && contextProducts.length > 0) {
      setProducts(contextProducts);
    }
  }, [contextProducts]);

  // Load real Firestore collections & backend data
  const loadAdminData = async () => {
    try {
      // Products
      const prodSnap = await getDocs(collection(db, 'products'));
      if (!prodSnap.empty) {
        setProducts(prodSnap.docs.map((d) => ({ id: d.id, ...d.data() } as ProductItem)));
      }

      // Reports
      const repSnap = await getDocs(collection(db, 'reports'));
      if (!repSnap.empty) {
        setReports(repSnap.docs.map((d) => ({ id: d.id, ...d.data() } as ReportRecord)));
      }

      // Verifications
      const verSnap = await getDocs(collection(db, 'verification'));
      if (!verSnap.empty) {
        setVerifications(verSnap.docs.map((d) => ({ id: d.id, ...d.data() } as VerificationRecord)));
      }

      // Appeals
      const appealItems = await safetyService.fetchAppeals();
      if (appealItems && appealItems.length > 0) {
        setAppeals(appealItems);
      }

      // Payment Proofs from Firestore
      const proofSnap = await getDocs(collection(db, 'payment_proofs'));
      if (!proofSnap.empty) {
        const realProofs = proofSnap.docs.map((d) => ({ id: d.id, ...d.data() } as PaymentProofRecord));
        // Merge with existing demos so demo items remain visible if needed
        setPaymentProofs(realProofs);
      }
    } catch (e) {
      console.warn('Admin Firestore fetch note:', e);
    }
  };

  // Review Payment Proof: Approve changes user status to 'Premium' and unlocks international features
  const handleReviewPaymentProof = async (proofId: string, decision: 'approved' | 'rejected') => {
    const target = paymentProofs.find((p) => p.id === proofId);
    if (!target) return;

    // Optimistic UI state update
    setPaymentProofs((prev) =>
      prev.map((p) =>
        p.id === proofId
          ? {
              ...p,
              status: decision,
              reviewedAt: new Date().toISOString(),
              adminDecisionNotes:
                decision === 'approved'
                  ? 'Payment proof verified and approved. Premium activated.'
                  : 'Payment rejected. Invalid or unverifiable transaction proof.',
            }
          : p
      )
    );

    try {
      // 1. Update Payment Proof record in Firestore
      await updateDoc(doc(db, 'payment_proofs', proofId), {
        status: decision,
        reviewedAt: new Date().toISOString(),
        adminDecisionNotes:
          decision === 'approved'
            ? 'Payment proof verified and approved. Premium activated.'
            : 'Payment rejected. Invalid or unverifiable transaction proof.',
      });

      if (decision === 'approved') {
        const expires = new Date();
        expires.setDate(expires.getDate() + 30);

        // 2. Activate Premium Subscription
        await setDoc(
          doc(db, 'subscriptions', target.userId),
          {
            userId: target.userId,
            planId: target.planId,
            status: 'active',
            price: target.amountUsd,
            expiresAt: expires.toISOString(),
            createdAt: new Date().toISOString(),
          },
          { merge: true }
        );

        // 3. Update User Document to Premium
        await setDoc(
          doc(db, 'users', target.userId),
          {
            subscriptionStatus: 'active',
            isPremium: true,
            status: 'active',
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } else {
        await setDoc(
          doc(db, 'subscriptions', target.userId),
          {
            status: 'canceled',
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }
    } catch (err) {
      console.warn('Persist payment proof review notice:', err);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-serif font-bold text-stone-900 mb-1">Restricted Access</h2>
        <p className="text-xs text-stone-500">
          The operations console is reserved for verified HeartMatch Trust & Safety administrators.
        </p>
      </div>
    );
  }

  // Update Product Price in Firestore & Backend
  const handleSaveProductPrice = async (prodId: string) => {
    try {
      const updated = products.map((p) =>
        p.id === prodId ? { ...p, price: Number(editPrice), title: editTitle || p.title } : p
      );
      setProducts(updated);

      await updateProduct(prodId, {
        price: Number(editPrice),
        title: editTitle || undefined,
      });

      setEditingProductId(null);
    } catch (e) {
      console.error('Update price error:', e);
    }
  };

  // 18+ Verification & Photo Pose Audit Action
  const handleUpdateVerification = async (verId: string, status: 'approved' | 'rejected') => {
    try {
      setVerifications((prev) =>
        prev.map((v) => (v.id === verId ? { ...v, status } : v))
      );
      await updateDoc(doc(db, 'verification', verId), { status });

      // Update user's profile and account badges
      const target = verifications.find((v) => v.id === verId);
      if (target) {
        const isApproved = status === 'approved';
        await updateDoc(doc(db, 'profiles', target.userId), {
          verified: isApproved,
          verificationStatus: isApproved ? 'verified' : 'failed',
          profileVerified: isApproved,
        });

        // Sync with backend verification authoritative ledger
        await discoveryService.reviewVerification({
          verificationId: verId,
          decision: isApproved ? 'verified' : 'failed',
          adminNotes: isApproved
            ? 'Identity and age verified by administrator.'
            : 'Verification documents rejected during administrative audit.',
          reviewerId: currentUser?.uid || 'admin_trust_team',
        });
      }
    } catch (e) {
      console.warn('Update verification error:', e);
    }
  };

  // Moderation Action (Warn, Suspend, Ban, Dismiss)
  const handleModerationAction = async (
    repId: string,
    action: 'warned' | 'suspended' | 'banned' | 'dismissed'
  ) => {
    try {
      const targetReport = reports.find((r) => r.id === repId);

      setReports((prev) =>
        prev.map((r) =>
          r.id === repId
            ? { ...r, status: action === 'dismissed' ? 'dismissed' : 'resolved', actionTaken: action }
            : r
        )
      );

      await updateDoc(doc(db, 'reports', repId), {
        status: action === 'dismissed' ? 'dismissed' : 'resolved',
        actionTaken: action,
        adminNotes: `Handled by Trust & Safety admin with action: ${action}`,
      });

      // If suspended or banned, update user account status
      if (targetReport && (action === 'suspended' || action === 'banned')) {
        await updateDoc(doc(db, 'users', targetReport.reportedUserId), {
          status: 'suspended',
          suspendedReason: `Account suspended following safety report: ${targetReport.reason} (${targetReport.details})`,
          suspendedAt: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn('Update report error:', e);
    }
  };

  // Review Account Appeal (Approve = Reinstate, Reject = Maintain Suspension)
  const handleReviewAppeal = async (appealId: string, decision: 'approved' | 'rejected') => {
    try {
      const targetAppeal = appeals.find((a) => a.id === appealId);

      setAppeals((prev) =>
        prev.map((a) => (a.id === appealId ? { ...a, status: decision } : a))
      );

      await safetyService.reviewAppeal(
        appealId,
        decision,
        decision === 'approved' ? 'Appeal approved. Reinstated to active status.' : 'Appeal denied. Suspension upheld.'
      );

      // If approved, reinstate the user in Firestore users collection
      if (targetAppeal && decision === 'approved') {
        await updateDoc(doc(db, 'users', targetAppeal.userId), {
          status: 'active',
          suspendedReason: null,
          suspendedAt: null,
        });
      }
    } catch (e) {
      console.error('Review appeal error:', e);
    }
  };

  const handleAddPromo = () => {
    if (!newPromoCode.trim()) return;
    setPromoCodes([
      ...promoCodes,
      { code: newPromoCode.trim().toUpperCase(), discount: newPromoDiscount || '10% Off', uses: 0, active: true },
    ]);
    setNewPromoCode('');
    setNewPromoDiscount('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left space-y-8 selection:bg-rose-100 selection:text-rose-900">
      {/* Admin Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-stone-900">
              HeartMatch Trust & Operations Center
            </h1>
            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-300">
              Admin Mode
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            System administration, content moderation, 18+ verification audit, appeals review, and configurable pricing.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-100 rounded-xl">
          {(['overview', 'payments', 'verifications', 'moderation', 'appeals', 'pricing', 'promos'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors cursor-pointer ${
                activeTab === tab ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {tab === 'payments' ? (
                <span className="flex items-center gap-1.5">
                  <span>Pending Payments</span>
                  {paymentProofs.filter((p) => p.status === 'pending').length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                      {paymentProofs.filter((p) => p.status === 'pending').length}
                    </span>
                  )}
                </span>
              ) : tab === 'appeals' ? (
                <span className="flex items-center gap-1">
                  <span>Appeals</span>
                  {appeals.filter((a) => a.status === 'pending').length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-rose-600" />
                  )}
                </span>
              ) : tab === 'moderation' ? (
                <span className="flex items-center gap-1">
                  <span>Moderation</span>
                  {reports.filter((r) => r.status === 'pending').length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-rose-600" />
                  )}
                </span>
              ) : (
                tab
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Analytics KPI Cards */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-[11px] font-bold text-stone-400 uppercase">Verified Adults</span>
              <p className="text-2xl font-serif font-bold text-stone-900 mt-1">2,840</p>
              <span className="text-[10px] text-emerald-600 font-semibold">100% 18+ Enforced</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-[11px] font-bold text-stone-400 uppercase">Pending Payments</span>
              <p className="text-2xl font-serif font-bold text-rose-600 mt-1">
                {paymentProofs.filter((p) => p.status === 'pending').length}
              </p>
              <span className="text-[10px] text-rose-700 font-semibold">JazzCash & USDT</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-[11px] font-bold text-stone-400 uppercase">Active Daters (24h)</span>
              <p className="text-2xl font-serif font-bold text-stone-900 mt-1">1,215</p>
              <span className="text-[10px] text-stone-500">Pakistan & Worldwide</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-[11px] font-bold text-stone-400 uppercase">Pending Safety Flags</span>
              <p className="text-2xl font-serif font-bold text-amber-600 mt-1">
                {reports.filter((r) => r.status === 'pending').length}
              </p>
              <span className="text-[10px] text-amber-700 font-semibold">Automated moderation</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-[11px] font-bold text-stone-400 uppercase">Open Appeals</span>
              <p className="text-2xl font-serif font-bold text-rose-600 mt-1">
                {appeals.filter((a) => a.status === 'pending').length}
              </p>
              <span className="text-[10px] text-rose-700 font-semibold">Under human review</span>
            </div>
          </div>

          {/* Activity Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-3">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Matching Volume</h3>
              <p className="text-3xl font-serif font-bold text-stone-900">4,380</p>
              <p className="text-xs text-stone-500 leading-relaxed">
                Mutual matches created with 94% positive sentiment recorded in initial chat exchanges.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-3">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Chat Safety Moderation</h3>
              <p className="text-3xl font-serif font-bold text-stone-900">68,240</p>
              <p className="text-xs text-stone-500 leading-relaxed">
                Gemini AI flagged 42 potential violations for human moderator review before reaching member inboxes.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-3">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Average Trust Audit Time</h3>
              <p className="text-3xl font-serif font-bold text-emerald-600">4.2 min</p>
              <p className="text-xs text-stone-500 leading-relaxed">
                Prompt response time on identity verifications, user reports, and account appeals.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pending Payments Review Table (JazzCash & USDT TRC20 Manual Verification) */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-[11px] font-bold border border-rose-200 mb-2">
                <FileCheck className="w-3.5 h-3.5" />
                <span>Manual Verification Queue</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-stone-900">
                Pending Payments Review Table
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Review submitted JazzCash and Crypto (USDT TRC20) payment proofs. Clicking Approve immediately grants 'Premium' status and unlocks international connections.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
                {paymentProofs.filter((p) => p.status === 'pending').length} Pending Review
              </span>
              <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                {paymentProofs.filter((p) => p.status === 'approved').length} Approved
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] font-bold border-y border-stone-200">
                <tr>
                  <th className="p-3">User & Account</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Plan & Dual Fee</th>
                  <th className="p-3">Transaction ID (TID / TxHash)</th>
                  <th className="p-3">Sender Detail</th>
                  <th className="p-3 text-center">Receipt Slip</th>
                  <th className="p-3">Submitted</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {paymentProofs.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50/50 transition-colors">
                    {/* User */}
                    <td className="p-3">
                      <div className="font-bold text-stone-900">{item.userName}</div>
                      <div className="text-[11px] text-stone-500 font-mono">{item.userEmail}</div>
                      <div className="text-[10px] text-stone-400 mt-0.5">UID: {item.userId.slice(0, 14)}...</div>
                    </td>

                    {/* Method */}
                    <td className="p-3">
                      {item.method === 'JazzCash' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-bold text-[11px]">
                          <span>🇵🇰</span>
                          <span>JazzCash</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[11px]">
                          <span>₮</span>
                          <span>USDT (TRC20)</span>
                        </span>
                      )}
                    </td>

                    {/* Plan & Dual Fee */}
                    <td className="p-3">
                      <div className="font-semibold text-stone-900">{item.planTitle}</div>
                      <div className="text-[11px] text-rose-600 font-bold">
                        {formatDualPrice(item.amountUsd)}
                      </div>
                    </td>

                    {/* Transaction ID */}
                    <td className="p-3 font-mono font-medium text-stone-900">
                      <div className="max-w-[160px] truncate bg-stone-100 px-2 py-1 rounded-md text-[11px] select-all">
                        {item.transactionId}
                      </div>
                    </td>

                    {/* Sender Detail */}
                    <td className="p-3 font-mono text-[11px] text-stone-700">
                      <div className="max-w-[140px] truncate">{item.senderDetail}</div>
                    </td>

                    {/* Receipt Slip Preview / Link */}
                    <td className="p-3 text-center">
                      {item.receiptUrl ? (
                        <button
                          type="button"
                          onClick={() => setSelectedSlipUrl(item.receiptUrl)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-stone-500" />
                          <span>View Slip</span>
                        </button>
                      ) : (
                        <span className="text-stone-400 text-[11px]">No Slip</span>
                      )}
                    </td>

                    {/* Submitted At */}
                    <td className="p-3 text-[11px] text-stone-500 whitespace-nowrap">
                      {new Date(item.submittedAt).toLocaleDateString()} {new Date(item.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    {/* Status */}
                    <td className="p-3">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          item.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800 animate-pulse'
                        }`}
                      >
                        {item.status === 'pending' ? 'Pending Verification' : item.status}
                      </span>
                    </td>

                    {/* Actions: Approve / Reject */}
                    <td className="p-3 text-right">
                      {item.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleReviewPaymentProof(item.id, 'approved')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                            title="Approve and activate Premium membership"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReviewPaymentProof(item.id, 'rejected')}
                            className="px-3 py-1.5 bg-stone-100 hover:bg-rose-50 text-stone-700 hover:text-rose-700 border border-stone-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            title="Reject payment proof"
                          >
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : item.status === 'approved' ? (
                        <div className="flex items-center justify-end gap-1 text-emerald-600 font-bold text-xs">
                          <CheckCircle className="w-4 h-4" />
                          <span>Premium Active</span>
                        </div>
                      ) : (
                        <span className="text-stone-400 text-xs">Rejected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 18+ Verification & Optional Profile Photo Verification Tab */}
      {activeTab === 'verifications' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-stone-900">18+ Identity & Photo Pose Audit Queue</h3>
              <p className="text-xs text-stone-500">
                Review adult age declarations, government IDs, and optional photo selfie pose challenges.
              </p>
            </div>
            <span className="text-xs text-stone-400">{verifications.length} total submissions</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Audit Type</th>
                  <th className="p-3">Details / Pose</th>
                  <th className="p-3">Document Preview</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {verifications.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50/50">
                    <td className="p-3 font-semibold text-stone-900">{item.userName || item.userId}</td>
                    <td className="p-3 capitalize">
                      {item.docType === 'selfie' ? 'Optional Photo Pose' : `18+ ID (${item.docType})`}
                    </td>
                    <td className="p-3 text-stone-600">{item.notes || 'Age confirmed 18+'}</td>
                    <td className="p-3">
                      {item.idDocUrl || item.selfieUrl ? (
                        <a
                          href={item.idDocUrl || item.selfieUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-rose-600 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Media</span>
                        </a>
                      ) : (
                        <span className="text-stone-400">Camera match</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : item.status === 'rejected'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {item.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3">
                      {item.status === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateVerification(item.id, 'approved')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateVerification(item.id, 'rejected')}
                            className="px-2.5 py-1 border border-stone-300 hover:bg-stone-100 rounded text-[11px] text-stone-700 cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-stone-400 text-[11px]">Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Moderation Reports Tab (Spam, Scam, Harassment, Offensive, Underage) */}
      {activeTab === 'moderation' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-stone-900">Content Moderation & AI Safety Flags</h3>
              <p className="text-xs text-stone-500">
                Spam, scam, harassment, and offensive content flagged for human review.
              </p>
            </div>
            <span className="text-xs text-rose-600 font-semibold bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
              AI flags require human approval
            </span>
          </div>

          <div className="space-y-3">
            {reports.map((rep) => (
              <div
                key={rep.id}
                className="p-5 rounded-2xl border border-stone-200 bg-stone-50 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-stone-900">
                      Reported: {rep.reportedUserName || rep.reportedUserId}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        rep.category === 'scam_fraud'
                          ? 'bg-amber-100 text-amber-800'
                          : rep.category === 'harassment'
                          ? 'bg-rose-100 text-rose-800'
                          : rep.category === 'spam'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-stone-200 text-stone-800'
                      }`}
                    >
                      {rep.category || rep.reason}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {new Date(rep.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-stone-700 leading-relaxed font-medium">"{rep.details}"</p>

                  {rep.reportedMessageText && (
                    <div className="p-2.5 bg-white rounded-xl border border-stone-200 text-xs text-stone-600 flex items-start gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] uppercase font-bold text-stone-400 block">Flagged Chat Message:</span>
                        <p className="italic">"{rep.reportedMessageText}"</p>
                      </div>
                    </div>
                  )}

                  {rep.actionTaken && (
                    <span className="text-[11px] text-emerald-700 font-semibold block">
                      Action Taken: {rep.actionTaken.toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {rep.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleModerationAction(rep.id, 'warned')}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg cursor-pointer"
                      >
                        Warn User
                      </button>
                      <button
                        onClick={() => handleModerationAction(rep.id, 'suspended')}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg cursor-pointer"
                      >
                        Suspend User
                      </button>
                      <button
                        onClick={() => handleModerationAction(rep.id, 'dismissed')}
                        className="px-3 py-1.5 border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-medium rounded-lg cursor-pointer"
                      >
                        Dismiss Flag
                      </button>
                    </>
                  ) : (
                    <span className="text-xs font-semibold text-stone-400 capitalize">
                      Status: {rep.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Account Appeals Queue Tab */}
      {activeTab === 'appeals' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-stone-900">Suspended Account Appeals</h3>
              <p className="text-xs text-stone-500">
                Review user appeals and determine if accounts should be reinstated.
              </p>
            </div>
            <span className="text-xs text-stone-400">{appeals.length} submissions</span>
          </div>

          <div className="space-y-4">
            {appeals.map((appeal) => (
              <div
                key={appeal.id}
                className="p-5 rounded-2xl border border-stone-200 bg-stone-50 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <strong className="text-sm font-bold text-stone-900">{appeal.userName}</strong>
                    <span className="text-xs text-stone-500 block">
                      Email: {appeal.contactEmail || appeal.userEmail} · Submitted:{' '}
                      {new Date(appeal.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold self-start sm:self-auto ${
                      appeal.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : appeal.status === 'rejected'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {appeal.status.toUpperCase()}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs space-y-1">
                  <span className="text-[10px] font-bold text-stone-400 uppercase">Suspension Context:</span>
                  <p className="text-stone-700">{appeal.suspensionReason}</p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs space-y-1">
                  <span className="text-[10px] font-bold text-stone-400 uppercase">User Appeal Statement:</span>
                  <p className="text-stone-800 leading-relaxed font-serif text-sm">
                    "{appeal.appealStatement}"
                  </p>
                </div>

                {appeal.status === 'pending' ? (
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => handleReviewAppeal(appeal.id, 'approved')}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Approve & Reinstate Account
                    </button>
                    <button
                      onClick={() => handleReviewAppeal(appeal.id, 'rejected')}
                      className="px-4 py-1.5 bg-stone-800 hover:bg-black text-white rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Reject Appeal
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-stone-500">
                    Decision recorded: <strong>{appeal.status}</strong>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pricing & Products Management Tab (Configurable system) */}
      {activeTab === 'pricing' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-stone-900">Configurable Product Catalogue & Pricing</h3>
              <p className="text-xs text-stone-500">
                Change subscription and one-time consumable prices directly without modifying application code.
              </p>
            </div>
            <button
              onClick={loadAdminData}
              className="p-2 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-100 cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((p) => {
              const isEditing = editingProductId === p.id;
              return (
                <div key={p.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-stone-900">{p.title}</h4>
                      <span className="text-[10px] text-stone-400 uppercase">
                        {p.category} · {p.interval || 'consumable'}
                      </span>
                    </div>
                    <span className="text-xl font-serif font-bold text-stone-950">${p.price.toFixed(2)}</span>
                  </div>

                  {isEditing ? (
                    <div className="space-y-2 pt-2 border-t border-stone-200">
                      <div>
                        <label className="block text-[11px] text-stone-500">Display Title</label>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full border border-stone-300 rounded px-2.5 py-1 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-stone-500">Price (USD)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editPrice}
                          onChange={(e) => setEditPrice(Number(e.target.value))}
                          className="w-full border border-stone-300 rounded px-2.5 py-1 text-xs"
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleSaveProductPrice(p.id)}
                          className="px-3 py-1 bg-stone-900 text-white rounded text-xs font-semibold cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingProductId(null)}
                          className="px-3 py-1 border border-stone-300 rounded text-xs text-stone-600 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingProductId(p.id);
                        setEditPrice(p.price);
                        setEditTitle(p.title);
                      }}
                      className="w-full py-1.5 border border-stone-300 hover:bg-stone-100 rounded-lg text-xs font-semibold text-stone-700 cursor-pointer"
                    >
                      Edit Price & Details
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Promo Codes Management Tab */}
      {activeTab === 'promos' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-6">
          <div>
            <h3 className="text-base font-bold text-stone-900">Promo & Discount Codes</h3>
            <p className="text-xs text-stone-500">Create promotional codes for marketing campaigns.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 p-4 bg-stone-50 rounded-2xl border border-stone-200">
            <input
              type="text"
              placeholder="Code (e.g. SUMMER25)"
              value={newPromoCode}
              onChange={(e) => setNewPromoCode(e.target.value)}
              className="w-full sm:w-1/3 border border-stone-300 rounded-lg px-3 py-2 text-xs uppercase focus:ring-rose-500"
            />
            <input
              type="text"
              placeholder="Description (e.g. 25% Off Monthly)"
              value={newPromoDiscount}
              onChange={(e) => setNewPromoDiscount(e.target.value)}
              className="w-full sm:w-1/2 border border-stone-300 rounded-lg px-3 py-2 text-xs focus:ring-rose-500"
            />
            <button
              onClick={handleAddPromo}
              className="w-full sm:w-auto px-4 py-2 bg-stone-900 hover:bg-black text-white text-xs font-semibold rounded-lg shrink-0 cursor-pointer"
            >
              Add Promo Code
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {promoCodes.map((p, i) => (
              <div key={i} className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-1">
                <span className="text-sm font-bold text-rose-700 font-mono">{p.code}</span>
                <p className="text-xs text-stone-700">{p.discount}</p>
                <p className="text-[11px] text-stone-400">{p.uses} Redemptions · Active</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Receipt Fullscreen Modal */}
      {selectedSlipUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 text-left relative shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  Payment Receipt Slip
                </h3>
                <p className="text-xs text-stone-500">
                  Transaction slip submitted by member for manual audit
                </p>
              </div>
              <button
                onClick={() => setSelectedSlipUrl(null)}
                className="p-1.5 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[65vh] overflow-auto rounded-2xl border border-stone-200 bg-stone-50 flex items-center justify-center p-2">
              <img
                src={selectedSlipUrl}
                alt="Receipt Slip Proof"
                className="max-h-[60vh] w-auto object-contain rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedSlipUrl(null)}
                className="px-5 py-2.5 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
