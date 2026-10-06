import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  PhoneCall,
  CheckCircle2,
  Lock,
  EyeOff,
  UserCheck,
  Heart,
  Flag,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SafetyCenterViewProps {
  onOpenAgeVerification: () => void;
  onOpenSafetyReportModal: () => void;
}

export const SafetyCenterView: React.FC<SafetyCenterViewProps> = ({
  onOpenAgeVerification,
  onOpenSafetyReportModal,
}) => {
  const { userProfile } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-left space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-stone-900">Safety & Trust Center</h1>
            <p className="text-xs text-stone-500 mt-1">
              Resources, international emergency helplines, dating guidelines, and privacy protections.
            </p>
          </div>
        </div>

        {/* Verification Status Banner */}
        <div className="mt-6 p-4 rounded-2xl border border-stone-200 bg-stone-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <UserCheck className="w-5 h-5 text-stone-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-stone-900">
                18+ Identity Verification Status:{' '}
                <span className={userProfile?.verified ? 'text-emerald-700' : 'text-amber-700'}>
                  {userProfile?.verified ? 'Verified Adult Member' : 'Pending Verification'}
                </span>
              </h4>
              <p className="text-[11px] text-stone-500">
                {userProfile?.verified
                  ? 'Your profile has passed age validation and displays the trust badge.'
                  : 'Verify your age with a live selfie or ID document to unlock trust benefits.'}
              </p>
            </div>
          </div>

          {!userProfile?.verified && (
            <button
              onClick={onOpenAgeVerification}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0"
            >
              Verify My Profile
            </button>
          )}
        </div>
      </div>

      {/* Emergency Helplines Across Target International Markets */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-4">
        <div className="flex items-center gap-2">
          <PhoneCall className="w-5 h-5 text-rose-600" />
          <h2 className="text-base font-bold text-stone-900">24/7 International Emergency Resources</h2>
        </div>
        <p className="text-xs text-stone-500">
          If you ever feel unsafe, threatened, or need crisis counseling, reach out immediately:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-[10px] font-bold text-stone-400 uppercase">United States</span>
            <p className="text-sm font-bold text-stone-900 mt-1">911 (Emergency) · 988 (Crisis Line)</p>
            <p className="text-[11px] text-stone-500 mt-0.5">National Domestic Violence: 1-800-799-7233</p>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-[10px] font-bold text-stone-400 uppercase">United Kingdom</span>
            <p className="text-sm font-bold text-stone-900 mt-1">999 (Emergency) · 111 (NHS Non-Urgent)</p>
            <p className="text-[11px] text-stone-500 mt-0.5">National Helpline: 0808 2000 247</p>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-[10px] font-bold text-stone-400 uppercase">Canada</span>
            <p className="text-sm font-bold text-stone-900 mt-1">911 (Emergency) · 988 (Mental Health)</p>
            <p className="text-[11px] text-stone-500 mt-0.5">Crisis Text Line: Text 686868</p>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-[10px] font-bold text-stone-400 uppercase">Australia</span>
            <p className="text-sm font-bold text-stone-900 mt-1">000 (Emergency) · 1800RESPECT</p>
            <p className="text-[11px] text-stone-500 mt-0.5">Lifeline Crisis Support: 13 11 14</p>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-[10px] font-bold text-stone-400 uppercase">United Arab Emirates</span>
            <p className="text-sm font-bold text-stone-900 mt-1">999 (Police) · 998 (Ambulance)</p>
            <p className="text-[11px] text-stone-500 mt-0.5">Community Protection: 800 4888</p>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-[10px] font-bold text-stone-400 uppercase">European Union</span>
            <p className="text-sm font-bold text-stone-900 mt-1">112 (Universal Emergency Number)</p>
            <p className="text-[11px] text-stone-500 mt-0.5">Free pan-European emergency service</p>
          </div>
        </div>
      </div>

      {/* In-Person Dating Safety Checklist */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-4">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-600" />
          <h2 className="text-base font-bold text-stone-900">In-Person First Date Safety Checklist</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone-700">
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1.5">
            <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>1. Always Meet in a Public Place</span>
            </h4>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              For initial dates, choose a busy café, restaurant, or public gallery during regular hours. Never meet at a private residence or secluded location.
            </p>
          </div>

          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1.5">
            <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>2. Arrange Your Own Transportation</span>
            </h4>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              Drive yourself, take public transit, or use rideshare. Never let a date pick you up from your home address until you have established mutual trust.
            </p>
          </div>

          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1.5">
            <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>3. Inform a Trusted Friend</span>
            </h4>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              Tell a friend or family member where you are going, who you are meeting, and what time you expect to be back. Share your live phone location.
            </p>
          </div>

          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1.5">
            <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>4. Trust Your Instincts</span>
            </h4>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              If something feels off, you never owe anyone your time. You can politely conclude the date or ask venue staff for assistance (e.g. "Ask for Angela").
            </p>
          </div>
        </div>
      </div>

      {/* Red Flags & Romance Scam Guide */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <h2 className="text-base font-bold text-stone-900">Recognizing Romance Scams & Red Flags</h2>
        </div>

        <div className="space-y-3 text-xs text-stone-700">
          <div className="p-3.5 bg-rose-50/50 border border-rose-200 rounded-xl">
            <h4 className="font-bold text-rose-900 mb-1">Financial Requests & Money Transfer</h4>
            <p className="text-stone-600 leading-relaxed">
              Never send money, crypto, wire transfers, or gift cards to someone you met online, regardless of their emergency story. No legitimate HeartMatch dater will ask for financial assistance.
            </p>
          </div>

          <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl">
            <h4 className="font-bold text-stone-900 mb-1">Rapid Pressure to Move Off-Platform</h4>
            <p className="text-stone-600 leading-relaxed">
              Be cautious of accounts that insist on immediately moving to WhatsApp, Telegram, or WeChat before having a meaningful conversation on HeartMatch.
            </p>
          </div>

          <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl">
            <h4 className="font-bold text-stone-900 mb-1">Refusal to Video Chat or Meet in Person</h4>
            <p className="text-stone-600 leading-relaxed">
              If a match repeatedly invents excuses to avoid a quick video call or meeting in a public spot, they may be using fake photos or impersonating someone else.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={onOpenSafetyReportModal}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-2"
          >
            <Flag className="w-4 h-4" />
            <span>Submit a Moderation Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};
