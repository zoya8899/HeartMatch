import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { PhotoPortfolioManager, isPlaceholderPhoto } from '../profile/PhotoPortfolioManager';

interface UploadPhotosScreenProps {
  onNavigate: (screen: string) => void;
}

export const UploadPhotosScreen: React.FC<UploadPhotosScreenProps> = ({ onNavigate }) => {
  const { userProfile, updateProfileData } = useAuth();

  const [photos, setPhotos] = useState<string[]>(
    userProfile?.photos && userProfile.photos.length > 0
      ? userProfile.photos.filter((p) => !isPlaceholderPhoto(p))
      : []
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSaveAndContinue = async () => {
    const cleanPhotos = photos.filter((p) => !isPlaceholderPhoto(p));
    if (cleanPhotos.length < 1) {
      setError('Please upload at least one real portrait photo for your profile.');
      return;
    }

    setSaving(true);
    try {
      await updateProfileData({ photos: cleanPhotos });
      setSaving(false);
      onNavigate('dating_preferences');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile photos.');
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4 sm:p-6 text-left selection:bg-rose-100 selection:text-rose-900">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-stone-200 p-6 sm:p-10 relative">
        <button
          onClick={() => onNavigate('create_profile')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Profile Details</span>
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded uppercase">Step 4 of 4</span>
            <span className="text-xs text-stone-400">Photo Portfolio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">Your Visual Presence</h1>
          <p className="text-xs text-stone-500 mt-1">
            Profiles with 3 or more authentic portraits receive 4x more quality matches.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
            {error}
          </div>
        )}

        {/* Photo Portfolio Manager with auto-remove placeholder, drag & drop, and main photo selection */}
        <div className="mb-6">
          <PhotoPortfolioManager
            photos={photos}
            onChange={(newPhotos) => {
              setPhotos(newPhotos);
              setError(null);
            }}
            userName={userProfile?.name || 'Verified Member'}
            maxPhotos={6}
          />
        </div>

        {/* Safety & Photo Guidelines */}
        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 mb-6 text-xs text-stone-600 space-y-1.5">
          <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Adult Photo Standards</span>
          </h4>
          <p className="text-[11px] text-stone-500">
            For member safety: No minors, no weapons, no explicit or non-consensual content, and no copyright-infringing celebrity photos.
          </p>
        </div>

        <button
          onClick={handleSaveAndContinue}
          disabled={saving}
          className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>{saving ? 'Saving Portfolio...' : 'Continue to Dating Preferences'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
