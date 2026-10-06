import React from 'react';
import {
  Heart,
  ShieldCheck,
  Sparkles,
  Lock,
  ArrowRight,
  CheckCircle,
  EyeOff,
  Star,
  Users,
  Award,
  Globe2,
  ChevronRight,
  ShieldAlert,
  Flame,
} from 'lucide-react';
import { DEFAULT_PRODUCTS } from '../../services/seedData';
import { DiscoveryExplorer } from '../discovery/DiscoveryExplorer';

interface LandingScreenProps {
  onNavigate: (screen: string) => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 selection:bg-rose-100 selection:text-rose-900">
      {/* Top Banner: 18+ Verified Platform */}
      <div className="bg-stone-900 text-stone-300 px-4 py-2 text-center text-xs font-medium border-b border-stone-800 flex items-center justify-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-white font-semibold">Strictly 18+ Verified Dating</span>
        <span className="text-stone-500">·</span>
        <span className="hidden sm:inline">Operating across the United States, United Kingdom, Canada, Australia, UAE & Europe</span>
        <span className="text-stone-500">·</span>
        <button
          onClick={() => onNavigate('safety_center')}
          className="text-stone-300 hover:text-white underline underline-offset-2 ml-1"
        >
          Safety Charter
        </button>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-800 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>The Premier Adult Matchmaking Experience</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-serif font-bold text-stone-950 tracking-tight leading-[1.08]">
                Meaningful connections, crafted for discerning adults.
              </h1>

              <p className="text-base sm:text-lg text-stone-600 max-w-2xl leading-relaxed">
                HeartMatch delivers an elevated dating sanctuary. Verified authentic profiles, AI-assisted conversation intelligence, zero deceptive activity, and absolute privacy safeguarding.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={() => onNavigate('signup')}
                  className="px-7 py-4 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Apply for Membership (18+)</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => onNavigate('login')}
                  className="px-7 py-4 bg-stone-100 hover:bg-stone-200 text-stone-800 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Member Sign In
                </button>
              </div>

              {/* Trust Pillars */}
              <div className="pt-8 border-t border-stone-100 grid grid-cols-3 gap-4 text-xs text-stone-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>18+ Age Guard</span>
                </div>
                <div className="flex items-center gap-2">
                  <EyeOff className="w-4 h-4 text-stone-600 shrink-0" />
                  <span>No Exact GPS Tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Private Encryption</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Mockup */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-sm">
                <div className="absolute -inset-4 bg-gradient-to-tr from-rose-200 via-amber-100 to-stone-100 rounded-3xl blur-2xl opacity-70" />

                <div className="relative bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden">
                  <div className="relative h-[420px] w-full">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
                      alt="Sophia"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/20 to-transparent" />

                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-stone-900 flex items-center gap-1.5 shadow-sm">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verified Adult</span>
                    </div>

