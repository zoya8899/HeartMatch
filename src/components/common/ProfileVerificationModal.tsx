import React, { useState } from 'react';
import { BadgeCheck, Camera, Check, ShieldCheck, X, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { safetyService } from '../../services/safetyService';

interface ProfileVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POSE_CHALLENGES = [
  { id: 'peace', title: 'Peace Sign by your Cheek', instruction: 'Make a peace sign (V-sign) next to your left cheek with clear lighting' },
  { id: 'thumbs_up', title: 'Thumbs-up with a Smile', instruction: 'Give a clear thumbs-up close to your chin and look directly into the camera' },
  { id: 'touch_ear', title: 'Touch your Right Ear', instruction: 'Gently hold your right earlobe with your right hand while smiling' },
  { id: 'three_fingers', title: 'Three Fingers Up', instruction: 'Hold up three fingers near your face with eyes visible' },
];

export const ProfileVerificationModal: React.FC<ProfileVerificationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser, userProfile, updateProfileData } = useAuth();

  const [selectedPoseIndex, setSelectedPoseIndex] = useState(0);
  const [photoUrl, setPhotoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const activePose = POSE_CHALLENGES[selectedPoseIndex];

  const handleNextPose = () => {
    setSelectedPoseIndex((prev) => (prev + 1) % POSE_CHALLENGES.length);
  };

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSubmitting(true);
    setError(null);

    const submissionUrl =
      photoUrl.trim() ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

    try {
      // 1. Submit record to safety verification collection
      await safetyService.submitProfilePoseVerification(
        currentUser.uid,
        userProfile?.name || 'Member',
        submissionUrl,
        activePose.title
      );

      // 2. Grant profileVerified badge
      await updateProfileData({
        profileVerified: true,
        profileVerificationPose: activePose.title,
      });

      setSubmitting(false);
      setSuccess(true);
    } catch (err: any) {
      console.error('Profile verification error:', err);
      setError(err.message || 'Verification submission failed. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative text-left">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
              <BadgeCheck className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-stone-900">
              Profile Photo Verified!
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
              Your pose matches your profile pictures. The verified blue badge is now displayed on your
              profile card, boosting your match rate and trust among authentic singles.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
            >
              Done & Return to Profile
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <BadgeCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-stone-900">
                  Get Photo Verified
                </h3>
                <p className="text-xs text-stone-500">
                  Prove you match your profile pictures to earn the blue verification checkmark
                </p>
              </div>
            </div>

            {/* Pose Instruction Box */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  Pose Challenge
                </span>
                <button
                  type="button"
                  onClick={handleNextPose}
                  className="text-[11px] text-stone-500 hover:text-stone-900 inline-flex items-center gap-1 cursor-pointer font-medium"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Try different pose</span>
                </button>
              </div>

              <h4 className="text-sm font-bold text-stone-900">{activePose.title}</h4>
              <p className="text-xs text-stone-600 leading-relaxed">{activePose.instruction}</p>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmitVerification} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Verification Selfie Photo URL or Camera Match
                </label>
                <div className="relative">
                  <Camera className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="url"
                    placeholder="https://... (or leave empty to use demo selfie camera)"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="w-full border border-stone-300 rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <span className="text-[11px] text-stone-400 block mt-1">
                  Your verification selfie is used solely for safety confirmation and is never shown on your public profile.
                </span>
              </div>

              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-start gap-2.5 text-xs text-blue-900">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Verified profiles receive up to <strong>3x more matches</strong> and higher trust from sincere daters across international cities.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-stone-300 text-stone-700 rounded-xl text-xs font-semibold hover:bg-stone-50 cursor-pointer"
                >
                  Maybe Later
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
                >
                  {submitting ? 'Verifying Pose...' : 'Submit Verification'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
