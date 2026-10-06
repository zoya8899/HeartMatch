import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, FileText, Send, CheckCircle2, LogOut, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { safetyService } from '../../services/safetyService';

interface SuspendedAccountScreenProps {
  onLogout?: () => void;
}

export const SuspendedAccountScreen: React.FC<SuspendedAccountScreenProps> = () => {
  const { currentUser, userAccount, logout } = useAuth();

  const [statement, setStatement] = useState('');
  const [contactEmail, setContactEmail] = useState(currentUser?.email || '');
  const [submitting, setSubmitting] = useState(false);
  const [appealSubmitted, setAppealSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmitAppeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statement.trim()) {
      setErrorMsg('Please describe your perspective in detail.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      await safetyService.submitAppeal({
        userId: currentUser?.uid || 'user_unknown',
        userEmail: currentUser?.email || 'user@example.com',
        userName: currentUser?.displayName || 'Member',
        suspensionReason: userAccount?.suspendedReason || 'Safety policy investigation',
        appealStatement: statement.trim(),
        contactEmail: contactEmail.trim(),
      });
      setAppealSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit appeal. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4 sm:p-6 text-left selection:bg-rose-100 selection:text-rose-900">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-stone-200 p-6 sm:p-10 space-y-6 animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-stone-900">Account Suspended</h1>
              <span className="text-xs text-rose-600 font-semibold">
                Status: Pending Human Safety Review
              </span>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-50 cursor-pointer flex items-center gap-1 text-xs font-semibold"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>

        {/* Notice Info Box */}
        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 text-xs text-stone-700">
          <strong className="text-stone-900 block font-semibold">Why is my account suspended?</strong>
          <p className="text-stone-600 leading-relaxed">
            {userAccount?.suspendedReason ||
              'Your profile or messages triggered trust and safety monitoring flags (such as potential commercial solicitation, spam, harassment, or age validation). To safeguard all members, adult interaction features have been temporarily paused.'}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-stone-500 pt-1">
            <Lock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span>AI flags do not make automatic irreversible decisions. Human moderators review all appeals.</span>
          </div>
        </div>

        {appealSubmitted ? (
          <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3 animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-serif font-bold text-emerald-950">Appeal Received</h3>
            <p className="text-xs text-emerald-800 leading-relaxed max-w-sm mx-auto">
              Your statement has been submitted to the HeartMatch Trust & Safety Review Board. Our team
              audits all appeals in chronological order, usually within 12–24 hours.
            </p>
            <p className="text-[11px] text-emerald-700 font-medium">
              We sent a confirmation receipt to: <strong>{contactEmail}</strong>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitAppeal} className="space-y-4 text-xs">
            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                Your Contact Email for Resolution
              </label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full border border-stone-300 rounded-xl px-3 py-2 focus:ring-rose-500 focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                Explanation & Context for Appeal
              </label>
              <textarea
                required
                rows={4}
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                placeholder="Explain the context of your actions, clarify any misunderstanding, or affirm your commitment to HeartMatch adult community standards..."
                className="w-full border border-stone-300 rounded-xl p-3 focus:ring-rose-500 focus:border-rose-500"
              />
              <span className="text-[11px] text-stone-400 block mt-1">
                Please provide authentic details. Factual statements expedite human review.
              </span>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px]">
                {errorMsg}
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-stone-400">
                18+ Adult Standard Enforcement Policy
              </span>
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Submitting Appeal...' : 'Submit Appeal to Safety Board'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
