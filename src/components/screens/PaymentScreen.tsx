import React, { useState } from 'react';
import {
  CreditCard,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Tag,
  ArrowLeft,
  Check,
  AlertCircle,
  Copy,
  Upload,
  Clock,
  Sparkles,
  PhoneCall,
  Coins,
  FileCheck,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useProducts } from '../../contexts/ProductsContext';
import { stripeService } from '../../services/stripeService';
import { formatDualPrice, getPkrAmount } from '../../utils/currency';
import { TronQrCode } from '../payment/TronQrCode';
import { PaymentProofRecord, SubscriptionPlanId } from '../../types';

interface PaymentScreenProps {
  planId?: string;
  onNavigate: (screen: string, extra?: any) => void;
}

export const PaymentScreen: React.FC<PaymentScreenProps> = ({
  planId = 'monthly_premium',
  onNavigate,
}) => {
  const { currentUser, userAccount, subscription, activateSubscription, submitPaymentProof, addConsumable } = useAuth();
  const { getProduct, products } = useProducts();

  const selectedProduct = getProduct(planId) || products[1];

  // Payment Method: 'jazzcash' | 'usdt' | 'card'
  const [paymentMethod, setPaymentMethod] = useState<'jazzcash' | 'usdt' | 'card'>('jazzcash');

  // Copy States
  const [copiedJazzCash, setCopiedJazzCash] = useState(false);
  const [copiedUsdt, setCopiedUsdt] = useState(false);

  // Promo Code
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  // Card details (Stripe card simulation)
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('888');
  const [nameOnCard, setNameOnCard] = useState('Elena Rostova');

  // Payment Proof Form States
  const [proofMethod, setProofMethod] = useState<'JazzCash' | 'USDT'>('JazzCash');
  const [transactionId, setTransactionId] = useState('');
  const [senderDetail, setSenderDetail] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

  // Submission & Processing States
  const [processing, setProcessing] = useState(false);
  const [cardSuccess, setCardSuccess] = useState(false);
  const [submittedProof, setSubmittedProof] = useState<PaymentProofRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Exact Payment Details specified in Prompt
  const JAZZ_CASH_TITLE = 'Muhammad waqas';
  const JAZZ_CASH_NUMBER = '03255155187';
  const USDT_NETWORK = 'Tron (TRC20)';
  const USDT_WALLET = 'TFEUThJKQ5muYgTDaLeM8rHScR47P2EboH';

  const finalPriceUsd = Math.max(0, Math.round((selectedProduct.price - discountAmount) * 100) / 100);
  const finalPricePkr = getPkrAmount(finalPriceUsd);

  const handleCopy = (text: string, type: 'jazzcash' | 'usdt') => {
    navigator.clipboard.writeText(text);
    if (type === 'jazzcash') {
      setCopiedJazzCash(true);
      setTimeout(() => setCopiedJazzCash(false), 2000);
    } else {
      setCopiedUsdt(true);
      setTimeout(() => setCopiedUsdt(false), 2000);
    }
  };

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

  // Handle Receipt File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload an image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setReceiptUrl(dataUrl);
      setReceiptPreview(dataUrl);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  // Submit Payment Proof to Firestore and set subscription status to 'pending_verification'
  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setErrorMessage('Please sign in before submitting payment proof.');
      return;
    }

    if (!transactionId.trim()) {
      setErrorMessage('Please enter your Transaction ID (TID) or TxHash.');
      return;
    }

    if (!senderDetail.trim()) {
      setErrorMessage('Please enter your sender mobile number or sending wallet address.');
      return;
    }

    setProcessing(true);
    setErrorMessage(null);

    try {
      // Default sample receipt image if user hasn't chosen one
      const finalReceipt =
        receiptUrl ||
        'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80';

      const proofRecord = await submitPaymentProof({
        planId: selectedProduct.id,
        planTitle: selectedProduct.title,
        amountUsd: finalPriceUsd,
        amountPkr: finalPricePkr,
        method: proofMethod,
        transactionId: transactionId.trim(),
        senderDetail: senderDetail.trim(),
        receiptUrl: finalReceipt,
      });

      setSubmittedProof(proofRecord);
      setProcessing(false);
    } catch (err: any) {
      console.error('Submit payment proof error:', err);
      setProcessing(false);
      setErrorMessage(err.message || 'Could not submit payment proof. Please try again.');
    }
  };

  // Process Credit Card via Stripe
  const handleProcessCardPayment = async () => {
    if (!currentUser) return;
    setProcessing(true);
    setErrorMessage(null);

    try {
      const session = await stripeService.createCheckoutSession({
        userId: currentUser.uid,
        userEmail: currentUser.email || 'member@heartmatch.app',
        productId: selectedProduct.id,
        planTitle: selectedProduct.title,
        price: selectedProduct.price,
        type: selectedProduct.category,
        promoCode: appliedPromo,
      });

      await stripeService.verifyPayment({
        sessionId: session.sessionId,
        userId: currentUser.uid,
        userEmail: currentUser.email || 'member@heartmatch.app',
        productId: selectedProduct.id,
        cardBrand: 'visa',
        cardLast4: '4242',
        promoCode: appliedPromo,
      });

      if (selectedProduct.category === 'subscription') {
        await activateSubscription(selectedProduct.id as SubscriptionPlanId, finalPriceUsd);
      } else {
        const qty = selectedProduct.quantity || 1;
        addConsumable(selectedProduct.consumableType || 'superlike', qty);
      }

      setProcessing(false);
      setCardSuccess(true);
    } catch (err: any) {
      console.error('Card verification error:', err);
      setProcessing(false);
      setErrorMessage(
        err.message || 'Payment authorization failed. Please check your card information.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4 sm:p-6 text-left selection:bg-rose-100 selection:text-rose-900">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-stone-200 p-6 sm:p-10 relative">
        <button
          onClick={() => onNavigate('premium_plans')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Plans</span>
        </button>

        {/* State 1: Submitted Payment Proof - Pending Admin Verification */}
        {submittedProof ? (
          <div className="py-8 text-center space-y-6 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span>Pending Admin Verification</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                Payment Proof Submitted!
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Thank you, <strong>{submittedProof.userName}</strong>. Your transfer receipt has been successfully received and placed in the admin review queue.
              </p>
            </div>

            {/* Proof Receipt Details Card */}
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 text-left max-w-md mx-auto space-y-3 text-xs">
              <div className="flex justify-between border-b border-stone-200 pb-2">
                <span className="text-stone-500">Plan:</span>
                <span className="font-bold text-stone-900">{submittedProof.planTitle}</span>
              </div>
              <div className="flex justify-between border-b border-stone-200 pb-2">
                <span className="text-stone-500">Amount:</span>
                <span className="font-bold text-stone-900">
                  {formatDualPrice(submittedProof.amountUsd)}
                </span>
              </div>
              <div className="flex justify-between border-b border-stone-200 pb-2">
                <span className="text-stone-500">Payment Method:</span>
                <span className="font-bold text-stone-900">{submittedProof.method}</span>
              </div>
              <div className="flex justify-between border-b border-stone-200 pb-2">
                <span className="text-stone-500">Transaction ID (TID):</span>
                <span className="font-mono font-bold text-rose-600 break-all">{submittedProof.transactionId}</span>
              </div>
              <div className="flex justify-between border-b border-stone-200 pb-2">
                <span className="text-stone-500">Sender Details:</span>
                <span className="font-mono text-stone-800">{submittedProof.senderDetail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Submitted At:</span>
                <span className="text-stone-600">{new Date(submittedProof.submittedAt).toLocaleTimeString()}</span>
              </div>

              {submittedProof.receiptUrl && (
                <div className="pt-2">
                  <span className="text-stone-500 block mb-1">Receipt Slip Preview:</span>
                  <div className="h-28 w-full rounded-xl overflow-hidden border border-stone-200 bg-stone-100">
                    <img
                      src={submittedProof.receiptUrl}
                      alt="Receipt Slip"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl max-w-md mx-auto text-xs text-emerald-800 text-left space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>What happens next?</span>
              </div>
              <p>
                Our administration audits transactions within 10–30 minutes. Once approved, your account will be immediately upgraded to <strong>Premium</strong>, unlocking unrestricted international discovery and global chat features.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('discover')}
                className="w-full sm:w-auto px-7 py-3 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                Continue to Discovery
              </button>
              <button
                onClick={() => setSubmittedProof(null)}
                className="w-full sm:w-auto px-5 py-3 border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Submit Another Transaction
              </button>
            </div>
          </div>
        ) : cardSuccess ? (
          /* State 2: Card Payment Success */
          <div className="py-8 text-center space-y-6 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <Check className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                Payment Succeeded!
              </h2>
              <p className="text-xs sm:text-sm text-stone-600">
                Welcome to HeartMatch Premium. Your subscription is active immediately!
              </p>
            </div>

            <div className="pt-4 flex justify-center">
              <button
                onClick={() => onNavigate('discover')}
                className="px-8 py-3.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
              >
                Start Exploring
              </button>
            </div>
          </div>
        ) : (
          /* State 3: Checkout and Payment Proof Screen */
          <div className="space-y-8">
            {/* Header with Dual Pricing */}
            <div className="border-b border-stone-100 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">
                  Secure Checkout
                </span>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
                  Upgrade to {selectedProduct.title}
                </h1>
                <p className="text-xs text-stone-500 mt-0.5">
                  Unlock global matchmaking, international singles, and premium features.
                </p>
              </div>

              {/* Dual Price Badge */}
              <div className="bg-stone-900 text-white px-5 py-3 rounded-2xl shrink-0 text-right shadow-sm border border-stone-800">
                <span className="text-[10px] text-stone-400 uppercase tracking-widest block font-semibold">
                  Dual Currency Total
                </span>
                <span className="text-xl sm:text-2xl font-serif font-bold text-rose-400">
                  {formatDualPrice(finalPriceUsd)}
                </span>
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs text-rose-800 animate-in shake">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Payment Method Selector Tabs */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                Select Receiving Payment Method
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. JazzCash */}
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('jazzcash');
                    setProofMethod('JazzCash');
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative ${
                    paymentMethod === 'jazzcash'
                      ? 'border-rose-600 bg-rose-50/40 ring-2 ring-rose-500 shadow-sm'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg">🇵🇰</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Pakistan Local
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-stone-900">JazzCash</h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">Direct Mobile Account Transfer</p>
                </button>

                {/* 2. Crypto (USDT TRC20) */}
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('usdt');
                    setProofMethod('USDT');
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative ${
                    paymentMethod === 'usdt'
                      ? 'border-rose-600 bg-rose-50/40 ring-2 ring-rose-500 shadow-sm'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Coins className="w-5 h-5 text-emerald-600" />
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      Binance TRC20
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-stone-900">Crypto (USDT)</h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">Tron TRC20 + QR Code Deposit</p>
                </button>

                {/* 3. Credit / Debit Card */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative ${
                    paymentMethod === 'card'
                      ? 'border-rose-600 bg-rose-50/40 ring-2 ring-rose-500 shadow-sm'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <CreditCard className="w-5 h-5 text-stone-600" />
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                      Instant
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-stone-900">Credit / Debit Card</h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">Stripe Gateway (Visa/Mastercard)</p>
                </button>
              </div>
            </div>

            {/* PAYMENT RECEIVING DETAILS SECTION */}

            {/* Option A: JazzCash Details */}
            {paymentMethod === 'jazzcash' && (
              <div className="bg-stone-50 border border-stone-200 rounded-3xl p-6 sm:p-7 space-y-5 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-xs">
                    JC
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-stone-900">JazzCash Payment Details</h3>
                    <p className="text-xs text-stone-500">
                      Transfer <strong className="text-stone-900">Rs. {finalPricePkr.toLocaleString()} PKR</strong> to the JazzCash mobile account below.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Account Title */}
                  <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-1">
                    <span className="text-[11px] font-semibold text-stone-500 block uppercase tracking-wider">
                      Account Title
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-stone-900">{JAZZ_CASH_TITLE}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(JAZZ_CASH_TITLE, 'jazzcash')}
                        className="p-1.5 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-100 cursor-pointer"
                        title="Copy Account Title"
                      >
                        {copiedJazzCash ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Account / Mobile Number */}
                  <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-1">
                    <span className="text-[11px] font-semibold text-stone-500 block uppercase tracking-wider">
                      Account / Mobile No
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-mono font-bold text-rose-600">{JAZZ_CASH_NUMBER}</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleCopy(JAZZ_CASH_NUMBER, 'jazzcash')}
                          className="p-1.5 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-100 cursor-pointer"
                          title="Copy Number"
                        >
                          {copiedJazzCash ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Instructions for JazzCash:</span>
                  </div>
                  <ol className="list-decimal pl-4 space-y-0.5 text-[11px] text-amber-800">
                    <li>Open your JazzCash App or dial *786# on your mobile device.</li>
                    <li>Send Money to <strong>{JAZZ_CASH_NUMBER}</strong> (Account Title: <strong>{JAZZ_CASH_TITLE}</strong>).</li>
                    <li>Enter Amount: <strong>Rs. {finalPricePkr.toLocaleString()} PKR</strong>.</li>
                    <li>Take a screenshot of the receipt and note down the Transaction ID (TID).</li>
                    <li>Submit the verification form below to activate your Premium access.</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Option B: Crypto USDT TRC20 Details */}
            {paymentMethod === 'usdt' && (
              <div className="bg-stone-50 border border-stone-200 rounded-3xl p-6 sm:p-7 space-y-6 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    ₮
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-stone-900">Crypto (USDT) Deposit Details</h3>
                    <p className="text-xs text-stone-500">
                      Deposit <strong className="text-stone-900">${finalPriceUsd} USDT</strong> on the Tron (TRC20) network.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* Left Column: QR Code Placement for Binance Tron TRC20 */}
                  <div className="md:col-span-5 flex justify-center">
                    <TronQrCode address={USDT_WALLET} size={190} />
                  </div>

                  {/* Right Column: Wallet Specs and Copy */}
                  <div className="md:col-span-7 space-y-4">
                    <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-1">
                      <span className="text-[11px] font-semibold text-stone-500 block uppercase tracking-wider">
                        Network
                      </span>
                      <span className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>{USDT_NETWORK}</span>
                      </span>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                          TRC20 Wallet Address
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(USDT_WALLET, 'usdt')}
                          className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          {copiedUsdt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedUsdt ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </div>
                      <div className="p-2.5 bg-stone-100 rounded-xl font-mono text-xs font-semibold text-stone-900 break-all select-all">
                        {USDT_WALLET}
                      </div>
                    </div>

                    <div className="text-[11px] text-stone-500 space-y-1 bg-white/70 p-3 rounded-xl border border-stone-200">
                      <p>
                        💡 <strong>Binance users:</strong> Select <em>Withdraw USDT</em> &gt; Network: <em>Tron (TRC20)</em> &gt; Scan the QR code or paste the address above.
                      </p>
                      <p className="text-rose-600 font-medium">
                        ⚠️ Please make sure you select TRC20 network only. Other networks cannot be credited.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Option C: Credit Card Form (If Card is selected) */}
            {paymentMethod === 'card' && (
              <div className="bg-stone-50 border border-stone-200 rounded-3xl p-6 sm:p-7 space-y-5 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-stone-900">Card Payment Details</h3>
                    <p className="text-xs text-stone-500">256-bit SSL encrypted Stripe processing</p>
                  </div>
                  <div className="flex items-center gap-2 text-stone-400">
                    <span className="text-xs font-semibold">VISA</span>
                    <span className="text-xs font-semibold">MC</span>
                    <span className="text-xs font-semibold">AMEX</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Name on Card</label>
                    <input
                      type="text"
                      value={nameOnCard}
                      onChange={(e) => setNameOnCard(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:outline-rose-600"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:outline-rose-600 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:outline-rose-600 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">CVC / CVV</label>
                    <input
                      type="text"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:outline-rose-600 font-mono"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleProcessCardPayment}
                  disabled={processing}
                  className="w-full py-3.5 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {processing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Authorizing Payment...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Pay {formatDualPrice(finalPriceUsd)} Now</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* SUBMIT PAYMENT PROOF FORM (MANDATORY FOR JAZZCASH & USDT / MANUAL VERIFICATION) */}
            {(paymentMethod === 'jazzcash' || paymentMethod === 'usdt') && (
              <div className="border border-stone-200 rounded-3xl p-6 sm:p-8 bg-white shadow-sm space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold mb-2">
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Step 2: Submit Payment Proof for Admin Verification</span>
                    </div>
                    <h3 className="text-xl font-serif font-bold text-stone-900">
                      Submit Payment Proof
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">
                      Enter your transaction details so our admin team can verify your payment and activate your Premium subscription immediately.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmitProof} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Method Used */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">
                        Payment Method Used *
                      </label>
                      <select
                        value={proofMethod}
                        onChange={(e) => setProofMethod(e.target.value as 'JazzCash' | 'USDT')}
                        className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-900 focus:outline-rose-600 cursor-pointer"
                      >
                        <option value="JazzCash">JazzCash (03255155187 - Muhammad waqas)</option>
                        <option value="USDT">Crypto USDT (Tron TRC20)</option>
                      </select>
                    </div>

                    {/* Transaction ID */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">
                        Transaction ID (TID / TxHash) *
                      </label>
                      <input
                        type="text"
                        required
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder={
                          proofMethod === 'JazzCash'
                            ? 'e.g. 19284719281'
                            : 'e.g. 7c3d2e5b9f1a084c6e...'
                        }
                        className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono font-medium text-stone-900 placeholder:text-stone-400 focus:outline-rose-600"
                      />
                    </div>

                    {/* Sender Detail */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">
                        {proofMethod === 'JazzCash'
                          ? 'Sender Mobile Number (Your JazzCash Number) *'
                          : 'Sender Wallet Address (Your TRC20 Address) *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={senderDetail}
                        onChange={(e) => setSenderDetail(e.target.value)}
                        placeholder={
                          proofMethod === 'JazzCash'
                            ? 'e.g. 03001234567'
                            : 'e.g. TN2d91Y... (Your Tron wallet address)'
                        }
                        className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono font-medium text-stone-900 placeholder:text-stone-400 focus:outline-rose-600"
                      />
                    </div>
                  </div>

                  {/* Payment Receipt Screenshot Upload */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Payment Receipt Screenshot *
                    </label>

                    <div className="border-2 border-dashed border-stone-200 rounded-2xl p-5 text-center hover:border-rose-400 transition-colors bg-stone-50/50">
                      {receiptPreview ? (
                        <div className="space-y-3">
                          <div className="max-h-48 overflow-hidden rounded-xl border border-stone-200 inline-block shadow-sm">
                            <img
                              src={receiptPreview}
                              alt="Receipt Slip Preview"
                              className="max-h-48 w-auto object-contain mx-auto"
                            />
                          </div>
                          <div className="flex items-center justify-center gap-3">
                            <label className="text-xs text-rose-600 font-bold hover:underline cursor-pointer">
                              Change Image
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                              />
                            </label>
                            <span className="text-stone-300">·</span>
                            <button
                              type="button"
                              onClick={() => {
                                setReceiptPreview(null);
                                setReceiptUrl('');
                              }}
                              className="text-xs text-stone-500 hover:text-stone-800 cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center justify-center gap-2 py-4">
                          <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                            <Upload className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-bold text-stone-800">
                            Click to upload payment receipt screenshot
                          </span>
                          <span className="text-[11px] text-stone-400">
                            Supports PNG, JPG, JPEG, WEBP (Max 10MB)
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    {/* Quick Demo Slip Shortcut */}
                    {!receiptPreview && (
                      <div className="mt-2 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            const demoUrl =
                              'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80';
                            setReceiptUrl(demoUrl);
                            setReceiptPreview(demoUrl);
                          }}
                          className="text-[11px] text-stone-400 hover:text-rose-600 underline cursor-pointer"
                        >
                          Use sample receipt slip for instant testing
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Promo Code Input */}
                  <div className="pt-2 border-t border-stone-100 flex items-center gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Have a Promo Code? (e.g. WELCOME50)"
                      className="px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-800 focus:outline-rose-600 uppercase"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                    {appliedPromo && (
                      <span className="text-xs font-bold text-emerald-600">
                        {appliedPromo} (-50%)
                      </span>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {processing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Submitting Proof to Admin Queue...</span>
                      </>
                    ) : (
                      <>
                        <FileCheck className="w-4 h-4" />
                        <span>Submit Payment Proof for Verification</span>
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-stone-400 text-center">
                    🔒 Verification requests are tracked securely. Once approved by the administrator, your account will be updated to Premium with unlimited international matchmaking.
                  </p>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
