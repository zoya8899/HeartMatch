import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, UserX, ArrowLeft, Check, Upload, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useMatch } from '../../contexts/MatchContext';
import { safetyService } from '../../services/safetyService';

interface ReportUserScreenProps {
  targetUserId?: string;
  targetUserName?: string;
  onNavigate: (screen: string) => void;
}

export const ReportUserScreen: React.FC<ReportUserScreenProps> = ({
  targetUserId = 'user_reported',
  targetUserName = 'Member',
  onNavigate,
}) => {
  const { currentUser } = useAuth();
  const { reportUser, blockUser } = useMatch();

  const [userName, setUserName] = useState(targetUserName);
  const [reason, setReason] = useState('harassment');
  const [details, setDetails] = useState('');
  const [alsoBlock, setAlsoBlock] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await safetyService.submitReport({
        reporterId: currentUser?.uid || 'user_anonymous',
        reportedUserId: targetUserId,
        reportedUserName: userName,
        reason,
        category: reason as any,
        details,
      });

      await reportUser(targetUserId, reason, details);
      if (alsoBlock) {
        await blockUser(targetUserId);
      }
      setIsSubmitting(false);
      setSubmitted(true);
      setTimeout(() => {
        onNavigate('discover');
      }, 1600);
    } catch (err) {
      console.error('Report submission error:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4 sm:p-6 text-left selection:bg-rose-100 selection:text-rose-900">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl border border-stone-200 p-6 sm:p-10 relative">
        <button
          onClick={() => onNavigate('discover')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Feed</span>
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-3 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-serif font-bold text-stone-900">Report Dispatched</h2>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Our 24/7 human moderation review team has received your report. The reported individual has been restricted from interacting with your profile.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-xs">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold text-stone-900">Report a Safety Violation</h1>
                <p className="text-xs text-stone-500">Every report is reviewed confidentially by human moderation</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Reported Member</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 text-xs focus:ring-rose-500 focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Violation Category</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 text-xs focus:ring-rose-500 focus:border-rose-500 bg-white"
                >
                  <option value="harassment">Harassment, hate speech, or abuse</option>
                  <option value="scam_fraud">Romance scam, financial or cryptocurrency solicitation</option>
                  <option value="inappropriate_photos">Inappropriate or non-consensual imagery</option>
                  <option value="underage_suspect">Suspected of being under 18 years old</option>
                  <option value="impersonation_fake">Fake profile or impersonating someone else</option>
                  <option value="commercial_spam">Commercial advertising or webcam solicitation</option>
                  <option value="other">Other safety or policy concern</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Detailed Explanation</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Please describe what happened, including specific statements or off-platform demands..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full border border-stone-300 rounded-2xl p-3 text-xs leading-relaxed focus:ring-rose-500 focus:border-rose-500"
                />
              </div>

              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
                <label className="flex items-center gap-2 text-xs font-semibold text-stone-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={alsoBlock}
                    onChange={(e) => setAlsoBlock(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>Block {userName} immediately and permanently</span>
                </label>
                <p className="text-[11px] text-stone-400 mt-1 pl-6">
                  They will not be alerted that you submitted a report or blocked them.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs shadow-md transition-colors cursor-pointer"
              >
                {isSubmitting ? 'Submitting to Moderation...' : 'Submit Confidential Report'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