                    <div className="absolute bottom-5 inset-x-5 text-white text-left">
                      <div className="flex items-baseline gap-2">
                        <h2 className="text-2xl font-serif font-bold">Sophia, 27</h2>
                        <span className="text-xs text-stone-300">New York City</span>
                      </div>
                      <p className="text-xs text-stone-200 mt-1 line-clamp-2 leading-relaxed">
                        Senior Urban Architect passionate about sustainable design, sourdough baking, and live jazz in Greenwich Village.
                      </p>
                      <div className="flex items-center gap-2 mt-3 text-[11px] text-stone-300">
                        <span>Architecture</span>
                        <span>·</span>
                        <span>Specialty Coffee</span>
                        <span>·</span>
                        <span>Classical Piano</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Controls */}
                  <div className="p-4 bg-white flex items-center justify-center gap-5 border-t border-stone-100">
                    <button
                      onClick={() => onNavigate('signup')}
                      className="w-12 h-12 rounded-full border border-stone-200 text-stone-400 hover:text-stone-700 flex items-center justify-center hover:bg-stone-50 transition-colors"
                    >
                      ✕
                    </button>
                    <button
                      onClick={() => onNavigate('signup')}
                      className="w-11 h-11 rounded-full bg-amber-50 border border-amber-200 text-amber-500 hover:bg-amber-100 flex items-center justify-center transition-colors"
                    >
                      <Star className="w-5 h-5 fill-amber-500" />
                    </button>
                    <button
                      onClick={() => onNavigate('signup')}
                      className="w-14 h-14 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md hover:bg-rose-700 transition-colors"
                    >
                      <Heart className="w-6 h-6 fill-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Discovery Experience: Meet Verified Singles Across the World */}
      <section className="py-12 sm:py-16 bg-stone-50 border-b border-stone-200">
        <DiscoveryExplorer
          isLoggedIn={false}
          onNavigateToAuth={(mode) => onNavigate(mode)}
        />
      </section>

      {/* Editorial Chapter Walkthrough */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-rose-700 uppercase tracking-widest">A Refined Approach</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-950 mt-2">
            Why HeartMatch feels different
          </h2>
          <p className="text-stone-600 text-sm mt-3 leading-relaxed">
            Engineered from first principles for discerning adults who value intentionality, depth, and mutual respect.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="bg-white p-8 rounded-3xl border border-stone-200 space-y-3">
            <span className="text-xs font-semibold text-rose-600 font-mono">01. Strict Adulthood Audit</span>
            <h3 className="text-lg font-bold text-stone-900">Guaranteed 18+ Verification</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Every member certifies their date of birth under strict legal verification. Optional biometric selfie matching ensures you only connect with verified real adults.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-stone-200 space-y-3">
            <span className="text-xs font-semibold text-rose-600 font-mono">02. Respectful Chemistry</span>
            <h3 className="text-lg font-bold text-stone-900">Consensual Mutual Matching</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Conversations only unlock when mutual interest exists. No unsolicited messages, unsolicited explicit photos, or intrusive cold pitches.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-stone-200 space-y-3">
            <span className="text-xs font-semibold text-rose-600 font-mono">03. AI-Powered Safety</span>
            <h3 className="text-lg font-bold text-stone-900">Server-Side Scam & Abuse Shield</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Gemini model intelligence scans messages for fraud, crypto solicitation, and aggressive behavior before it reaches your inbox, routing questionable cases to human review.
            </p>
          </div>
        </div>
      </section>

      {/* High-End Feature Showcase */}
      <section className="py-20 bg-white border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold text-rose-700 uppercase tracking-widest">Intelligent Discovery</span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-950 leading-tight">
                Designed to spark genuine conversation, not shallow swipes.
              </h2>
              <p className="text-stone-600 text-sm leading-relaxed">
                From personalized AI icebreakers to lifestyle compatibility analysis, HeartMatch gives you the context to start memorable conversations effortlessly.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">AI Conversation Wingman</h4>
                    <p className="text-xs text-stone-500">Get 4 witty, tailored icebreakers crafted from your match's specific passions and hobbies.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">Compatibility Synergy Breakdown</h4>
                    <p className="text-xs text-stone-500">Understand shared core values, lifestyle rhythm, and recommendations for your first in-person date.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-800 flex items-center justify-center shrink-0 mt-0.5">
                    <EyeOff className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">Incognito Mode & Privacy Controls</h4>
                    <p className="text-xs text-stone-500">Browse invisibly or reveal your profile exclusively to members you have explicitly liked.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-stone-50 p-8 rounded-3xl border border-stone-200 space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-600 uppercase">Match Compatibility Report</span>
                  <span className="text-sm font-serif font-bold text-stone-900">92% Synergy</span>
                </div>
                <p className="text-xs text-stone-700 leading-relaxed">
                  "You both share an active passion for culinary travel, architecture, and weekend outdoor exploration with complementary communication styles."
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-[11px] text-stone-500">
                  <span>First Date Idea:</span>
                  <strong className="text-stone-800">Visit a rooftop gallery followed by specialty pour-over coffee.</strong>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-2">
                <span className="text-[11px] font-bold text-rose-600 uppercase">AI Icebreaker Suggestion</span>
                <p className="text-xs text-stone-800 italic">
                  "Hey Liam! I noticed your love for acoustic guitar and Surrey trails. What is the most memorable hike you've done recently?"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-rose-700 uppercase tracking-widest">Transparent Membership</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-950 mt-2">
            Membership tiers tailored to your journey
          </h2>
          <p className="text-stone-600 text-sm mt-3">
            Simple, transparent pricing backed by Stripe Checkout. One-click cancellation anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {DEFAULT_PRODUCTS.filter((p) => p.category === 'subscription').map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-3xl p-6 border transition-all flex flex-col justify-between relative ${
                plan.badge === 'Most Popular'
                  ? 'border-rose-500 shadow-lg ring-1 ring-rose-500'
                  : 'border-stone-200 shadow-xs'
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white shadow-xs">
                  {plan.badge}
                </span>
              )}

              <div>
                <h3 className="text-base font-bold text-stone-900 mt-2">{plan.title}</h3>
                <p className="text-xs text-stone-500 mt-1 min-h-[34px] leading-relaxed">{plan.description}</p>

                <div className="my-5">
                  <span className="text-3xl font-serif font-bold text-stone-950">${plan.price}</span>
                  <span className="text-xs text-stone-500 ml-1">/ {plan.interval?.replace('1month', 'mo').replace('3months', 'quarter')}</span>
                </div>

                <div className="space-y-2 border-t border-stone-100 pt-4 text-xs text-stone-600">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onNavigate('premium_plans')}
                className="w-full mt-6 py-2.5 bg-stone-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                View Plan Details
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Illustrative Sample Testimonials */}
      <section className="py-20 bg-stone-100 border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-widest block">
              [Illustrative Member Stories · Sample Testimonials]
            </span>
            <h2 className="text-3xl font-serif font-bold text-stone-950 mt-2">
              Loved by international adult daters
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-3">
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
              <div className="pt-2 border-t border-stone-100 text-xs text-stone-500">
                <strong className="text-stone-900 block">Claire & Daniel</strong>
                <span>London, UK · Sample Story</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-3">
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
              <div className="pt-2 border-t border-stone-100 text-xs text-stone-500">
                <strong className="text-stone-900 block">Marcus & Emily</strong>
                <span>New York City, USA · Sample Story</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-3">
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
              <div className="pt-2 border-t border-stone-100 text-xs text-stone-500">
                <strong className="text-stone-900 block">Tariq & Sofia</strong>
                <span>Dubai & Paris · Sample Story</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Navigation */}
      <footer className="bg-white border-t border-stone-200 py-12 text-xs text-stone-500 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-5 h-5 text-rose-600 fill-rose-600" />
                <span className="font-serif font-bold text-base text-stone-900">HeartMatch</span>
                <span className="text-[10px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded font-bold">18+</span>
              </div>
              <p className="text-[11px] text-stone-500">
                Modern international dating for adults. Built on trust, consent, and authentic chemistry.
              </p>
            </div>

            <div>
              <h5 className="font-bold text-stone-800 mb-2">Platform Screens</h5>
              <ul className="space-y-1.5 text-[11px]">
                <li><button onClick={() => onNavigate('signup')} className="hover:text-stone-900">Sign Up</button></li>
                <li><button onClick={() => onNavigate('login')} className="hover:text-stone-900">Login</button></li>
                <li><button onClick={() => onNavigate('age_verification')} className="hover:text-stone-900">Age Verification</button></li>
                <li><button onClick={() => onNavigate('create_profile')} className="hover:text-stone-900">Create Profile</button></li>
                <li><button onClick={() => onNavigate('upload_photos')} className="hover:text-stone-900">Upload Photos</button></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-stone-800 mb-2">Features & Membership</h5>
              <ul className="space-y-1.5 text-[11px]">
                <li><button onClick={() => onNavigate('discover')} className="hover:text-stone-900">Discover & Swipe</button></li>
                <li><button onClick={() => onNavigate('likes')} className="hover:text-stone-900">Who Liked You</button></li>
                <li><button onClick={() => onNavigate('matches')} className="hover:text-stone-900">Matches & Chat</button></li>
                <li><button onClick={() => onNavigate('premium_plans')} className="hover:text-stone-900">Premium Plans</button></li>
                <li><button onClick={() => onNavigate('subscription_management')} className="hover:text-stone-900">Subscription Management</button></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-stone-800 mb-2">Safety & Control</h5>
              <ul className="space-y-1.5 text-[11px]">
                <li><button onClick={() => onNavigate('safety_center')} className="hover:text-stone-900">Safety Center</button></li>
                <li><button onClick={() => onNavigate('privacy_settings')} className="hover:text-stone-900">Privacy Settings</button></li>
                <li><button onClick={() => onNavigate('report_user')} className="hover:text-stone-900">Report User</button></li>
                <li><button onClick={() => onNavigate('settings')} className="hover:text-stone-900">Account Settings</button></li>
                <li><button onClick={() => onNavigate('admin')} className="hover:text-stone-900">Admin Dashboard</button></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <p>© {new Date().getFullYear()} HeartMatch Inc. Strictly for adults aged 18+.</p>
            <div className="flex items-center gap-3">
              <span>USA</span>
              <span>·</span>
              <span>UK</span>
              <span>·</span>
              <span>Canada</span>
              <span>·</span>
              <span>Australia</span>
              <span>·</span>
              <span>UAE</span>
              <span>·</span>
              <span>Europe</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
