import React from 'react';
import {
  X,
  Heart,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Lock,
  Star,
} from 'lucide-react';
import { UserProfile } from '../../types';

interface VisitorAuthPromptModalProps {
  isOpen: boolean;
  targetProfile: UserProfile | null;
  actionType: string; // 'like' | 'superlike' | 'message' | 'view'
  onClose: () => void;
  onSignUp: () => void;
  onSignIn: () => void;
}

export const VisitorAuthPromptModal: React.FC<VisitorAuthPromptModalProps> = ({
  isOpen,
  targetProfile,
  actionType,
  onClose,
  onSignUp,
  onSignIn,
}) => {
  if (!isOpen) return null;

  const actionText =
    actionType === 'like'
      ? 'Like'
      : actionType === 'superlike'
      ? 'Super Like'
      : actionType === 'message'
      ? 'message'
      : 'connect with';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in select-none">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative overflow-hidden text-center">
        {/* Top Decorative accent */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-rose-500 via-amber-400 to-rose-600" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Target Profile Thumbnail if available */}
        {targetProfile && (
          <div className="flex justify-center mb-4">
            <div className="relative">
              <img
                src={targetProfile.photos?.[0]}
                alt={targetProfile.name}
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg ring-2 ring-rose-200"
              />
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md">
                <Heart className="w-3.5 h-3.5 fill-white" />
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Strictly 18+ Verified Platform</span>
        </div>

        <h3 className="text-2xl font-serif font-bold text-stone-900 tracking-tight mb-2">
          Join HeartMatch
        </h3>

        <p className="text-sm font-medium text-stone-700 mb-1">
          Create your profile and start meeting verified singles.
        </p>

        <p className="text-xs text-stone-500 mb-6 leading-relaxed max-w-sm mx-auto">
          To {actionText} {targetProfile?.name || 'verified singles'} and protect our community, private interactions require a verified adult account.
        </p>

        {/* Value pillars */}
        <div className="grid grid-cols-2 gap-2 text-left mb-6 p-3 bg-stone-50 rounded-2xl border border-stone-200/80 text-xs text-stone-600">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>100% Verified Profiles</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Zero Fake Activity</span>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="space-y-3">
          <button
            onClick={() => {
              onClose();
              onSignUp();
            }}
            className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Create Free Account (18+)</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => {
              onClose();
              onSignIn();
            }}
            className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Already a member? Sign In
          </button>
        </div>
      </div>
    </div>
  );
};
