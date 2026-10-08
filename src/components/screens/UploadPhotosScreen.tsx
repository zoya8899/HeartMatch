import React, { useState, useRef } from 'react';
import { Camera, Trash2, Plus, Star, ShieldCheck, ArrowRight, ArrowLeft, Image as ImageIcon, Sparkles, Upload } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface UploadPhotosScreenProps {
  onNavigate: (screen: string) => void;
}

export const UploadPhotosScreen: React.FC<UploadPhotosScreenProps> = ({ onNavigate }) => {
  const { userProfile, updateProfileData } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photos, setPhotos] = useState<string[]>(
    userProfile?.photos && userProfile.photos.length > 0 ? userProfile.photos : []
  );

  const [newUrl, setNewUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate mime type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG, or WebP).');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Photo file size must not exceed 5 MB.');
      return;
    }

    if (photos.length >= 6) {
      setError('You can upload a maximum of 6 profile photos.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotos((prev) => [...prev, reader.result as string]);
        setError(null);
      }
    };
    reader.onerror = () => {
      setError('Failed to process image file. Please try again.');
    };
    reader.readAsDataURL(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddPhoto = (urlToAdd: string) => {
    if (!urlToAdd.trim()) return;
    if (photos.length >= 6) {
      setError('You can upload a maximum of 6 profile photos.');
      return;
    }
    setPhotos([...photos, urlToAdd.trim()]);
    setNewUrl('');
    setError(null);
  };

  const handleDeletePhoto = (index: number) => {
    if (photos.length <= 1) {
      setError('You must maintain at least one primary profile photo.');
      return;
    }
    setPhotos(photos.filter((_, i) => i !== index));
    setError(null);
  };

  const handleSetPrimary = (index: number) => {
    const selected = photos[index];
    const remaining = photos.filter((_, i) => i !== index);
    setPhotos([selected, ...remaining]);
  };

  const handleSaveAndContinue = async () => {
    if (photos.length < 1) {
      setError('Please add at least one clear profile photo.');
      return;
    }

    setSaving(true);
    try {
      await updateProfileData({ photos });
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

        {/* Photo Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {photos.map((url, idx) => (
            <div
              key={idx}
              className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 group shadow-xs"
            >
              <img src={url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Primary Photo Badge */}
              {idx === 0 ? (
                <span className="absolute top-2 left-2 bg-stone-950/80 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>Main Photo</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSetPrimary(idx)}
                  className="absolute bottom-2 left-2 px-2 py-1 bg-white/90 text-stone-900 text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Make Primary
                </button>
              )}

              {/* Delete Button */}
              <button
                type="button"
                onClick={() => handleDeletePhoto(idx)}
                className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Remove photo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {/* Add Photo Slot */}
          {photos.length < 6 && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="aspect-[3/4] rounded-2xl border-2 border-dashed border-stone-300 hover:border-rose-400 bg-stone-50 flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-colors group"
              role="button"
              tabIndex={0}
              aria-label="Upload photo from device"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
              }}
            >
              <Upload className="w-7 h-7 text-stone-400 group-hover:text-rose-500 mb-2 transition-colors" />
              <span className="text-xs font-semibold text-stone-700">Upload Photo</span>
              <span className="text-[10px] text-stone-400 mt-0.5">JPEG, PNG, WebP up to 5MB</span>
              <span className="text-[10px] text-stone-400 mt-0.5">{photos.length}/6 uploaded</span>
            </div>
          )}
        </div>

        {/* Hidden file input for uploads */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          aria-hidden="true"
        />

        {/* URL Input Form */}
        {photos.length < 6 && (
          <div className="space-y-3 mb-6">
            <label className="block text-xs font-semibold text-stone-700">
              Add Photo from Image URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                placeholder="https://... (Direct photo link)"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="flex-1 border border-stone-300 rounded-xl px-3 py-2 text-xs focus:ring-rose-500 focus:border-rose-500"
              />
              <button
                type="button"
                onClick={() => handleAddPhoto(newUrl)}
                className="px-4 py-2 bg-stone-900 hover:bg-black text-white text-xs font-semibold rounded-xl shrink-0 cursor-pointer"
              >
                Add Image
              </button>
            </div>
          </div>
        )}

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
