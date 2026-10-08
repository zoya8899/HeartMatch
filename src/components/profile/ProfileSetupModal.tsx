import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  User,
  MapPin,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Trash2,
  Star,
  Globe,
  Briefcase,
  Heart,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Gender, InterestedIn, RelationshipGoal, UserProfile } from '../../types';
import { geminiService } from '../../services/geminiService';
import { PhotoPortfolioManager, isPlaceholderPhoto } from './PhotoPortfolioManager';

interface ProfileSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'profile' | 'photos';
  isOnboarding?: boolean;
  onComplete?: () => void;
}

export const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'profile',
  isOnboarding = false,
  onComplete,
}) => {
  const { userProfile, updateProfileData, currentUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'profile' | 'photos'>(initialTab);
  const [name, setName] = useState<string>(userProfile?.name || '');
  const [age, setAge] = useState<number>(userProfile?.age || 24);
  const [gender, setGender] = useState<Gender>(userProfile?.gender || 'woman');
  const [interestedIn, setInterestedIn] = useState<InterestedIn>(userProfile?.interestedIn || 'men');
  const [country, setCountry] = useState<string>(userProfile?.country || 'Pakistan');
  const [city, setCity] = useState<string>(userProfile?.city || 'Lahore');
  const [bio, setBio] = useState<string>(userProfile?.bio || '');
  const [profession, setProfession] = useState<string>(userProfile?.profession || '');
  const [relationshipGoal, setRelationshipGoal] = useState<RelationshipGoal>(
    userProfile?.relationshipGoal || 'long-term'
  );
  const [photos, setPhotos] = useState<string[]>(
    userProfile?.photos && userProfile.photos.length > 0
      ? userProfile.photos.filter((p) => !isPlaceholderPhoto(p))
      : []
  );
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    userProfile?.interests && userProfile.interests.length > 0
      ? userProfile.interests
      : ['Specialty Coffee', 'Travel', 'Art', 'Fitness']
  );

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isGeneratingBio, setIsGeneratingBio] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Sync state whenever userProfile changes
  useEffect(() => {
    if (userProfile) {
      if (!name) setName(userProfile.name || '');
      if (userProfile.age) setAge(userProfile.age);
      if (userProfile.gender) setGender(userProfile.gender);
      if (userProfile.interestedIn) setInterestedIn(userProfile.interestedIn);
      if (userProfile.country) setCountry(userProfile.country);
      if (userProfile.city) setCity(userProfile.city);
      if (userProfile.bio && !bio) setBio(userProfile.bio);
      if (userProfile.profession) setProfession(userProfile.profession);
      if (userProfile.relationshipGoal) setRelationshipGoal(userProfile.relationshipGoal);
      if (userProfile.photos && userProfile.photos.length > 0 && photos.length === 0) {
        const cleaned = userProfile.photos.filter((p) => !isPlaceholderPhoto(p));
        if (cleaned.length > 0) setPhotos(cleaned);
      }
      if (userProfile.interests && userProfile.interests.length > 0) {
        setSelectedInterests(userProfile.interests);
      }
    }
  }, [userProfile]);

  useEffect(() => {
    setActiveTab(initialTab);
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  const popularInterests = [
    'Specialty Coffee', 'Travel', 'Art', 'Fitness', 'Music', 'Photography',
    'Cooking', 'Reading', 'Hiking', 'Tech', 'Design', 'Cinema', 'Writing',
  ];

  const toggleInterest = (tag: string) => {
    if (selectedInterests.includes(tag)) {
      setSelectedInterests(selectedInterests.filter((t) => t !== tag));
    } else {
      if (selectedInterests.length < 8) {
        setSelectedInterests([...selectedInterests, tag]);
      }
    }
  };

  const processUploadedFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Please upload a valid JPG, PNG, or WebP photo.');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrorMessage('Photo must be less than 8MB.');
      return;
    }

    if (photos.length >= 6) {
      setErrorMessage('You can upload up to 6 real photos.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const dataUrl = reader.result;
        setPhotos((prev) => [...prev, dataUrl]);
        setErrorMessage(null);
      }
    };
    reader.onerror = () => {
      setErrorMessage('Error reading file. Please try another photo.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleDeletePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    setPhotos((prev) => {
      const selected = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [selected, ...rest];
    });
  };

  const handleAIBio = async () => {
    setIsGeneratingBio(true);
    setErrorMessage(null);
    try {
      const res = await geminiService.generateBio({
        name: name || 'Ayesha',
        age,
        profession: profession || 'Professional',
        hobbies: ['Exploring historic spots', 'Reading', 'Music'],
        interests: selectedInterests,
        relationshipGoal,
        tone: 'Warm & Authentic',
      });
      if (res.bio) {
        setBio(res.bio);
      }
    } catch (e) {
      console.warn('AI Bio generator:', e);
      setBio(`Hey! I'm ${name || 'looking for genuine connections'}. Love good coffee, authentic conversations, and discovering inspiring places. Looking for someone grounded and kind-hearted.`);
    }
    setIsGeneratingBio(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setErrorMessage('Please enter your full display name.');
      return;
    }

    if (age < 18) {
      setErrorMessage('HeartMatch is strictly for adults aged 18 and older.');
      return;
    }

    if (photos.length === 0) {
      setErrorMessage('Please upload at least one real photo of yourself.');
      setActiveTab('photos');
      return;
    }

    if (!bio.trim()) {
      setErrorMessage('Please write a brief bio introducing yourself.');
      setActiveTab('profile');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Partial<UserProfile> = {
        name: name.trim(),
        age: Number(age),
        gender,
        interestedIn,
        country: country.trim() || 'Pakistan',
        city: city.trim() || 'Lahore',
        showCity: true,
        bio: bio.trim(),
        profession: profession.trim() || undefined,
        relationshipGoal,
        photos,
        interests: selectedInterests,
        isRealUser: true,
        profileSetupCompleted: true,
        verified: true,
        verificationStatus: 'verified',
        profileVerified: true,
        optedIntoDiscovery: true,
        updatedAt: new Date().toISOString(),
      };

      await updateProfileData(payload);

      // Store in localStorage for instant local discovery priority
      try {
        const stored = JSON.parse(localStorage.getItem('heartmatch_real_profiles') || '[]');
        const updatedList = [
          { ...userProfile, ...payload, userId: currentUser?.uid || 'user_real' },
          ...stored.filter((p: any) => p.userId !== (currentUser?.uid || 'user_real')),
        ];
        localStorage.setItem('heartmatch_real_profiles', JSON.stringify(updatedList));
      } catch (e) {
        console.warn('Local storage error:', e);
      }

      setSuccessMessage('Profile and photos saved successfully! You are now live in the community feed.');

      setTimeout(() => {
        setIsSubmitting(false);
        if (onComplete) onComplete();
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update profile. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-stone-200 text-left relative">
        {/* Header */}
        <div className="p-6 border-b border-stone-100 flex items-start justify-between bg-gradient-to-r from-rose-50/50 via-white to-amber-50/30">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-100/80 text-rose-800 text-[11px] font-bold mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-600" />
              <span>{isOnboarding ? 'Mandatory Onboarding · Real Member Setup' : 'Real Profile Editor'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
              {isOnboarding ? 'Complete Your Real Profile' : 'Edit Profile & Photos'}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              {isOnboarding
                ? 'Upload your authentic photo and introduce yourself to start browsing and matching.'
                : 'Changes are reflected immediately across your navbar avatar, cards, and community feed.'}
            </p>
          </div>

          {!isOnboarding && (
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-200 px-6 bg-stone-50/50 text-xs font-bold">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'border-rose-600 text-rose-700 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile Details</span>
          </button>

          <button
            onClick={() => setActiveTab('photos')}
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'photos'
                ? 'border-rose-600 text-rose-700 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Photo Portfolio ({photos.length})</span>
            {photos.length === 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ayesha Malik"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border border-stone-300 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Age */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Age (18+) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="number"
                      required
                      min={18}
                      max={85}
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full border border-stone-300 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Location: Country & City (Default: Pakistan) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Country <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="Pakistan"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full border border-stone-300 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-emerald-700 font-medium block mt-0.5">
                    🇵🇰 Pakistan members enjoy 100% Free local chat & messaging
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lahore, Karachi, Islamabad"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full border border-stone-300 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Gender & Interested In */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">I am a</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as Gender)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white"
                  >
                    <option value="woman">Woman</option>
                    <option value="man">Man</option>
                    <option value="nonbinary">Non-binary</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Seeking</label>
                  <select
                    value={interestedIn}
                    onChange={(e) => setInterestedIn(e.target.value as InterestedIn)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white"
                  >
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="everyone">Everyone</option>
                  </select>
                </div>
              </div>

              {/* Profession & Relationship Goal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Profession</label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="e.g. Software Engineer, Doctor, Designer"
                      value={profession}
                      onChange={(e) => setProfession(e.target.value)}
                      className="w-full border border-stone-300 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Relationship Goal</label>
                  <select
                    value={relationshipGoal}
                    onChange={(e) => setRelationshipGoal(e.target.value as RelationshipGoal)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white"
                  >
                    <option value="long-term">Long-Term Relationship</option>
                    <option value="marriage">Marriage / Rishta</option>
                    <option value="casual">Casual Dating</option>
                    <option value="figuring-out">Still Figuring It Out</option>
                  </select>
                </div>
              </div>

              {/* Bio & AI Polish */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-stone-700">
                    About Me / Bio <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAIBio}
                    disabled={isGeneratingBio}
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-rose-500" />
                    <span>{isGeneratingBio ? 'Drafting...' : 'AI Bio Polish'}</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  required
                  placeholder="Tell potential matches about your personality, values, favorite chai spots, or what inspires you..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl p-3 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none resize-none leading-relaxed"
                />
                <div className="flex justify-between items-center text-[10px] text-stone-400 mt-1">
                  <span>Authentic, natural bios get 3x higher responses</span>
                  <span>{bio.length} characters</span>
                </div>
              </div>

              {/* Interests */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-2">Interests & Lifestyle</label>
                <div className="flex flex-wrap gap-1.5">
                  {popularInterests.map((tag) => {
                    const isSelected = selectedInterests.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleInterest(tag)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-stone-900 text-white shadow-xs'
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="space-y-6">
              {/* Photo Upload Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-rose-600 bg-rose-50/50 scale-[0.99]'
                    : 'border-stone-300 hover:border-stone-400 bg-stone-50/60'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-2xl bg-white shadow-xs border border-stone-200 text-rose-600 flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-stone-900">Click or Drag & Drop Real Photos</h4>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  Upload authentic pictures from your phone or computer. JPG, PNG, or WebP. Max 6 photos.
                </p>
                <span className="inline-block mt-3 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-semibold">
                  No stock or fake photos · Strict authenticity check
                </span>
              </div>

              {/* Photos Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    Your Uploaded Photos ({photos.length} / 6)
                  </h4>
                  <span className="text-[11px] text-stone-400">
                    The first photo is your primary profile avatar
                  </span>
                </div>

                {photos.length === 0 ? (
                  <div className="p-8 text-center bg-stone-50 rounded-2xl border border-stone-200">
                    <Camera className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                    <p className="text-xs text-stone-500 font-medium">
                      No photos uploaded yet. Please add at least 1 real portrait photo.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {photos.map((url, idx) => (
                      <div
                        key={idx}
                        className="group relative aspect-3/4 rounded-2xl overflow-hidden border border-stone-200 shadow-xs bg-stone-100"
                      >
                        <img
                          src={url}
                          alt={`Uploaded portrait ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />

                        {/* Primary Badge */}
                        {idx === 0 && (
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-stone-900/90 text-white text-[10px] font-bold flex items-center gap-1 shadow-xs">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span>Primary Avatar</span>
                          </div>
                        )}

                        {/* Photo Action Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          {idx !== 0 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSetPrimary(idx);
                              }}
                              className="px-2 py-1 bg-white hover:bg-stone-100 text-stone-900 text-[10px] font-bold rounded-lg cursor-pointer shadow-xs"
                              title="Make this your primary photo"
                            >
                              Make Primary
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePhoto(idx);
                            }}
                            className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg cursor-pointer shadow-xs"
                            title="Delete photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-stone-100 bg-stone-50/80 flex items-center justify-between gap-3">
          <div className="text-[11px] text-stone-500 hidden sm:block">
            {photos.length === 0 ? (
              <span className="text-rose-600 font-semibold">⚠️ Photo upload is required to activate profile</span>
            ) : (
              <span className="text-emerald-700 font-semibold">✓ Verified Adult Single profile</span>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {!isOnboarding && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                Cancel
              </button>
            )}

            {activeTab === 'profile' && photos.length === 0 ? (
              <button
                type="button"
                onClick={() => setActiveTab('photos')}
                className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>Next: Upload Photos</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSave}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isOnboarding ? 'Save & Start Exploring' : 'Save Changes'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
