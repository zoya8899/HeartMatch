import React, { useState } from 'react';
import {
  Crown,
  Sparkles,
  CheckCircle,
  X,
  CreditCard,
  Lock,
  Tag,
  Star,
  Zap,
  RotateCcw,
  Flame,
  Check,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { DEFAULT_PRODUCTS } from '../../services/seedData';
import { stripeService } from '../../services/stripeService';
import { SubscriptionPlanId } from '../../types';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, subscription, activateSubscription, addConsumable } = useAuth();

  const [activeTab, setActiveTab] = useState<'subscriptions' | 'consumables' | 'manage'>('subscriptions');
  const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionPlanId>('monthly_premium');
  const [promoCode, setPromoCode] = useState<string>('');
  const [discountNotice, setDiscountNotice] = useState<string | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState<boolean>(false);
  const [cancelledRenewal, setCancelledRenewal] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentPlan = DEFAULT_PRODUCTS.find((p) => p.id === selectedPlanId);

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (code === 'WELCOME50' || code === 'HEART50') {
      setDiscountNotice('50% discount applied via promo code!');
    } else if (code === 'LOVE20') {
      setDiscountNotice('20% discount applied via promo code!');
    } else if (code === 'VIP100') {
      setDiscountNotice('100% Free VIP promo code applied!');
    } else {
      setDiscountNotice('Invalid or expired promo code.');
    }
  };

  const handleSubscribe = async () => {
    if (!currentUser || !currentPlan) return;
    setProcessing(true);

    try {
      // Create Stripe checkout session
      const session = await stripeService.createCheckoutSession({
        userId: currentUser.uid,
        userEmail: currentUser.email || '',
        productId: currentPlan.id,
        planTitle: currentPlan.title,
        price: currentPlan.price,
        type: 'subscription',
        promoCode,
      });

      // Securely grant entitlement
      await activateSubscription(currentPlan.id as SubscriptionPlanId, session.finalPrice);

      setProcessing(false);
      setCheckoutSuccess(true);
      setTimeout(() => {
        setCheckoutSuccess(false);
        onClose();
      }, 1800);
    } catch (err) {
      console.error('Checkout error:', err);
      setProcessing(false);
    }
  };

  const handleBuyConsumable = async (item: typeof DEFAULT_PRODUCTS[0]) => {
    if (!currentUser) return;
    setProcessing(true);

    try {
      await stripeService.createCheckoutSession({
        userId: currentUser.uid,
        userEmail: currentUser.email || '',
        productId: item.id,
        planTitle: item.title,
        price: item.price,
        type: 'consumable',
      });

      if (item.consumableType === 'superlike') addConsumable('superlike', item.quantity || 5);
      if (item.consumableType === 'boost') addConsumable('boost', item.quantity || 1);
      if (item.consumableType === 'spotlight') addConsumable('spotlight', item.quantity || 1);
      if (item.consumableType === 'rewind') addConsumable('rewind', item.quantity || 10);

      setProcessing(false);
      setCheckoutSuccess(true);
      setTimeout(() => {
        setCheckoutSuccess(false);
      }, 1500);
    } catch (err) {
      console.error('Consumable purchase error:', err);
      setProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!currentUser) return;
    try {
      await stripeService.cancelSubscription(currentUser.uid);
      setCancelledRenewal(true);
    } catch (err) {
      console.error('Cancel sub error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative text-left max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-500 text-white flex items-center justify-center mx-auto mb-2 shadow-sm">
            <Crown className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-stone-900">HeartMatch Premium</h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Boost your connection potential with unrestricted discovery & perks
          </p>

          {/* Tab Selector */}
          <div className="flex items-center justify-center gap-1 mt-4 p-1 bg-stone-100 rounded-xl max-w-xs mx-auto">
            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'subscriptions' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Memberships
            </button>
            <button
              onClick={() => setActiveTab('consumables')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'consumables' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Power-Ups
            </button>
            {subscription?.status === 'active' && (
              <button
                onClick={() => setActiveTab('manage')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  activeTab === 'manage' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Manage
              </button>
            )}
          </div>
        </div>

        {checkoutSuccess ? (
          <div className="py-12 text-center space-y-3 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-stone-900">Payment Succeeded!</h4>
            <p className="text-xs text-stone-500">Your entitlements and perks are activated immediately.</p>
          </div>
        ) : activeTab === 'subscriptions' ? (
          <div>
            {/* Subscription Plans Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              {DEFAULT_PRODUCTS.filter((p) => p.category === 'subscription').map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id as SubscriptionPlanId)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between relative ${
                      isSelected
                        ? 'border-rose-600 bg-rose-50/30 ring-2 ring-rose-600'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    {plan.badge && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                        {plan.badge}
                      </span>
                    )}

                    <div>
                      <h4 className="text-xs font-bold text-stone-900">{plan.title}</h4>
                      <p className="text-2xl font-serif font-bold text-stone-950 mt-2">${plan.price}</p>
                      <span className="text-[10px] text-stone-400">
                        {plan.interval === '7days'
                          ? 'for 7 days'
                          : plan.interval === '1month'
                          ? 'monthly billing'
                          : plan.interval === '3months'
                          ? 'quarterly billing'
                          : 'one-time'}
                      </span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-stone-100">
                      <span className="text-[10px] font-semibold text-rose-600 block">
                        {plan.id === 'vip_monthly' ? 'Direct Message + VIP Badge' : 'Unlimited Likes + Rewinds'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Plan Details & Features */}
            {currentPlan && (
              <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 mb-6">
                <h4 className="text-xs font-bold text-stone-900 mb-3 uppercase tracking-wider">
                  Included in {currentPlan.title}:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-700">
                  {currentPlan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Promo Code Input */}
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Promo Code (e.g. WELCOME50, VIP100)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="w-full uppercase border border-stone-300 rounded-lg pl-9 pr-3 py-2 text-xs focus:ring-rose-500 focus:border-rose-500"
                />
              </div>
              <button
                type="button"
                onClick={handleApplyPromo}
                className="px-4 py-2 border border-stone-300 hover:bg-stone-100 rounded-lg text-xs font-semibold text-stone-700"
              >
                Apply
              </button>
            </div>

            {discountNotice && (
              <div className="p-2 mb-4 text-xs bg-amber-50 text-amber-800 rounded-lg border border-amber-200">
                {discountNotice}
              </div>
            )}

            {/* Checkout Action Button */}
            <button
              onClick={handleSubscribe}
              disabled={processing}
              className="w-full py-3 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <CreditCard className="w-4 h-4" />
              <span>
                {processing ? 'Processing via Stripe...' : `Upgrade to ${currentPlan?.title} ($${currentPlan?.price})`}
              </span>
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400 mt-3 text-center">
              <Lock className="w-3 h-3" />
              <span>Secure 256-bit encrypted checkout powered by Stripe. Cancel anytime.</span>
            </div>
          </div>
        ) : activeTab === 'consumables' ? (
          /* Consumables / Power-ups Store */
          <div className="space-y-3">
            {DEFAULT_PRODUCTS.filter((p) => p.category === 'consumable').map((item) => (
              <div
                key={item.id}
                className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-stone-700 shadow-xs">
                    {item.consumableType === 'superlike' && <Star className="w-5 h-5 text-amber-500 fill-amber-500" />}
                    {item.consumableType === 'boost' && <Zap className="w-5 h-5 text-purple-600 fill-purple-600" />}
                    {item.consumableType === 'spotlight' && <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />}
                    {item.consumableType === 'rewind' && <RotateCcw className="w-5 h-5 text-blue-500" />}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-stone-900">{item.title}</h4>
                    <p className="text-[11px] text-stone-500">{item.description}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleBuyConsumable(item)}
                  disabled={processing}
                  className="px-4 py-2 bg-stone-900 hover:bg-black text-white text-xs font-semibold rounded-lg shrink-0 transition-colors shadow-xs"
                >
                  Buy for ${item.price}
                </button>
              </div>
            ))}
          </div>
        ) : (
          /* Manage Subscription Tab */
          <div className="space-y-4">
            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-stone-900">Current Plan: {subscription?.planId?.replace('_', ' ')}</h4>
                  <p className="text-xs text-stone-500">Billed at ${subscription?.price}</p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  Active
                </span>
              </div>

              <div className="text-xs text-stone-600 border-t border-stone-200 pt-3">
                <p>Renews On: <strong>{new Date(subscription?.expiresAt || '').toLocaleDateString()}</strong></p>
                <p className="text-[11px] text-stone-400 mt-0.5">Payment method securely managed through Stripe.</p>
              </div>
            </div>

            {cancelledRenewal ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                Auto-renewal has been cancelled. Your benefits remain active until {new Date(subscription?.expiresAt || '').toLocaleDateString()}.
              </div>
            ) : (
              <button
                onClick={handleCancelSubscription}
                className="w-full py-2.5 border border-stone-300 hover:bg-stone-50 text-rose-600 text-xs font-semibold rounded-xl transition-colors"
              >
                Cancel Auto-Renewal
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
