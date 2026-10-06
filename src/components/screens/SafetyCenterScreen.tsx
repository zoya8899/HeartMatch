import React, { useState } from 'react';
import {
  ShieldCheck,
  PhoneCall,
  AlertTriangle,
  Heart,
  Share2,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Flag,
  Copy,
  Check,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SafetyCenterScreenProps {
  onNavigate: (screen: string) => void;
}

export const SafetyCenterScreen: React.FC<SafetyCenterScreenProps> = ({ onNavigate }) => {
  const { userProfile } = useAuth();

  const [dateVenue, setDateVenue] = useState('Central Perk Cafe, Soho');
  const [dateTime, setDateTime] = useState('Friday at 7:00 PM');
  const [datePerson, setDatePerson] = useState('Alex from HeartMatch');
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyDateShare = () => {
    const text = `Hey! I'm on a date with ${datePerson} at ${dateVenue} on ${dateTime}. Sharing this for safety check-in!`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-left space-y-8 selection:bg-rose-100 selection:text-rose-900">
      <div>
        <button
          onClick={() => onNavigate('discover')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 mb-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Discover</span>
        </button>
        <h1 className="text-2xl font-serif font-bold text-stone-900">Safety & Trust Center</h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Emergency helplines, date check-in tools, romance fraud alerts, and 18+ verification
        </p>
      </div>

      {/* 18+ Age Status Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900">
              18+ Verified Member Status:{' '}
              <span className={userProfile?.verified ? 'text-emerald-700' : 'text-amber-700'}>
                {userProfile?.verified ? 'Verified Adult' : 'Self-Certified 18+'}
              </span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              HeartMatch maintains an active zero-tolerance policy against underage profiles and deceptive bots.
            </p>
          </div>
        </div>

        {!userProfile?.verified && (
          <button
            onClick={() => onNavigate('age_verification')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shrink-0 cursor-pointer shadow-xs"
          >
            Submit ID / Live Selfie
          </button>
        )}
      </div>

      {/* Date Safety Check-In Tool */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-4">
        <div className="flex items-center gap-2">
          <Share2 className="w-5 h-5 text-rose-600" />
          <h3 className="text-base font-bold text-stone-900">Date Safety Sharing Helper</h3>
        </div>
        <p className="text-xs text-stone-500 leading-relaxed">
          Going on a first date? Generate a quick emergency summary to share with a trusted friend before you leave:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-stone-600 mb-1">Date Name</label>
            <input
              type="text"
              value={datePerson}
              onChange={(e) => setDatePerson(e.target.value)}
              className="w-full border border-stone-300 rounded-xl px-3 py-2 text-xs"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-stone-600 mb-1">Public Venue</label>
            <input
              type="text"
              value={dateVenue}
              onChange={(e) => setDateVenue(e.target.value)}
              className="w-full border border-stone-300 rounded-xl px-3 py-2 text-xs"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-stone-600 mb-1">Date & Time</label>
            <input
              type="text"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="w-full border border-stone-300 rounded-xl px-3 py-2 text-xs"
            />
          </div>
        </div>

        <button
          onClick={handleCopyDateShare}
          className="px-4 py-2 bg-stone-900 hover:bg-black text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
        >
          {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span>{copiedLink ? 'Copied to Clipboard!' : 'Copy Date Details for Friend'}</span>
        </button>
      </div>

      {/* 24/7 International Crisis Helplines */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-4">
        <div className="flex items-center gap-2">
          <PhoneCall className="w-5 h-5 text-rose-600" />
          <h3 className="text-base font-bold text-stone-900">24/7 Global Crisis & Emergency Contacts</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
            <span className="text-[10px] font-bold text-stone-400 uppercase">United States</span>
            <p className="font-bold text-stone-900 mt-1">911 (Emergency) · 988 (Crisis Line)</p>
            <p className="text-[11px] text-stone-500 mt-0.5">National Domestic Violence: 1-800-799-7233</p>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
            <span className="text-[10px] font-bold text-stone-400 uppercase">United Kingdom</span>
            <p className="font-bold text-stone-900 mt-1">999 (Emergency) · 111 (NHS Non-Urgent)</p>
            <p className="text-[11px] text-stone-500 mt-0.5">National Helpline: 0808 2000 247</p>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
            <span className="text-[10px] font-bold text-stone-400 uppercase">Canada</span>
            <p className="font-bold text-stone-900 mt-1">911 (Emergency) · 988 (Crisis Support)</p>
            <p className="text-[11px] text-stone-500 mt-0.5">Crisis Text Line: Text 686868</p>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
            <span className="text-[10px] font-bold text-stone-400 uppercase">Australia</span>
            <p className="font-bold text-stone-900 mt-1">000 (Emergency) · 1800RESPECT</p>
            <p className="text-[11px] text-stone-500 mt-0.5">Lifeline Crisis Support: 13 11 14</p>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
            <span className="text-[10px] font-bold text-stone-400 uppercase">United Arab Emirates</span>
            <p className="font-bold text-stone-900 mt-1">999 (Police) · 998 (Ambulance)</p>
            <p className="text-[11px] text-stone-500 mt-0.5">Community Protection: 800 4888</p>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
            <span className="text-[10px] font-bold text-stone-400 uppercase">European Union</span>
            <p className="font-bold text-stone-900 mt-1">112 (Universal Emergency Number)</p>
            <p className="text-[11px] text-stone-500 mt-0.5">Free emergency service across all EU states</p>
          </div>
        </div>
      </div>

      {/* Incident Reporting CTA */}
      <div className="bg-rose-50 rounded-3xl p-6 sm:p-8 border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-rose-900">Notice a Violation or Suspicious Profile?</h3>
          <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
            Report any harassment, commercial solicitation, scam behavior, or suspected underage users immediately.
          </p>
        </div>
        <button
          onClick={() => onNavigate('report_user')}
          className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer shadow-xs"
        >
          Submit Report
        </button>
      </div>
    </div>
  );
};
