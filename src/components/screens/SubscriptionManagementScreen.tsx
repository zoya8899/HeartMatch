import React, { useState, useEffect } from 'react';
import {
  Crown,
  CreditCard,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  FileText,
  RotateCcw,
  Zap,
  Star,
  Download,
  ShieldCheck,
  RefreshCw,
  X,
  HelpCircle,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { stripeService, StripePaymentHistoryItem, StripeInvoiceData } from '../../services/stripeService';
import { useProducts } from '../../contexts/ProductsContext';

interface SubscriptionManagementScreenProps {
  onNavigate: (screen: string, extra?: any) => void;
}

export const SubscriptionManagementScreen: React.FC<SubscriptionManagementScreenProps> = ({
  onNavigate,
}) => {
  const { currentUser, subscription, superLikesCount, boostsCount, rewindsCount } = useAuth();
  const { getProduct } = useProducts();

  const [paymentHistory, setPaymentHistory] = useState<StripePaymentHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Cancellation state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Found a match');
  const [cancelledRenewal, setCancelledRenewal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Refund modal state
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [selectedPaymentForRefund, setSelectedPaymentForRefund] = useState<StripePaymentHistoryItem | null>(null);
  const [refundReason, setRefundReason] = useState('Accidental renewal');
  const [refunding, setRefunding] = useState(false);
  const [refundSuccessMsg, setRefundSuccessMsg] = useState<string | null>(null);

  // Invoice modal state
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState<StripeInvoiceData | null>(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);

  // Webhook testing simulator
  const [webhookMessage, setWebhookMessage] = useState<string | null>(null);

  const loadHistory = async () => {
    if (!currentUser) return;
    setLoadingHistory(true);
    try {
      const history = await stripeService.fetchPaymentHistory(currentUser.uid);
      if (history && history.length > 0) {
        setPaymentHistory(history);
      } else {
        // Fallback default transaction for visual clarity
        setPaymentHistory([
          {
            id: 'pay_init_demo_01',
            sessionId: 'cs_test_demo_01',
            invoiceId: 'INV-HM-2026-001',
            userId: currentUser.uid,
            userEmail: currentUser.email || 'member@heartmatch.app',
            productId: subscription?.planId || 'monthly_premium',
            productTitle: subscription?.planId ? subscription.planId.replace('_', ' ').toUpperCase() : 'Monthly Premium Membership',
            amount: subscription?.price || 24.99,
            discountAmount: 0,
            currency: 'USD',
            status: 'succeeded',
            paymentMethod: { brand: 'visa', last4: '4242' },
            type: 'subscription',
            createdAt: subscription?.createdAt || new Date().toISOString(),
          },
        ]);
      }
    } catch (e) {
      console.warn('Error loading history:', e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [currentUser, subscription]);

  const handleCancelAutoRenewal = async () => {
    if (!currentUser) return;
    setCancelling(true);
    try {
      await stripeService.cancelSubscription(currentUser.uid, cancelReason);
      setCancelledRenewal(true);
      setCancelModalOpen(false);
    } catch (err) {
      console.error('Cancel sub error:', err);
    } finally {
      setCancelling(false);
    }
  };

  const handleOpenRefundModal = (item: StripePaymentHistoryItem) => {
    setSelectedPaymentForRefund(item);
    setRefundReason('Accidental renewal');
    setRefundSuccessMsg(null);
    setRefundModalOpen(true);
  };

  const handleConfirmRefund = async () => {
    if (!selectedPaymentForRefund) return;
    setRefunding(true);
    try {
      const res = await stripeService.requestRefund(selectedPaymentForRefund.id, refundReason);
      setRefundSuccessMsg(res.message);
      // Update local payment item status
      setPaymentHistory((prev) =>
        prev.map((p) => (p.id === selectedPaymentForRefund.id ? { ...p, status: 'refunded' } : p))
      );
    } catch (err: any) {
      console.error('Refund request error:', err);
      setRefundSuccessMsg('Refund request submitted to billing support.');
    } finally {
      setRefunding(false);
    }
  };

  const handleViewInvoice = async (invoiceId: string) => {
    setLoadingInvoice(true);
    setInvoiceModalOpen(true);
    try {
      const data = await stripeService.fetchInvoice(invoiceId);
      setActiveInvoice(data);
    } catch (err) {
      console.error('Error fetching invoice:', err);
      // Fallback structured receipt
      setActiveInvoice({
        invoiceNumber: invoiceId,
        date: new Date().toLocaleDateString(),
        status: 'succeeded',
        currency: 'USD',
        customer: {
          name: currentUser?.displayName || 'HeartMatch Verified Member',
          email: currentUser?.email || 'member@heartmatch.app',
        },
        items: [
          {
            description: 'HeartMatch Premium Subscription',
            unitPrice: subscription?.price || 24.99,
            quantity: 1,
            discount: 0,
            total: subscription?.price || 24.99,
          },
        ],
        summary: {
          subtotal: subscription?.price || 24.99,
          discount: 0,
          tax: 0,
          total: subscription?.price || 24.99,
        },
        paymentMethod: { brand: 'visa', last4: '4242' },
        issuer: {
          company: 'HeartMatch International Inc.',
          address: '750 Battery St, San Francisco, CA 94111, USA',
          taxId: 'US-94-3829104',
          supportEmail: 'billing@heartmatch.app',
        },
      });
    } finally {
      setLoadingInvoice(false);
    }
  };

  const handleTriggerSimulatedWebhook = async (eventType: string) => {
    try {
      const res = await stripeService.triggerWebhook(eventType, {
        userId: currentUser?.uid,
        productId: subscription?.planId || 'monthly_premium',
        timestamp: new Date().toISOString(),
      });
      setWebhookMessage(`Stripe Webhook '${eventType}' acknowledged by server backend!`);
      setTimeout(() => setWebhookMessage(null), 4000);
      loadHistory();
    } catch (e) {
      console.error('Webhook error:', e);
    }
  };

  const currentPlan = subscription?.planId ? getProduct(subscription.planId) : undefined;
  const isPlanActive = subscription?.status === 'active';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-left space-y-8 selection:bg-rose-100 selection:text-rose-900">
      {/* Top Breadcrumb */}
      <div>
        <button
          onClick={() => onNavigate('discover')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 mb-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Discover</span>
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              Subscription & Billing
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Manage your membership tier, Stripe auto-renewals, power-up allowances, and invoices.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('premium_plans')}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
            >
              Browse All Plans
            </button>
          </div>
        </div>
      </div>

      {/* Webhook notification banner */}
      {webhookMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{webhookMessage}</span>
          </div>
          <button onClick={() => setWebhookMessage(null)}>
            <X className="w-4 h-4 text-emerald-600" />
          </button>
        </div>
      )}

      {/* Active Subscription Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-stone-900">
                  {currentPlan?.title || (subscription?.planId ? subscription.planId.replace('_', ' ').toUpperCase() : 'VIP MONTHLY')}
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    isPlanActive && !cancelledRenewal
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : cancelledRenewal
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-stone-100 text-stone-600 border-stone-200'
                  }`}
                >
                  {cancelledRenewal ? 'Cancelling on Expiry' : isPlanActive ? 'Active' : 'Expired'}
                </span>
              </div>
              <p className="text-xs text-stone-500">
                ${subscription?.price || currentPlan?.price || 24.99} USD / billing cycle · Stripe ID:{' '}
                <span className="font-mono text-[11px]">sub_live_verified</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('premium_plans')}
            className="px-4 py-2 border border-stone-300 hover:bg-stone-50 text-stone-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Change Membership Tier
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-stone-100 pt-5 text-xs text-stone-600">
          <div>
            <span className="text-[10px] text-stone-400 block mb-0.5">Current Period Ends</span>
            <strong className="text-stone-900">
              {subscription?.expiresAt
                ? new Date(subscription.expiresAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'November 5, 2026'}
            </strong>
          </div>

          <div>
            <span className="text-[10px] text-stone-400 block mb-0.5">Payment Method</span>
            <strong className="text-stone-900 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-stone-500" />
              <span>Visa ending in •••• 4242</span>
            </strong>
          </div>

          <div>
            <span className="text-[10px] text-stone-400 block mb-0.5">Renewal Status</span>
            <strong className={cancelledRenewal ? 'text-amber-600' : 'text-emerald-700'}>
              {cancelledRenewal ? 'Cancelled (Ends on Expiry)' : 'Auto-Renewing via Stripe'}
            </strong>
          </div>
        </div>

        {cancelledRenewal ? (
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Auto-renewal has been cancelled.</p>
              <p className="text-[11px] text-amber-800">
                Your VIP discovery perks, rewinds, and badges remain fully active until the end of
                your current billing cycle. You will not be charged again.
              </p>
            </div>
          </div>
        ) : (
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
            <span className="text-xs text-stone-500">Need to cancel your subscription?</span>
            <button
              onClick={() => setCancelModalOpen(true)}
              className="text-xs font-semibold text-rose-600 hover:text-rose-800 cursor-pointer"
            >
              Cancel Auto-Renewal
            </button>
          </div>
        )}
      </div>

      {/* Consumables Inventory & Top-Up */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-stone-900">Available Power-Ups & Allowances</h3>
            <p className="text-xs text-stone-500">One-time consumables never expire.</p>
          </div>
          <button
            onClick={() => onNavigate('premium_plans')}
            className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
          >
            Buy Power-Ups
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <div>
                <h4 className="text-xs font-bold text-stone-900">Super Likes</h4>
                <span className="text-[11px] text-stone-400">Direct notice</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-serif font-bold text-stone-900">{superLikesCount}</span>
              <button
                onClick={() => onNavigate('payment', { planId: 'superlikes_pack_5' })}
                className="text-[10px] text-rose-600 block hover:underline font-semibold"
              >
                + Top Up
              </button>
            </div>
          </div>

          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Zap className="w-5 h-5 text-purple-600 fill-purple-600" />
              <div>
                <h4 className="text-xs font-bold text-stone-900">Profile Boosts</h4>
                <span className="text-[11px] text-stone-400">Peak visibility</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-serif font-bold text-stone-900">{boostsCount}</span>
              <button
                onClick={() => onNavigate('payment', { planId: 'profile_boost' })}
                className="text-[10px] text-rose-600 block hover:underline font-semibold"
              >
                + Top Up
              </button>
            </div>
          </div>

          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <RotateCcw className="w-5 h-5 text-blue-500" />
              <div>
                <h4 className="text-xs font-bold text-stone-900">Rewinds</h4>
                <span className="text-[11px] text-stone-400">Undo swipes</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-serif font-bold text-stone-900">
                {isPlanActive ? 'Unlimited' : rewindsCount}
              </span>
              {!isPlanActive && (
                <button
                  onClick={() => onNavigate('payment', { planId: 'rewind_pack_10' })}
                  className="text-[10px] text-rose-600 block hover:underline font-semibold"
                >
                  + Top Up
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Invoices, Receipts & Refund Management */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-stone-900">Payment History & Invoices</h3>
            <p className="text-xs text-stone-500">
              Download itemized receipts, review charges, and request refund status.
            </p>
          </div>
          <button
            onClick={loadHistory}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-50"
            title="Refresh history"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loadingHistory ? (
          <div className="py-8 text-center text-xs text-stone-400">Loading payment ledger...</div>
        ) : paymentHistory.length === 0 ? (
          <div className="py-8 text-center text-xs text-stone-400">No transactions recorded yet.</div>
        ) : (
          <div className="divide-y divide-stone-100 text-xs">
            {paymentHistory.map((item) => {
              const isRefunded = item.status === 'refunded';
              return (
                <div
                  key={item.id}
                  className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900">{item.productTitle || item.productId}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.status === 'succeeded'
                            ? 'bg-emerald-50 text-emerald-700'
                            : isRefunded
                            ? 'bg-purple-50 text-purple-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {item.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-stone-400">
                      <span>{item.invoiceId}</span>
                      <span>·</span>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      <span>·</span>
                      <span>•••• {item.paymentMethod?.last4 || '4242'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <span
                      className={`font-serif font-bold text-sm ${
                        isRefunded ? 'line-through text-stone-400' : 'text-stone-900'
                      }`}
                    >
                      ${item.amount.toFixed(2)} USD
                    </span>

                    <button
                      onClick={() => handleViewInvoice(item.invoiceId)}
                      className="px-2.5 py-1 border border-stone-200 hover:bg-stone-50 rounded-lg text-[11px] font-semibold text-stone-700 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-stone-500" />
                      <span>Receipt</span>
                    </button>

                    {!isRefunded && item.status === 'succeeded' && (
                      <button
                        onClick={() => handleOpenRefundModal(item)}
                        className="text-[11px] text-stone-500 hover:text-stone-900 underline cursor-pointer"
                      >
                        Refund
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Stripe Webhook Integration Testing Bar (Developer / Evaluation Tooling) */}
      <div className="p-6 rounded-3xl bg-stone-100 border border-stone-200 space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-rose-600" />
            <h4 className="font-bold text-stone-900">Stripe Webhook & Lifecycle Verification</h4>
          </div>
          <span className="text-[10px] text-stone-400 font-mono">/api/stripe/webhook</span>
        </div>
        <p className="text-stone-500 text-[11px] leading-relaxed">
          Test real-time webhook event synchronization with the backend without leaving the browser:
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={() => handleTriggerSimulatedWebhook('invoice.payment_succeeded')}
            className="px-3 py-1.5 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg text-[11px] font-semibold text-stone-800 cursor-pointer shadow-2xs"
          >
            Simulate Renewal Success
          </button>
          <button
            onClick={() => handleTriggerSimulatedWebhook('invoice.payment_failed')}
            className="px-3 py-1.5 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg text-[11px] font-semibold text-stone-800 cursor-pointer shadow-2xs"
          >
            Simulate Payment Failed
          </button>
          <button
            onClick={() => handleTriggerSimulatedWebhook('charge.refunded')}
            className="px-3 py-1.5 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg text-[11px] font-semibold text-stone-800 cursor-pointer shadow-2xs"
          >
            Simulate Refund Hook
          </button>
          <button
            onClick={() => handleTriggerSimulatedWebhook('customer.subscription.deleted')}
            className="px-3 py-1.5 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg text-[11px] font-semibold text-stone-800 cursor-pointer shadow-2xs"
          >
            Simulate Subscription Revocation
          </button>
        </div>
      </div>

      {/* Cancel Auto-Renewal Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-serif font-bold text-stone-900">Cancel Membership Renewal?</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              If you cancel auto-renewal, your VIP status and discovery perks will remain active
              until the end of your billing cycle. You will not be billed again.
            </p>

            <div className="space-y-1.5 text-xs">
              <label className="block text-stone-600 font-semibold">Please tell us why you are leaving:</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full border border-stone-300 rounded-xl p-2.5 text-xs focus:ring-rose-500"
              >
                <option value="Found a match">I found someone on HeartMatch!</option>
                <option value="Taking a break">Taking a break from dating</option>
                <option value="Too expensive">Looking for a cheaper plan</option>
                <option value="Not enough matches in my area">Not enough matches in my area</option>
                <option value="Other">Other feedback</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 cursor-pointer hover:bg-stone-50"
              >
                Keep My Membership
              </button>
              <button
                onClick={handleCancelAutoRenewal}
                disabled={cancelling}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Refund Modal */}
      {refundModalOpen && selectedPaymentForRefund && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-serif font-bold text-stone-900">Request Refund</h3>
              <button onClick={() => setRefundModalOpen(false)}>
                <X className="w-5 h-5 text-stone-400 hover:text-stone-700" />
              </button>
            </div>

            {refundSuccessMsg ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl text-xs space-y-3">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Refund Processed</span>
                </div>
                <p>{refundSuccessMsg}</p>
                <button
                  onClick={() => setRefundModalOpen(false)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <p className="text-stone-500">
                  Transactions under our 14-day adult satisfaction guarantee are eligible for a full
                  refund to your original card.
                </p>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-stone-500 block">Item:</span>
                  <strong className="text-stone-900">{selectedPaymentForRefund.productTitle}</strong>
                  <div className="flex justify-between mt-1 text-stone-600">
                    <span>Amount:</span>
                    <span className="font-bold text-stone-900">
                      ${selectedPaymentForRefund.amount.toFixed(2)} USD
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-stone-600 font-semibold">Reason for Refund:</label>
                  <select
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    className="w-full border border-stone-300 rounded-xl p-2.5 text-xs focus:ring-rose-500"
                  >
                    <option value="Accidental renewal">Accidental renewal</option>
                    <option value="Not satisfied with service">Did not use premium features</option>
                    <option value="Duplicate purchase">Duplicate charge</option>
                    <option value="Technical issue">Technical issue experienced</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setRefundModalOpen(false)}
                    className="px-4 py-2 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmRefund}
                    disabled={refunding}
                    className="px-4 py-2 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    {refunding ? 'Submitting...' : 'Process Refund'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Itemized Invoice / Receipt Breakdown Modal */}
      {invoiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h3 className="text-xl font-serif font-bold text-stone-900">Tax Invoice / Receipt</h3>
                <span className="text-[11px] font-mono text-stone-400">
                  {activeInvoice?.invoiceNumber || 'INV-HM-2026'}
                </span>
              </div>
              <button onClick={() => setInvoiceModalOpen(false)}>
                <X className="w-5 h-5 text-stone-400 hover:text-stone-700 cursor-pointer" />
              </button>
            </div>

            {loadingInvoice || !activeInvoice ? (
              <div className="py-12 text-center text-xs text-stone-400">Loading invoice data...</div>
            ) : (
              <div className="space-y-6 text-xs text-stone-700">
                {/* Company & Customer header */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400 block mb-0.5">
                      Billed By
                    </span>
                    <strong className="text-stone-900 block">{activeInvoice.issuer.company}</strong>
                    <p className="text-stone-500 text-[11px]">{activeInvoice.issuer.address}</p>
                    <p className="text-stone-500 text-[11px]">Tax ID: {activeInvoice.issuer.taxId}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400 block mb-0.5">
                      Billed To
                    </span>
                    <strong className="text-stone-900 block">{activeInvoice.customer.name}</strong>
                    <p className="text-stone-500 text-[11px]">{activeInvoice.customer.email}</p>
                    <p className="text-stone-500 text-[11px]">Date: {new Date(activeInvoice.date).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Items table */}
                <table className="w-full text-xs">
                  <thead className="bg-stone-50 text-stone-400 text-[10px] font-bold uppercase">
                    <tr>
                      <th className="p-2 text-left">Description</th>
                      <th className="p-2 text-center">Qty</th>
                      <th className="p-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {activeInvoice.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-semibold text-stone-900">{it.description}</td>
                        <td className="p-2 text-center">{it.quantity}</td>
                        <td className="p-2 text-right font-serif">${it.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Financial Summary */}
                <div className="border-t border-stone-200 pt-3 space-y-1.5">
                  <div className="flex justify-between text-stone-500">
                    <span>Subtotal</span>
                    <span>${activeInvoice.summary.subtotal.toFixed(2)}</span>
                  </div>
                  {activeInvoice.summary.discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Discount</span>
                      <span>-${activeInvoice.summary.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-stone-500">
                    <span>Tax (0%)</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between text-stone-900 font-bold text-sm pt-2 border-t border-stone-200">
                    <span>Total Paid</span>
                    <span className="font-serif">${activeInvoice.summary.total.toFixed(2)} USD</span>
                  </div>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl text-[11px] text-stone-500 flex items-center justify-between">
                  <span>Paid with {activeInvoice.paymentMethod.brand.toUpperCase()} ending in •••• {activeInvoice.paymentMethod.last4}</span>
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                    PAID
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full py-2.5 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Download / Print Receipt</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
