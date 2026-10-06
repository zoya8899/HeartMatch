import React, { useState } from 'react';
import {
  CreditCard,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Tag,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertCircle,
  Building,
  Sparkles,
  Receipt,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useProducts } from '../../contexts/ProductsContext';
import { stripeService } from '../../services/stripeService';
import { SubscriptionPlanId } from '../../types';

interface PaymentScreenProps {
  planId?: string;
  onNavigate: (screen: string) => void;
}

export const PaymentScreen: React.FC<PaymentScreenProps> = ({ planId = 'monthly_premium', onNavigate }) => {
  const { currentUser, activateSubscription, addConsumable } = useAuth();
  const { getProduct, products } = useProducts();

  const selectedProduct = getProduct(planId) || products[1];

  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('888');
  const [nameOnCard, setNameOnCard] = useState('Elena Rostova');
  const [country, setCountry] = useState('United States');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastPaymentInfo, setLastPaymentInfo] = useState<any>(null);

  const finalPrice = Math.max(0, Math.round((selectedProduct.price - discountAmount) * 100) / 100);

  const handleApplyPromo = () => {
    setErrorMessage(null);
    const code = promoCode.trim().toUpperCase();
    if (code === 'WELCOME50' || code === 'HEART50') {
      const discount = Math.round(selectedProduct.price * 0.5 * 100) / 100;
      setDiscountAmount(discount);
      setAppliedPromo(code);
    } else if (code === 'LOVE20') {
      const discount = Math.round(selectedProduct.price * 0.2 * 100) / 100;
      setDiscountAmount(discount);
      setAppliedPromo(code);
    } else if (code === 'VIP100') {
      setDiscountAmount(selectedProduct.price);
      setAppliedPromo(code);
    } else {
      setErrorMessage('Invalid or expired promo code. Try WELCOME50 for 50% off.');
    }
  };

  const handleProcessPayment = async (simulateFailure: boolean = false) => {
    if (!currentUser) return;
    setProcessing(true);
    setErrorMessage(null);

    try {
      // 1. Create Checkout Session server-side
      const session = await stripeService.createCheckoutSession({
        userId: currentUser.uid,
        userEmail: currentUser.email || 'member@heartmatch.app',
        productId: selectedProduct.id,
        planTitle: selectedProduct.title,
        price: selectedProduct.price,
        type: selectedProduct.category,
        promoCode: appliedPromo,
      });

      // 2. Verify Payment server-side (with simulated failure test option)
      const verifyRes = await stripeService.verifyPayment({
        sessionId: session.sessionId,
        userId: currentUser.uid,
        userEmail: currentUser.email || 'member@heartmatch.app',
        productId: selectedProduct.id,
        cardBrand: 'visa',
        cardLast4: '4242',
        promoCode: appliedPromo,
        simulateFailure,
      });

      // 3. Apply Entitlement client-side in Firestore
      if (selectedProduct.category === 'subscription') {
        await activateSubscription(selectedProduct.id as SubscriptionPlanId, finalPrice);
      } else {
        const qty = selectedProduct.quantity || 1;
        addConsumable(selectedProduct.consumableType || 'superlike', qty);
      }

      setLastPaymentInfo({
        ...verifyRes.payment,
        invoiceNumber: session.invoiceId || `INV-${Date.now().toString().slice(-6)}`,
      });

      setProcessing(false);
      setSuccess(true);
    } catch (err: any) {
      console.error('Payment verification error:', err);
      setProcessing(false);
      setErrorMessage(
        err.message || 'Payment authorization failed. Please check your card information or try another card.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4 sm:p-6 text-left selection:bg-rose-100 selection:text-rose-900">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl border border-stone-200 p-6 sm:p-10 relative">
        <button
          onClick={() => onNavigate('premium_plans')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Plans</span>
        </button>

        {success ? (
          <div className="py-8 text-center space-y-6 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <Check className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                Payment Succeeded!
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
                Thank you! Your purchase of <strong>{selectedProduct.title}</strong> was processed
                securely via Stripe Checkout.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="max-w-md mx-auto p-5 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-left space-y-2.5">
              <div className="flex justify-between text-stone-500">
                <span>Invoice Number:</span>
                <span className="font-mono font-bold text-stone-900">
                  {lastPaymentInfo?.invoiceNumber || lastPaymentInfo?.invoiceId || 'INV-HM-2026'}
                </span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Payment Method:</span>
                <span className="font-medium text-stone-900">Visa ending in •••• 4242</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Amount Paid:</span>
                <span className="font-bold text-stone-900 font-serif text-sm">
                  ${finalPrice.toFixed(2)} USD
                </span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Status:</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Succeeded & Verified
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('subscription_management')}
                className="w-full sm:w-auto px-6 py-2.5 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-colors"
              >
                View Subscription & Invoices
              </button>
              <button
                onClick={() => onNavigate('discover')}
                className="w-full sm:w-auto px-6 py-2.5 border border-stone-300 hover:bg-stone-50 text-stone-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Back to Discovery
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Form: Card Details & Stripe Checkout */}
            <div className="lg:col-span-7 space-y-5">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-serif font-bold text-stone-900">Checkout</h1>
                  <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                    Stripe TLS Encrypted
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  No raw card details are stored. Safe tokenized transaction.
                </p>
              </div>

              {/* Error Banner if payment fails */}
              {errorMessage && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <p>{errorMessage}</p>
                </div>
              )}

              {/* Express Payment Option */}
              <button
                type="button"
                onClick={() => handleProcessPayment(false)}
                disabled={processing}
                className="w-full py-3 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>One-Click Stripe Express Checkout</span>
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-semibold">
                  <span className="bg-white px-3 text-stone-400">or enter card manually</span>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleProcessPayment(false);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    required
                    value={nameOnCard}
                    onChange={(e) => setNameOnCard(e.target.value)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-xs focus:ring-rose-500 focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Card Number</label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="•••• •••• •••• ••••"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full border border-stone-300 rounded-xl pl-9 pr-3 py-2 text-xs font-mono focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>
                  <span className="text-[10px] text-stone-400 block mt-1">
                    Test Mode: 4242 4242 4242 4242 is accepted
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Expiration</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      required
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full border border-stone-300 rounded-xl px-3 py-2 text-xs font-mono focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">CVC Code</label>
                    <input
                      type="text"
                      placeholder="CVC"
                      required
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                      className="w-full border border-stone-300 rounded-xl px-3 py-2 text-xs font-mono focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Billing Country</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-xs focus:ring-rose-500 focus:border-rose-500"
                  >
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                    <option value="United Arab Emirates">United Arab Emirates</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                  </select>
                </div>

                {/* Submit Payment Button */}
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>
                    {processing ? 'Authorizing with Stripe...' : `Pay $${finalPrice.toFixed(2)} USD`}
                  </span>
                </button>

                {/* Test Payment Decline Pathway as requested */}
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => handleProcessPayment(true)}
                    disabled={processing}
                    className="text-[11px] text-stone-400 hover:text-stone-700 underline cursor-pointer"
                  >
                    Simulate card decline error handling
                  </button>
                </div>
              </form>
            </div>

            {/* Right Summary: Plan Details & Coupon */}
            <div className="lg:col-span-5 bg-stone-50 rounded-2xl p-5 border border-stone-200 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest block">
                  Order Summary
                </span>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-stone-900">{selectedProduct.title}</h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {selectedProduct.description}
                  </p>
                  <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                    {selectedProduct.category === 'subscription' ? 'Auto-Renewing Membership' : 'One-Time Allowance'}
                  </span>
                </div>

                {/* Promo Code Engine */}
                <div className="pt-2 border-t border-stone-200">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Promo Code
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="e.g. WELCOME50"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="w-full uppercase border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:ring-rose-500"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg text-xs font-semibold shrink-0 cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {appliedPromo && (
                    <span className="text-[11px] text-emerald-700 font-semibold block mt-1">
                      Code {appliedPromo} applied successfully!
                    </span>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="pt-3 border-t border-stone-200 space-y-1.5 text-xs">
                  <div className="flex justify-between text-stone-600">
                    <span>Base Price</span>
                    <span>${selectedProduct.price.toFixed(2)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Promo Discount</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-stone-500 text-[11px]">
                    <span>Sales Tax (Estimated)</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between font-bold text-stone-900 text-sm pt-2 border-t border-stone-200">
                    <span>Total Due Now</span>
                    <span className="font-serif text-rose-600">${finalPrice.toFixed(2)} USD</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 border-t border-stone-200 pt-4">
                <div className="flex items-center gap-1.5 text-[10px] text-stone-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>256-Bit SSL Encrypted checkout. Cancel renewal anytime in 1 click.</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-stone-400">
                  <Building className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span>Billed by HeartMatch International Inc.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
