import React, { useState } from 'react';
import {
  Camera,
  Trash2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Lock,
  EyeOff,
  User,
  Heart,
  Briefcase,
  GraduationCap,
  Globe,
  Plus,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Gender, InterestedIn, RelationshipGoal } from '../../types';
import { geminiService } from '../../services/geminiService';

interface ProfileViewProps {
  onOpenAgeVerification: () => void;
  onOpenPremium: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  onOpenAgeVerification,
  onOpenPremium,
}) => {
  const { userProfile, updateProfileData, deleteAccount, subscription } = useAuth();

  const [name, setName] = useState(userProfile?.name || '');
  const [age, setAge] = useState(userProfile?.age || 24);
  const [city, setCity] = useState(userProfile?.city || 'New York');
  const [country, setCountry] = useState(userProfile?.country || 'United States');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [gender, setGender] = useState<Gender>(userProfile?.gender || 'woman');
  const [interestedIn, setInterestedIn] = useState<InterestedIn>(userProfile?.interestedIn || 'everyone');
  const [profession, setProfession] = useState(userProfile?.profession || '');
  const [education, setEducation] = useState(userProfile?.education || '');
  const [relationshipGoal, setRelationshipGoal] = useState<RelationshipGoal>(
    userProfile?.relationshipGoal || 'long-term'
  );
  const [isIncognito, setIsIncognito] = useState<boolean>(userProfile?.isIncognito || false);

  // Photos list
  const [photos, setPhotos] = useState<string[]>(
    userProfile?.photos && userProfile.photos.length > 0
      ? userProfile.photos
      : ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80']
  );
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  // Interests & Hobbies
  const [interests, setInterests] = useState<string[]>(
    userProfile?.interests || ['Travel', 'Specialty Coffee', 'Music', 'Fitness']
  );
  const [newInterestInput, setNewInterestInput] = useState('');

  const [hobbies, setHobbies] = useState<string[]>(
    userProfile?.hobbies || ['Photography', 'Weekend Roadtrips', 'Reading']
  );
  const [newHobbyInput, setNewHobbyInput] = useState('');

  // AI Bio Assistant State
  const [aiBioTone, setAiBioTone] = useState<'Warm & Authentic' | 'Witty & Playful' | 'Refined & Professional'>(
    'Warm & Authentic'
  );
  const [generatingBio, setGeneratingBio] = useState(false);
  const [aiBioSuggestions, setAiBioSuggestions] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const completion = userProfile?.completionPercentage || 75;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    if (age < 18) {
      setErrorMsg('Age must be 18 or older to maintain membership.');
      setSaving(false);
      return;
    }

    try {
      await updateProfileData({
        name,
        age,
        city,
        country,
        bio,
        gender,
        interestedIn,
        profession,
        education,
        relationshipGoal,
        photos,
        interests,
        hobbies,
        isIncognito,
      });
      setSuccessMsg('Your profile has been successfully updated.');
      setSaving(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save changes.');
      setSaving(false);
    }
  };

  const handleAIBio = async () => {
    setGeneratingBio(true);
    setErrorMsg(null);
    try {
      const res = await geminiService.generateBio({
        name,
        age,
        profession,
        hobbies,
        interests,
        relationshipGoal,
        tone: aiBioTone,
      });
      setBio(res.bio);
      setAiBioSuggestions(res.suggestions || []);
    } catch (e) {
      console.warn('AI Bio generation note:', e);
    }
    setGeneratingBio(false);
  };

  const handleAddPhoto = () => {
    if (!newPhotoUrl.trim()) return;
    if (photos.length >= 6) {
      setErrorMsg('Maximum 6 profile photos allowed.');
      return;
    }
    setPhotos([...photos, newPhotoUrl.trim()]);
    setNewPhotoUrl('');
  };

  const handleDeletePhoto = (index: number) => {
    if (photos.length <= 1) {
      setErrorMsg('You must maintain at least one clear profile photo.');
      return;
    }
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleAddInterest = () => {
    if (newInterestInput.trim() && !interests.includes(newInterestInput.trim())) {
      setInterests([...interests, newInterestInput.trim()]);
      setNewInterestInput('');
    }
  };

  const handleRemoveInterest = (item: string) => {
    setInterests(interests.filter((i) => i !== item));
  };

  const handleAddHobby = () => {
    if (newHobbyInput.trim() && !hobbies.includes(newHobbyInput.trim())) {
      setHobbies([...hobbies, newHobbyInput.trim()]);
      setNewHobbyInput('');
    }
  };

  const handleRemoveHobby = (item: string) => {
    setHobbies(hobbies.filter((h) => h !== item));
  };

  const handleDeleteAccountConfirm = async () => {
    try {
      await deleteAccount();
    } catch (err: any) {
      setErrorMsg(err.message || 'Account deletion failed.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-left space-y-8">
      {/* Profile Header & Completion Bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={photos[0]}
                alt={name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md ring-2 ring-rose-200"
              />
              {userProfile?.verified && (
                <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 ring-2 ring-white">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-serif font-bold text-stone-900">{name || 'Your Name'}, {age}</h1>
                {userProfile?.verified ? (
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                    18+ Verified
                  </span>
                ) : (
                  <button
                    onClick={onOpenAgeVerification}
                    className="bg-amber-50 text-amber-800 hover:bg-amber-100 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200 transition-colors"
                  >
                    Verify Identity (18+)
                  </button>
                )}
              </div>
              <p className="text-xs text-stone-500 mt-0.5">{city}, {country}</p>
            </div>
          </div>

          <div className="w-full sm:w-60 text-right">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-700 mb-1">
              <span>Profile Strength</span>
              <span className="text-rose-600 font-bold">{completion}%</span>
            </div>
            <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-rose-500 to-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${completion}%` }}
              />
            </div>
            <p className="text-[10px] text-stone-400 mt-1">
              {completion < 90 ? 'Add hobbies and profession for higher discovery ranking' : 'Excellent profile presence'}
            </p>
          </div>
        </div>

        {/* Incognito / Privacy Toggle */}
        <div className="pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-stone-500" />
            <div>
              <p className="text-xs font-bold text-stone-900">Incognito Browsing Mode</p>
              <p className="text-[11px] text-stone-400">Only people you have explicitly liked will be able to see your profile.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsIncognito(!isIncognito)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              isIncognito ? 'bg-rose-600' : 'bg-stone-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                isIncognito ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSave} className="space-y-8">
        {/* Photo Management */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-stone-900">Profile Photos</h3>
              <p className="text-xs text-stone-500">Add up to 6 high-resolution photos that showcase your real personality.</p>
            </div>
            <span className="text-xs text-stone-400">{photos.length}/6 photos</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {photos.map((url, i) => (
              <div key={i} className="relative group aspect-[3/4] rounded-xl overflow-hidden border border-stone-200 bg-stone-100">
                <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleDeletePhoto(i)}
                  className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                {i === 0 && (
                  <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                    Primary
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Add Photo Input */}
          {photos.length < 6 && (
            <div className="flex items-center gap-2 pt-2">
              <input
                type="url"
                placeholder="Paste public image URL (or sample link)..."
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-xs focus:ring-rose-500 focus:border-rose-500"
              />
              <button
                type="button"
                onClick={handleAddPhoto}
                className="px-4 py-2 bg-stone-900 hover:bg-black text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Photo</span>
              </button>
            </div>
          )}
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-4">
          <h3 className="text-base font-bold text-stone-900">Basic Information</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Display Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-xs focus:ring-rose-500 focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Age (Strictly 18+)</label>
              <input
                type="number"
                min={18}
                max={99}
                required
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-xs focus:ring-rose-500 focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">City</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-xs focus:ring-rose-500 focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Country</label>
              <input
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-xs focus:ring-rose-500 focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-xs focus:ring-rose-500 focus:border-rose-500"
              >
                <option value="woman">Woman</option>
                <option value="man">Man</option>
                <option value="nonbinary">Non-binary</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Dating Preference</label>
              <select
                value={interestedIn}
                onChange={(e) => setInterestedIn(e.target.value as InterestedIn)}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-xs focus:ring-rose-500 focus:border-rose-500"
              >
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="everyone">Everyone</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bio & Gemini AI Polish */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-stone-900">Your Bio</h3>
              <p className="text-xs text-stone-500">Express what makes you uniquely you in 40–90 words.</p>
            </div>

            {/* AI Generator Controls */}
            <div className="flex items-center gap-2">
              <select
                value={aiBioTone}
                onChange={(e) => setAiBioTone(e.target.value as any)}
                className="border border-stone-300 rounded-lg px-2.5 py-1 text-xs text-stone-700"
              >
                <option value="Warm & Authentic">Warm & Authentic</option>
                <option value="Witty & Playful">Witty & Playful</option>
                <option value="Refined & Professional">Refined & Professional</option>
              </select>

              <button
                type="button"
                onClick={handleAIBio}
                disabled={generatingBio}
                className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 fill-rose-600" />
                <span>{generatingBio ? 'Enhancing...' : 'Gemini AI Polish'}</span>
              </button>
            </div>
          </div>

          <textarea
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell your story... What are you passionate about? What does a great weekend look like?"
            className="w-full border border-stone-300 rounded-xl p-3 text-xs sm:text-sm leading-relaxed focus:ring-rose-500 focus:border-rose-500"
          />

          {/* AI Bio Suggestions */}
          {aiBioSuggestions.length > 0 && (
            <div className="space-y-1.5 pt-2">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                Alternative Punchy One-Liners (Click to add):
              </span>
              <div className="space-y-1">
                {aiBioSuggestions.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setBio(s)}
                    className="w-full text-left p-2.5 rounded-lg border border-stone-200 hover:border-rose-300 hover:bg-rose-50/40 text-xs text-stone-700 transition-colors"
                  >
                    "{s}"
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Lifestyle & Career */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-4">
          <h3 className="text-base font-bold text-stone-900">Career & Relationship Goals</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Profession</label>
              <input
                type="text"
                placeholder="e.g. Architect, Consultant"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-xs focus:ring-rose-500 focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Education</label>
              <input
                type="text"
                placeholder="e.g. NYU, London School of Economics"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-xs focus:ring-rose-500 focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Relationship Goal</label>
              <select
                value={relationshipGoal}
                onChange={(e) => setRelationshipGoal(e.target.value as RelationshipGoal)}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-xs focus:ring-rose-500 focus:border-rose-500"
              >
                <option value="long-term">Long-term Relationship</option>
                <option value="marriage">Life Partner / Marriage</option>
                <option value="casual">Casual Dating</option>
                <option value="figuring-out">Still figuring it out</option>
              </select>
            </div>
          </div>
        </div>

        {/* Interests & Hobbies Tags */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-4">
          <div>
            <h3 className="text-base font-bold text-stone-900">Interests & Hobbies</h3>
            <p className="text-xs text-stone-500">Pick tags that describe your passions.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-2">Interests</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {interests.map((item) => (
                <span
                  key={item}
                  className="bg-stone-100 text-stone-800 text-xs px-2.5 py-1 rounded-md flex items-center gap-1.5"
                >
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveInterest(item)}
                    className="text-stone-400 hover:text-stone-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add custom interest (e.g. Architecture, Live Jazz)..."
                value={newInterestInput}
                onChange={(e) => setNewInterestInput(e.target.value)}
                className="w-full max-w-sm border border-stone-300 rounded-lg px-3 py-1.5 text-xs focus:ring-rose-500 focus:border-rose-500"
              />
              <button
                type="button"
                onClick={handleAddInterest}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg"
              >
                Add
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-stone-100">
            <label className="block text-xs font-semibold text-stone-700 mb-2">Weekend Hobbies</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {hobbies.map((item) => (
                <span
                  key={item}
                  className="bg-rose-50 text-rose-800 text-xs px-2.5 py-1 rounded-md flex items-center gap-1.5 border border-rose-200"
                >
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveHobby(item)}
                    className="text-rose-400 hover:text-rose-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add hobby (e.g. Ceramics, Trail Running)..."
                value={newHobbyInput}
                onChange={(e) => setNewHobbyInput(e.target.value)}
                className="w-full max-w-sm border border-stone-300 rounded-lg px-3 py-1.5 text-xs focus:ring-rose-500 focus:border-rose-500"
              />
              <button
                type="button"
                onClick={handleAddHobby}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
          >
            Delete Account Permanently
          </button>

          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
          >
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 text-left space-y-4">
            <h3 className="text-base font-bold text-rose-700">Delete Account & Data</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              This action is permanent and irreversible. All your profile information, photos, matches, and private messages will be deleted immediately.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="w-1/2 py-2.5 border border-stone-300 text-stone-700 text-xs font-medium rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccountConfirm}
                className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm"
              >
                Confirm Deletion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
