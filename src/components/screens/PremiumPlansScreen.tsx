import React, { useState } from 'react';
import {
  Crown,
  Sparkles,
  Check,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Zap,
  Star,
  RotateCcw,
  Eye,
  SlidersHorizontal,
  Lock,
  Flame,
  BadgeCheck,
} from 'lucide-react';
import { useProducts } from '../../contexts/ProductsContext';
import { useAuth } from '../../contexts/AuthContext';
import { SubscriptionPlanId } from '../../types';
import { formatDualPrice } from '../../utils/currency';

interface PremiumPlansScreenProps {
  onNavigate: (screen: string, extra?: any) => void;
}

export const PremiumPlansScreen: React.FC<PremiumPlansScreenProps> = ({ onNavigate }) => {
  const { plans, consumables, loading } = useProducts();
  const { isPakistanUser } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'all' | 'monthly' | 'one_time'>('all');

  const coreFeaturesList = [
    {
      icon: <Flame className="w-4 h-4 text-rose-600" />,
      title: 'Unlimited Likes',
      desc: 'Connect with as many intriguing members as you desire without daily limits.',
    },
    {
      icon: <Eye className="w-4 h-4 text-amber-600" />,
      title: 'See Who Liked You',
      desc: 'Browse everyone who already swiped right on you and match instantly with zero guessing.',
    },
    {
      icon: <SlidersHorizontal className="w-4 h-4 text-purple-600" />,
      title: 'Advanced Filters',
      desc: 'Filter accurately by lifestyle, relationship intent, family plans, and education.',
    },
    {
      icon: <RotateCcw className="w-4 h-4 text-blue-600" />,
      title: 'Unlimited Rewinds',
      desc: 'Accidentally swiped left? Take back your last swipe immediately without penalty.',
    },
    {
      icon: <Lock className="w-4 h-4 text-emerald-600" />,
      title: 'Incognito Mode',
      desc: 'Only be seen by members you have already explicitly liked for supreme privacy.',
    },
    {
      icon: <Star className="w-4 h-4 text-amber-500 fill-amber-500" />,
      title: 'Super Likes',
      desc: 'Triple your response rate with prominent direct notifications and highlighted borders.',
    },
    {
      icon: <Zap className="w-4 h-4 text-purple-600 fill-purple-600" />,
      title: 'Profile Boost',
      desc: 'Propel your profile to the top spot in your metropolitan area during peak evening hours.',
    },
    {
      icon: <BadgeCheck className="w-4 h-4 text-rose-600" />,
      title: 'Priority Discovery',
      desc: 'Your profile is presented first to active daters searching for your archetype.',
    },
  ];

  const featureMatrix = [
    { name: 'Unlimited Daily Likes', standard: false, sevenDay: true, monthly: true, threeMonth: true, vip: true },
    { name: 'See Who Liked You', standard: false, sevenDay: true, monthly: true, threeMonth: true, vip: true },
    { name: 'Unlimited Rewinds', standard: false, sevenDay: true, monthly: true, threeMonth: true, vip: true },
    { name: 'Advanced Lifestyle Filters', standard: false, sevenDay: false, monthly: true, threeMonth: true, vip: true },
    { name: 'Incognito Browsing Mode', standard: false, sevenDay: false, monthly: true, threeMonth: true, vip: true },
    { name: 'Monthly Super Likes Allowance', standard: '0', sevenDay: '5 Pack', monthly: '15 Pack', threeMonth: '30 Pack', vip: '50 Pack' },
    { name: 'Profile Boosts', standard: '0', sevenDay: '1 Boost', monthly: '2 Boosts', threeMonth: '5 Boosts', vip: 'Daily Peak Boost' },
    { name: 'Priority Discovery Delivery', standard: false, sevenDay: true, monthly: true, threeMonth: true, vip: true },
    { name: 'AI Deep Chemistry Insights', standard: false, sevenDay: false, monthly: true, threeMonth: true, vip: true },
    { name: 'Direct Message Before Matching', standard: false, sevenDay: false, monthly: false, threeMonth: false, vip: true },
  ];

  const handleSelectProduct = (productId: string) => {
    onNavigate('payment', { planId: productId });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-left space-y-14 selection:bg-rose-100 selection:text-rose-900">
      {/* Top Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <button
          onClick={() => onNavigate('discover')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Discover</span>
        </button>

        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-500 text-white flex items-center justify-center mx-auto shadow-md">
          <Crown className="w-6 h-6" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900">
          HeartMatch Premium Memberships
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
          Elevate your dating experience with unlimited connections, full privacy controls, and intelligent matchmaking.
        </p>

        {/* Live Configurable Price Notice */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 rounded-full border border-rose-200 text-[11px] text-rose-800 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-rose-600" />
          <span>Configurable Stripe pricing · Safe 18+ adult environment · Cancel anytime</span>
        </div>

        {isPakistanUser && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-left space-y-1 animate-in fade-in">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
              <span className="text-base">🇵🇰</span>
              <span>100% Free Unlimited Access in Pakistan Active</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              You are currently enjoying 100% free unlimited messaging, voice notes, browsing, and connecting with local Pakistani singles without any paywall or subscription fee!
            </p>
          </div>
        )}
      </div>

      {/* Subscription Plans Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-serif font-bold text-stone-900">Membership Tiers</h2>
            <p className="text-xs text-stone-500">Select the plan that aligns with your dating intentions.</p>
          </div>
          <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
            Encrypted Stripe Checkout
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((p) => {
            const isPopular = p.badge === 'Most Popular' || p.id === 'monthly_premium';
            const isVip = p.id === 'vip_monthly';
            const intervalLabel =
              p.interval === '7days' ? '7 days' : p.interval === '3months' ? '3 months' : 'month';

            return (
              <div
                key={p.id}
                className={`bg-white rounded-3xl p-6 border transition-all flex flex-col justify-between relative shadow-xs hover:shadow-lg ${
                  isPopular
                    ? 'border-rose-500 ring-2 ring-rose-500 shadow-xl'
                    : isVip
                    ? 'border-amber-400 bg-gradient-to-b from-amber-50/40 via-white to-white'
                    : 'border-stone-200'
                }`}
              >
                {p.badge && (
                  <span
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold shadow-xs ${
                      isPopular
                        ? 'bg-rose-600 text-white'
                        : isVip
                        ? 'bg-amber-600 text-white'
                        : 'bg-stone-900 text-white'
                    }`}
                  >
                    {p.badge}
                  </span>
                )}

                <div>
                  <h3 className="text-lg font-bold text-stone-900 mt-2">{p.title}</h3>
                  <p className="text-xs text-stone-500 mt-1 min-h-[34px] leading-relaxed">{p.description}</p>

                  <div className="my-6">
                    <span className="text-2xl sm:text-3xl font-serif font-bold text-stone-950 block">
                      {formatDualPrice(p.price)}
                    </span>
                    <span className="text-xs text-stone-500 block mt-1">per {intervalLabel}</span>
                  </div>

                  <div className="space-y-2.5 border-t border-stone-100 pt-5 text-xs text-stone-600">
                    {p.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleSelectProduct(p.id)}
                  className={`w-full mt-8 py-3 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    isPopular
                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                      : isVip
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-stone-900 hover:bg-black text-white'
                  }`}
                >
                  <span>Select {p.title}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 8 Core Premium Features Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-sm space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-serif font-bold text-stone-900">
            The 8 Pillars of HeartMatch Premium
          </h2>
          <p className="text-xs text-stone-500">
            Crafted for discerning adults looking for meaningful chemistry and absolute privacy.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
          {coreFeaturesList.map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-stone-50 border border-stone-100 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-xs">
                {item.icon}
              </div>
              <h4 className="text-xs font-bold text-stone-900">{item.title}</h4>
              <p className="text-[11px] text-stone-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Configurable One-Time Power-Ups Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-serif font-bold text-stone-900">One-Time Power-Ups</h2>
            <p className="text-xs text-stone-500">
              No recurring commitment. Stand out or undo swipes whenever you want.
            </p>
          </div>
          <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-3 py-1 rounded-full">
            Instant Delivery
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {consumables.map((item) => {
            let icon = <Star className="w-5 h-5 text-amber-500 fill-amber-500" />;
            if (item.consumableType === 'boost') icon = <Zap className="w-5 h-5 text-purple-600 fill-purple-600" />;
            if (item.consumableType === 'spotlight') icon = <Sparkles className="w-5 h-5 text-amber-600" />;
            if (item.consumableType === 'rewind') icon = <RotateCcw className="w-5 h-5 text-blue-600" />;

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-center mb-4">
                    {icon}
                  </div>
                  <h3 className="text-base font-bold text-stone-900">{item.title}</h3>
                  <p className="text-xs text-stone-500 mt-1 min-h-[32px]">{item.description}</p>

                  <div className="my-5">
                    <span className="text-xl sm:text-2xl font-serif font-bold text-stone-950 block">
                      {formatDualPrice(item.price)}
                    </span>
                    <span className="text-[11px] text-stone-400 block mt-0.5">One-time purchase</span>
                  </div>

                  <div className="space-y-1.5 text-xs text-stone-600 border-t border-stone-100 pt-4">
                    {item.features?.map((f, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleSelectProduct(item.id)}
                  className="w-full mt-6 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-900 hover:text-white hover:border-stone-900 text-stone-800 font-bold text-xs transition-colors cursor-pointer"
                >
                  Buy {item.title}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature Comparison Matrix Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200">
        <h3 className="text-lg font-serif font-bold text-stone-900 mb-6 text-center">
          Comprehensive Feature Comparison
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-stone-200 text-stone-400 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3">Feature</th>
                <th className="p-3 text-center">Free</th>
                <th className="p-3 text-center">7-Day</th>
                <th className="p-3 text-center font-bold text-rose-600">Monthly</th>
                <th className="p-3 text-center font-bold text-amber-700">VIP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {featureMatrix.map((row, i) => (
                <tr key={i} className="hover:bg-stone-50/50">
                  <td className="p-3 font-semibold text-stone-900">{row.name}</td>
                  <td className="p-3 text-center text-stone-400">
                    {typeof row.standard === 'boolean' ? (row.standard ? '✓' : '—') : row.standard}
                  </td>
                  <td className="p-3 text-center">
                    {typeof row.sevenDay === 'boolean' ? (row.sevenDay ? '✓' : '—') : row.sevenDay}
                  </td>
                  <td className="p-3 text-center font-bold text-rose-700">
                    {typeof row.monthly === 'boolean' ? (row.monthly ? '✓' : '—') : row.monthly}
                  </td>
                  <td className="p-3 text-center font-bold text-amber-700">
                    {typeof row.vip === 'boolean' ? (row.vip ? '✓' : '—') : row.vip}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trust & Security Guarantee */}
      <div className="p-6 rounded-2xl bg-stone-100 border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-600">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-rose-600 shrink-0" />
          <div>
            <strong className="text-stone-900 block">Stripe 256-Bit SSL Encryption</strong>
            <span>Raw card numbers are never transmitted or stored on our servers.</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-stone-500">
          <span>Cancel renewal in 1 click</span>
          <span>·</span>
          <span>Instant entitlement grant</span>
          <span>·</span>
          <span>Multi-currency support</span>
        </div>
      </div>
    </div>
  );
};
