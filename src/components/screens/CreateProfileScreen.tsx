import React, { useState } from 'react';
import { Sparkles, Heart, ArrowRight, ArrowLeft, CheckCircle2, User, Briefcase, GraduationCap, MapPin, Globe } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { RelationshipGoal } from '../../types';
import { geminiService } from '../../services/geminiService';

interface CreateProfileScreenProps {
  onNavigate: (screen: string) => void;
}

export const CreateProfileScreen: React.FC<CreateProfileScreenProps> = ({ onNavigate }) => {
  const { userProfile, updateProfileData } = useAuth();

  const [name, setName] = useState(userProfile?.name || '');
  const [city, setCity] = useState(userProfile?.city || 'Lahore');
  const [country, setCountry] = useState(userProfile?.country || 'Pakistan');
  const [profession, setProfession] = useState(userProfile?.profession || 'Product Director');
  const [education, setEducation] = useState(userProfile?.education || 'London School of Economics');
  const [relationshipGoal, setRelationshipGoal] = useState<RelationshipGoal>(
    userProfile?.relationshipGoal || 'long-term'
  );
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    userProfile?.interests || ['Specialty Coffee', 'Architecture', 'Travel', 'Art', 'Fitness']
  );
  const [generatingBio, setGeneratingBio] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableInterests = [
    'Specialty Coffee', 'Architecture', 'Travel', 'Modern Art', 'Fitness',
    'Live Jazz', 'Culinary Arts', 'Film Photography', 'Hiking', 'Literature',
    'Yoga', 'Tennis', 'Mindfulness', 'Interior Design', 'Indie Cinema', 'Wine Tasting'
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

  const handleGenerateBio = async () => {
    setGeneratingBio(true);
    setError(null);
    try {
      const res = await geminiService.generateBio({
        name: name || userProfile?.name || 'Dater',
        age: userProfile?.age || 26,
        profession,
        hobbies: ['Exploring hidden cafes', 'Vinyl records', 'Weekend road trips'],
        interests: selectedInterests,
        relationshipGoal,
        tone: 'Warm & Authentic',
      });
      setBio(res.bio);
    } catch (e) {
      console.warn('AI Bio note:', e);
    }
    setGeneratingBio(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await updateProfileData({
        name: name || userProfile?.name,
        city,
        country,
        profession,
        education,
        relationshipGoal,
        bio: bio || "Passionate about genuine conversation, exploring vibrant cities, and building authentic connections.",
        interests: selectedInterests,
      });

      setSaving(false);
      onNavigate('upload_photos');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile details.');
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4 sm:p-6 text-left selection:bg-rose-100 selection:text-rose-900">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-stone-200 p-6 sm:p-10 relative">
        <button
          onClick={() => onNavigate('age_verification')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Age Verification</span>
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded uppercase">Step 3 of 4</span>
            <span className="text-xs text-stone-400">Profile Crafting</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">Tell Your Story</h1>
          <p className="text-xs text-stone-500 mt-1">
            Intentional dating begins with authenticity. Share your lifestyle, aspirations, and passions.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Display Name</label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Liam"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:ring-rose-500 focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">City & Country</label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. London, United Kingdom"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:ring-rose-500 focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Profession</label>
              <div className="relative">
                <Briefcase className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="e.g. Architect, Product Director"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:ring-rose-500 focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Education</label>
              <div className="relative">
                <GraduationCap className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="e.g. Columbia University"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:ring-rose-500 focus:border-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Relationship Goal */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-2">Relationship Intention</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'long-term', label: 'Long-term' },
                { id: 'marriage', label: 'Marriage' },
                { id: 'casual', label: 'Casual Dating' },
                { id: 'figuring-out', label: 'Figuring out' },
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setRelationshipGoal(g.id as RelationshipGoal)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                    relationshipGoal === g.id
                      ? 'bg-rose-50 border-rose-500 text-rose-700'
                      : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bio Section with Gemini AI */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-stone-700">Your Bio</label>
              <button
                type="button"
                onClick={handleGenerateBio}
                disabled={generatingBio}
                className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 fill-rose-600" />
                <span>{generatingBio ? 'Generating with Gemini...' : 'Polish Bio with AI'}</span>
              </button>
            </div>
            <textarea
              rows={4}
              required
              placeholder="Share what makes you come alive, your passions, and what genuine connection looks like to you..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full border border-stone-300 rounded-2xl p-3 text-xs sm:text-sm leading-relaxed focus:ring-rose-500 focus:border-rose-500"
            />
          </div>

          {/* Passions & Interests Tags */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-stone-700">Select Your Passions</label>
              <span className="text-[11px] text-stone-400">{selectedInterests.length}/8 selected</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {availableInterests.map((tag) => {
                const isSelected = selectedInterests.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleInterest(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-stone-900 text-white font-semibold'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer pt-2"
          >
            <span>{saving ? 'Saving Details...' : 'Continue to Upload Photos'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
