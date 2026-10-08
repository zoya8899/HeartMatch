import React from 'react';
import {
  Heart,
  ShieldCheck,
  Sparkles,
  Lock,
  Compass,
  CheckCircle,
  Star,
  Users,
  EyeOff,
  ChevronDown,
  ArrowRight,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { DEFAULT_PRODUCTS } from '../../services/seedData';
import { SignUpGuideVideoBanner } from './SignUpGuideVideoBanner';

interface LandingPageProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onOpenSafety: () => void;
  onOpenPremium: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onOpenSafety,
  onOpenPremium,
}) => {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 selection:bg-rose-100 selection:text-rose-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-stone-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Value Proposition */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                <span>Strictly 18+ Verified Adult Community</span>
                <span className="text-stone-300">·</span>
                <span className="text-stone-500 font-normal">USA · UK · Canada · Australia · UAE · Europe</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-stone-950 tracking-tight leading-[1.12]">
                Dating built on authenticity, chemistry, and safety.
              </h1>

              <p className="text-base sm:text-lg text-stone-600 max-w-2xl leading-relaxed">
                HeartMatch is the modern dating platform engineered for intentional adults. Zero fake profiles, no deceptive algorithms, and absolute privacy protection.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Create Account (18+)</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-6 py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-sm font-semibold rounded-xl transition-colors"
                >
                  Sign In
                </button>
              </div>

              {/* Safety Badges */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-stone-100 text-xs text-stone-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Verified 18+ Age Guard</span>
                </div>
                <div className="flex items-center gap-2">
                  <EyeOff className="w-4 h-4 text-stone-600 shrink-0" />
                  <span>No Exact Location Leaks</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>End-to-End Private Chat</span>
                </div>
              </div>
            </div>

            {/* Right Column: Visual App Mockup */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-sm">
                {/* Decorative background glow */}
                <div className="absolute -inset-4 bg-gradient-to-tr from-rose-200 to-amber-100 rounded-3xl blur-2xl opacity-60" />

                {/* Simulated Dating Card */}
                <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden border border-stone-200">
                  <div className="relative h-96 w-full">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
                      alt="Sophia"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />

                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-2.5 py-1 rounded-md text-[11px] font-semibold text-stone-900 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verified Adult</span>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 text-white text-left">
                      <div className="flex items-baseline gap-2">
                        <h2 className="text-2xl font-serif font-bold">Sophia, 27</h2>
                        <span className="text-xs text-stone-300">New York City</span>
                      </div>
                      <p className="text-xs text-stone-200 mt-1 line-clamp-2">
                        Architect passionate about sustainable urban design, sourdough baking, and live jazz.
                      </p>
                    </div>
                  </div>

                  {/* Quick Card Controls */}
                  <div className="p-4 bg-white flex items-center justify-center gap-4">
                    <div className="w-12 h-12 rounded-full border border-stone-200 flex items-center justify-center text-stone-400">
                      ✕
                    </div>
                    <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500">
                      ★
                    </div>
                    <div className="w-14 h-14 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md">
                      <Heart className="w-6 h-6 fill-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dedicated "How It Works: 30-sec Sign Up Guide" Video Banner */}
          <div className="mt-12 lg:mt-16">
            <SignUpGuideVideoBanner onOpenAuth={(mode) => onOpenAuth(mode)} />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-rose-700 uppercase tracking-widest">How HeartMatch Works</span>
          <h2 className="text-3xl font-serif font-bold text-stone-950 mt-2">
            Designed for genuine human connection
          </h2>
          <p className="text-stone-600 text-sm mt-3">
            Say goodbye to endless swiping fatigue and unverified profiles. Our 3-step philosophy prioritizes real chemistry.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-stone-200 text-left space-y-3">
            <span className="text-xs font-mono font-semibold text-rose-600">01. Verified Profiles</span>
            <h3 className="text-lg font-bold text-stone-900">Mandatory 18+ Age Guard</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Every member verifies their adulthood and date of birth. Optional ID & selfie biometric matching guarantees you are connecting with real people.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-stone-200 text-left space-y-3">
            <span className="text-xs font-mono font-semibold text-rose-600">02. Mutual Intentionality</span>
            <h3 className="text-lg font-bold text-stone-900">Consensual Mutual Matching</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Conversations only unlock when both individuals express genuine interest. No unsolicited spam, uninvited messages, or aggressive cold outreach.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-stone-200 text-left space-y-3">
            <span className="text-xs font-mono font-semibold text-rose-600">03. AI-Assisted Safety</span>
            <h3 className="text-lg font-bold text-stone-900">Automated Abuse & Scam Shield</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              State-of-the-art server-side Gemini intelligence flags harassment, financial scams, or unsolicited content before harm occurs, sending cases to human moderators.
            </p>
          </div>
        </div>
      </section>

      {/* Safety & Privacy First Section */}
      <section className="py-20 bg-stone-900 text-white border-y border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-4 text-left">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-widest">Trust & Safety Constitution</span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
                Your privacy and physical safety are never compromised.
              </h2>
              <p className="text-stone-300 text-sm leading-relaxed">
                Most dating apps share coarse coordinates and allow unvetted bots to harvest user data. HeartMatch adheres to a strict Zero-Deception and Privacy-First charter.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-md bg-stone-800 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">Approximate City-Level Location Only</h4>
                    <p className="text-[11px] text-stone-400">We never publish or store precise GPS coordinates, preventing stalking and location tracking.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-md bg-stone-800 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">Incognito Mode & Privacy Controls</h4>
                    <p className="text-[11px] text-stone-400">Hide your profile from non-matches or browse completely invisibly whenever you choose.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-md bg-stone-800 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">Zero Fake Users or Artificial Activity</h4>
                    <p className="text-[11px] text-stone-400">No simulated bot likes or deceptive engagement tricks to pressure subscriptions.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={onOpenSafety}
                  className="px-5 py-2.5 bg-stone-800 hover:bg-stone-700 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-2 border border-stone-700"
                >
                  <ShieldAlert className="w-4 h-4 text-emerald-400" />
                  <span>Explore the Safety Center & Helplines</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 bg-stone-800/80 border border-stone-700 p-8 rounded-3xl text-left space-y-6">
              <h3 className="text-lg font-bold text-white">Community Principles (18+)</h3>
              <div className="space-y-4 text-xs text-stone-300">
                <div className="p-3.5 bg-stone-900/60 rounded-xl border border-stone-700/60">
                  <p className="font-semibold text-white mb-1">Enthusiastic Mutual Consent</p>
                  <p className="text-stone-400">Respect your match's boundaries at all times. A 'No' or unmatch is final and non-negotiable.</p>
                </div>
                <div className="p-3.5 bg-stone-900/60 rounded-xl border border-stone-700/60">
                  <p className="font-semibold text-white mb-1">Zero Tolerance for Scams & Commercial Use</p>
                  <p className="text-stone-400">No crypto investment proposals, financial solicitations, or paid webcam promotions. Instant ban and IP block.</p>
                </div>
                <div className="p-3.5 bg-stone-900/60 rounded-xl border border-stone-700/60">
                  <p className="font-semibold text-white mb-1">In-Person Meeting Safety Checklist</p>
                  <p className="text-stone-400">Always meet in public places, arrange your own transportation, and share your date location with a trusted friend.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Membership & Pricing Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-rose-700 uppercase tracking-widest">Transparent Membership</span>
          <h2 className="text-3xl font-serif font-bold text-stone-950 mt-2">
            Elevate your connection potential
          </h2>
          <p className="text-stone-600 text-sm mt-3">
            Choose the plan that suits your dating journey. Cancel anytime with one click.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {DEFAULT_PRODUCTS.filter((p) => p.category === 'subscription').map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl p-6 border transition-all flex flex-col justify-between text-left relative ${
                plan.badge === 'Most Popular'
                  ? 'border-rose-500 shadow-lg ring-1 ring-rose-500'
                  : 'border-stone-200 shadow-sm'
              }`}
            >
              {plan.badge && (
                <div
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[11px] font-bold ${
                    plan.badge === 'Most Popular'
                      ? 'bg-rose-600 text-white'
                      : 'bg-stone-800 text-stone-100'
                  }`}
                >
                  {plan.badge}
                </div>
              )}

              <div>
                <h3 className="text-base font-bold text-stone-900 mt-1">{plan.title}</h3>
                <p className="text-xs text-stone-500 mt-1 min-h-[32px]">{plan.description}</p>

                <div className="my-5">
                  <span className="text-3xl font-serif font-bold text-stone-950">${plan.price}</span>
                  <span className="text-xs text-stone-500 ml-1">/ {plan.interval?.replace('1month', 'mo').replace('3months', 'quarter')}</span>
                </div>

                <div className="space-y-2.5 text-xs text-stone-600 border-t border-stone-100 pt-4">
                  {plan.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onOpenAuth('signup')}
                className={`w-full mt-6 py-2.5 text-xs font-semibold rounded-lg transition-colors shadow-xs ${
                  plan.badge === 'Most Popular'
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-stone-900 hover:bg-black text-white'
                }`}
              >
                Choose {plan.title}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section (Clearly labeled placeholder content only as required) */}
      <section className="py-20 bg-stone-100 border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">
              [Illustrative Member Stories · Sample Testimonials]
            </span>
            <h2 className="text-3xl font-serif font-bold text-stone-950 mt-2">
              Stories from our international adult daters
            </h2>
            <p className="text-xs text-stone-500 mt-2 italic">
              Note: The following quotes are representative placeholder stories highlighting real platform interactions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-3">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-amber-500" />
                <Star className="w-4 h-4 fill-amber-500" />
                <Star className="w-4 h-4 fill-amber-500" />
                <Star className="w-4 h-4 fill-amber-500" />
                <Star className="w-4 h-4 fill-amber-500" />
              </div>
              <p className="text-xs text-stone-700 leading-relaxed italic">
                "HeartMatch felt completely different from typical swipe apps. Having 18+ verification and genuine profiles in London made our first dinner date feel relaxed and grounded."
              </p>
              <div className="pt-2 border-t border-stone-100 text-xs">
                <p className="font-semibold text-stone-900">Claire & Daniel</p>
                <p className="text-stone-500 text-[11px]">London, United Kingdom · Sample Story</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-3">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-amber-500" />
                <Star className="w-4 h-4 fill-amber-500" />
                <Star className="w-4 h-4 fill-amber-500" />
                <Star className="w-4 h-4 fill-amber-500" />
                <Star className="w-4 h-4 fill-amber-500" />
              </div>
              <p className="text-xs text-stone-700 leading-relaxed italic">
                "The conversation starters helped break the ice about our shared love for architecture. No awkward pickup lines, just honest conversation."
              </p>
              <div className="pt-2 border-t border-stone-100 text-xs">
                <p className="font-semibold text-stone-900">Marcus & Emily</p>
                <p className="text-stone-500 text-[11px]">New York City, USA · Sample Story</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-3">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-amber-500" />
                <Star className="w-4 h-4 fill-amber-500" />
                <Star className="w-4 h-4 fill-amber-500" />
                <Star className="w-4 h-4 fill-amber-500" />
                <Star className="w-4 h-4 fill-amber-500" />
              </div>
              <p className="text-xs text-stone-700 leading-relaxed italic">
                "Living between Dubai and Europe made international dating tricky until HeartMatch. I appreciate the strict safety guard and privacy settings."
              </p>
              <div className="pt-2 border-t border-stone-100 text-xs">
                <p className="font-semibold text-stone-900">Tariq & Sofia</p>
                <p className="text-stone-500 text-[11px]">Dubai & Paris · Sample Story</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 text-left">
        <h2 className="text-3xl font-serif font-bold text-stone-950 text-center mb-12">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4 text-xs">
          <div className="bg-white p-5 rounded-xl border border-stone-200">
            <h4 className="font-bold text-stone-900 text-sm mb-1.5">Who can join HeartMatch?</h4>
            <p className="text-stone-600 leading-relaxed">
              HeartMatch is exclusively for consenting adults aged 18 and older in international jurisdictions including the United States, United Kingdom, Canada, Australia, United Arab Emirates, and Europe.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-stone-200">
            <h4 className="font-bold text-stone-900 text-sm mb-1.5">Are my precise location coordinates visible to other users?</h4>
            <p className="text-stone-600 leading-relaxed">
              Never. We only display your general city and estimated radius distance (e.g. "Within 10 km in New York"). Your exact address, GPS location, and real-time transit are strictly private.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-stone-200">
            <h4 className="font-bold text-stone-900 text-sm mb-1.5">How does HeartMatch prevent fake profiles and bots?</h4>
            <p className="text-stone-600 leading-relaxed">
              We enforce strict 18+ age verification, email authentication, and optional live biometric selfie verification. Automated Gemini safety models flag deceptive behaviors, sending questionable accounts to human moderators.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-stone-200">
            <h4 className="font-bold text-stone-900 text-sm mb-1.5">How does Stripe payment and billing work?</h4>
            <p className="text-stone-600 leading-relaxed">
              All payment transactions are encrypted and processed through industry-standard Stripe Checkout. HeartMatch does not store raw credit card numbers. You can manage or cancel auto-renewal anytime in your profile settings.
            </p>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-16 bg-gradient-to-tr from-rose-600 to-rose-700 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold mb-3">Ready to meet someone real?</h2>
          <p className="text-rose-100 text-sm mb-6">
            Join thousands of verified adults seeking intentional dating and authentic chemistry.
          </p>
          <button
            onClick={() => onOpenAuth('signup')}
            className="px-8 py-3.5 bg-white text-rose-700 hover:bg-stone-50 text-sm font-bold rounded-xl shadow-lg transition-transform hover:scale-105"
          >
            Create Your Profile (18+)
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-12 text-xs text-stone-500 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-5 h-5 text-rose-600 fill-rose-600" />
                <span className="font-serif font-bold text-base text-stone-900">HeartMatch</span>
                <span className="text-[10px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded border border-rose-200 font-bold">18+</span>
              </div>
              <p className="text-[11px] text-stone-500">
                Premium modern adult dating platform. Prioritizing safety, consent, and meaningful chemistry.
              </p>
            </div>

            <div>
              <h5 className="font-bold text-stone-800 mb-2">Safety & Ethics</h5>
              <ul className="space-y-1.5 text-[11px]">
                <li><button onClick={onOpenSafety} className="hover:text-stone-900">18+ Age Policy</button></li>
                <li><button onClick={onOpenSafety} className="hover:text-stone-900">Emergency Helplines</button></li>
                <li><button onClick={onOpenSafety} className="hover:text-stone-900">In-Person Date Tips</button></li>
                <li><button onClick={onOpenSafety} className="hover:text-stone-900">Romance Scam Guide</button></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-stone-800 mb-2">Platform</h5>
              <ul className="space-y-1.5 text-[11px]">
                <li><button onClick={() => onOpenAuth('signup')} className="hover:text-stone-900">Create Account</button></li>
                <li><button onClick={() => onOpenAuth('login')} className="hover:text-stone-900">Member Sign In</button></li>
                <li><button onClick={onOpenPremium} className="hover:text-stone-900">VIP Subscriptions</button></li>
                <li><button onClick={onOpenPremium} className="hover:text-stone-900">Coin & Boost Shop</button></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-stone-800 mb-2">Legal Compliance</h5>
              <p className="text-[11px] leading-relaxed text-stone-400">
                Strict compliance with international age verification standards (COPPA, UK Age Appropriate Design Code, GDPR, and Australian eSafety guidelines).
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <p>© {new Date().getFullYear()} HeartMatch Inc. All rights reserved. Strictly 18+.</p>
            <div className="flex items-center gap-4">
              <span>USA</span>
              <span>·</span>
              <span>United Kingdom</span>
              <span>·</span>
              <span>Canada</span>
              <span>·</span>
              <span>Australia</span>
              <span>·</span>
              <span>UAE</span>
              <span>·</span>
              <span>European Union</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
