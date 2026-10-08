import React from 'react';
import {
  Globe2,
  Lock,
  Crown,
  Sparkles,
  ArrowRight,
  X,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { formatDualPrice } from '../../utils/currency';

interface InternationalUpgradeModalProps {
  isOpen: boolean;
  targetCountry?: string;
  targetProfileName?: string;
  onClose: () => void;
  onUpgrade: () => void;
  onExplorePakistan?: () => void;
}

export const InternationalUpgradeModal: React.FC<InternationalUpgradeModalProps> = ({
  isOpen,
  targetCountry = 'International',
  targetProfileName = 'this member',
  onClose,
  onUpgrade,
  onExplorePakistan,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative text-left">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon */}
        <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-600 text-white flex items-center justify-center mb-4 shadow-md">
          <Globe2 className="w-6 h-6" />
        </div>

        {/* Title */}
        <div className="space-y-1 mb-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200 uppercase tracking-wider">
            <Lock className="w-3 h-3" />
            <span>International Connection Required</span>
          </div>
          <h3 className="text-2xl font-serif font-bold text-stone-900">
            Unlock International Singles
          </h3>
          <p className="text-xs text-stone-500">
            Connecting across borders with singles in {targetCountry} requires Premium.
          </p>
        </div>

        {/* Pakistan Free Access Clarification */}
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1.5 mb-4 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-emerald-900">
            <span>🇵🇰</span>
            <span>100% Free Access Across Pakistan Active</span>
          </div>
          <p className="text-emerald-800 leading-relaxed text-[11px]">
            Good news! As a member in Pakistan, you already enjoy <strong>100% free unlimited messaging, voice notes, browsing, and connecting with all local Pakistani singles</strong> without paying a single rupee.
          </p>
        </div>

        {/* Why Upgrade */}
        <div className="space-y-2.5 mb-6 text-xs text-stone-600">
          <p className="font-semibold text-stone-800">
            To view, like, and chat with <strong>{targetProfileName}</strong> in <strong>{targetCountry}</strong>:
          </p>
          <div className="space-y-1.5 pl-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>Full international profile viewing and unlimited cross-border chat</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>Voice notes with singles in USA, UK, Canada, and Europe</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>Easy local payment via JazzCash (Rs. 2,800 PKR) or USDT (TRC20)</span>
            </div>
          </div>
        </div>

        {/* Dual Pricing Pill */}
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 flex items-center justify-between mb-6">
          <span className="text-xs font-semibold text-stone-600">Plans starting from:</span>
          <span className="text-sm font-bold font-serif text-stone-900">
            {formatDualPrice(9.99)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={() => {
              onClose();
              onUpgrade();
            }}
            className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Crown className="w-4 h-4" />
            <span>Upgrade to Premium to Unlock</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {onExplorePakistan && (
            <button
              onClick={() => {
                onClose();
                onExplorePakistan();
              }}
              className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Explore Free Pakistani Singles (🇵🇰 100% Free)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
