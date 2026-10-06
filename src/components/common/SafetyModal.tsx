import React, { useState } from 'react';
import { ShieldAlert, UserX, AlertOctagon, X, Check, Flag, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useMatch } from '../../contexts/MatchContext';
import { safetyService } from '../../services/safetyService';
import { SafetyViolationCategory } from '../../types';

interface SafetyModalProps {
  isOpen: boolean;
  type: 'report' | 'block' | 'unmatch' | 'report_message';
  targetUserId: string;
  targetUserName?: string;
  matchId?: string;
  reportedMessageId?: string;
  reportedMessageText?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SafetyModal: React.FC<SafetyModalProps> = ({
  isOpen,
  type,
  targetUserId,
  targetUserName = 'this user',
  matchId,
  reportedMessageId,
  reportedMessageText,
  onClose,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const { reportUser, blockUser, unmatchUser } = useMatch();

  const [category, setCategory] = useState<SafetyViolationCategory>('harassment');
  const [details, setDetails] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [completed, setCompleted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (type === 'report' || type === 'report_message') {
        // Record structured report via safetyService
        await safetyService.submitReport({
          reporterId: currentUser?.uid || 'user_anonymous',
          reportedUserId: targetUserId,
          reportedUserName: targetUserName,
          reason: category,
          category,
          details: details.trim() || 'Reported via trust & safety modal',
          reportedMessageId,
          reportedMessageText,
        });

        // Also call match context report handler
        await reportUser(targetUserId, category, details, matchId);
      } else if (type === 'block') {
        await blockUser(targetUserId, matchId);
      } else if (type === 'unmatch' && matchId) {
        await unmatchUser(matchId);
      }

      setCompleted(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setCompleted(false);
        if (onSuccess) onSuccess();
        onClose();
      }, 1400);
    } catch (err) {
      console.error('Safety action failed:', err);
      setIsSubmitting(false);
    }
  };

  const isReporting = type === 'report' || type === 'report_message';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 relative text-left">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {completed ? (
          <div className="text-center py-6 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-base font-semibold text-stone-900 mb-1">
              {isReporting ? 'Report Submitted' : type === 'block' ? 'User Blocked' : 'Unmatched'}
            </h4>
            <p className="text-xs text-stone-500">
              {isReporting
                ? 'Our human Trust & Safety team has received your report for prompt review.'
                : 'You will no longer see or interact with each other.'}
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isReporting
                    ? 'bg-rose-50 text-rose-600'
                    : type === 'block'
                    ? 'bg-stone-100 text-stone-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {type === 'report_message' ? (
                  <Flag className="w-5 h-5 text-rose-600" />
                ) : type === 'report' ? (
                  <ShieldAlert className="w-5 h-5" />
                ) : type === 'block' ? (
                  <UserX className="w-5 h-5" />
                ) : (
                  <AlertOctagon className="w-5 h-5" />
                )}
              </div>

              <div>
                <h3 className="text-base font-bold text-stone-900">
                  {type === 'report_message'
                    ? `Report Message from ${targetUserName}`
                    : type === 'report'
                    ? `Report ${targetUserName}`
                    : type === 'block'
                    ? `Block ${targetUserName}`
                    : `Unmatch with ${targetUserName}`}
                </h3>
                <p className="text-xs text-stone-500">Your privacy and safety are always safeguarded</p>
              </div>
            </div>

            {/* Quoted message if reporting a message */}
            {type === 'report_message' && reportedMessageText && (
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 mb-3.5 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  <span>Reported Content</span>
                </span>
                <p className="text-xs text-stone-700 italic">"{reportedMessageText}"</p>
              </div>
            )}

            {isReporting && (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Primary Violation Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as SafetyViolationCategory)}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-xs focus:ring-rose-500 focus:border-rose-500"
                  >
                    <option value="harassment">Harassment, threats, or personal attacks</option>
                    <option value="scam_fraud">Scam, financial solicitation, or crypto scheme</option>
                    <option value="spam">Spam, bot activity, or external promotional links</option>
                    <option value="offensive_content">Hate speech, derogatory slurs, or explicit non-consensual imagery</option>
                    <option value="underage">Suspected of being a minor (under 18)</option>
                    <option value="impersonation">Fake profile or impersonating someone else</option>
                    <option value="other">Other safety or policy concern</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Additional Details
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide details to assist human moderation investigation..."
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="w-full border border-stone-300 rounded-lg p-2.5 text-xs focus:ring-rose-500 focus:border-rose-500"
                  />
                </div>

                <p className="text-[11px] text-stone-500">
                  Submitting this report will also block {targetUserName} from contacting you.
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-1/2 py-2 border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-medium rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-1/2 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            )}

            {type === 'block' && (
              <div className="space-y-4">
                <p className="text-xs text-stone-600 leading-relaxed">
                  Are you sure you want to block <strong>{targetUserName}</strong>? They will not be able
                  to see your profile, send messages, or match with you. They will not be notified that
                  you blocked them.
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-1/2 py-2 border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-medium rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-1/2 py-2 bg-stone-900 hover:bg-black text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
                  >
                    {isSubmitting ? 'Blocking...' : 'Confirm Block'}
                  </button>
                </div>
              </div>
            )}

            {type === 'unmatch' && (
              <div className="space-y-4">
                <p className="text-xs text-stone-600 leading-relaxed">
                  Unmatching will permanently remove the conversation and match between you and{' '}
                  <strong>{targetUserName}</strong>. This action cannot be reversed.
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-1/2 py-2 border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-medium rounded-lg cursor-pointer"
                  >
                    Keep Match
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-1/2 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
                  >
                    {isSubmitting ? 'Unmatching...' : 'Yes, Unmatch'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
