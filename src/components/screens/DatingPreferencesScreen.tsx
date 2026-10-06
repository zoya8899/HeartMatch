import React, { useState } from 'react';
import { SlidersHorizontal, ShieldCheck, Heart, MapPin, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserPreference, RelationshipGoal } from '../../types';

interface DatingPreferencesScreenProps {
  onNavigate: (screen: string) => void;
}

export const DatingPreferencesScreen: React.FC<DatingPreferencesScreenProps> = ({ onNavigate }) => {
  const { userPreference, updatePreferenceData } = useAuth();

  const [minAge, setMinAge] = useState<number>(userPreference?.minAge || 21);
  const [maxAge, setMaxAge] = useState<number>(userPreference?.maxAge || 40);
  const [distanceKm, setDistanceKm] = useState<number>(userPreference?.maxDistanceKm || 50);
  const [interestedIn, setInterestedIn] = useState<UserPreference['interestedIn']>(
    userPreference?.interestedIn || 'everyone'
  );
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(userPreference?.verifiedOnly || false);
  const [selectedGoals, setSelectedGoals] = useState<RelationshipGoal[]>(
    userPreference?.relationshipGoals || ['long-term', 'marriage']
  );
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const toggleGoal = (goal: RelationshipGoal) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter((g) => g !== goal));
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updatePreferenceData({
        minAge,
        maxAge,
        maxDistanceKm: distanceKm,
        interestedIn,
        verifiedOnly,
        relationshipGoals: selectedGoals,
      });

      setSaving(false);
      setSavedSuccess(true);
      setTimeout(() => {
        onNavigate('discover');
      }, 1000);
    } catch (err) {
      console.error('Save preferences error:', err);
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4 sm:p-6 text-left selection:bg-rose-100 selection:text-rose-900">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl border border-stone-200 p-6 sm:p-10 relative">
        <button
          onClick={() => onNavigate('discover')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Discover</span>
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-xs">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-stone-900">Dating Preferences</h1>
            <p className="text-xs text-stone-500">Fine-tune who you see and who can discover your profile</p>
          </div>
        </div>

        {savedSuccess && (
          <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Preferences saved! Loading tailored discovery feed...</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Target Audience / Gender */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-2">Show Me</label>
            <div className="grid grid-cols-3 gap-2">
              {(['men', 'women', 'everyone'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setInterestedIn(opt)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-semibold capitalize transition-colors cursor-pointer ${
                    interestedIn === opt
                      ? 'bg-rose-50 border-rose-500 text-rose-700 font-bold'
                      : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Age Range Slider */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-800">
              <span>Age Range (Strictly 18+)</span>
              <span className="text-rose-600 font-bold">{minAge} – {maxAge} years old</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] text-stone-400 block mb-1">Minimum Age ({minAge})</span>
                <input
                  type="range"
                  min={18}
                  max={65}
                  value={minAge}
                  onChange={(e) => setMinAge(Math.min(Number(e.target.value), maxAge - 1))}
                  className="w-full accent-rose-600"
                />
              </div>

              <div>
                <span className="text-[11px] text-stone-400 block mb-1">Maximum Age ({maxAge})</span>
                <input
                  type="range"
                  min={19}
                  max={80}
                  value={maxAge}
                  onChange={(e) => setMaxAge(Math.max(Number(e.target.value), minAge + 1))}
                  className="w-full accent-rose-600"
                />
              </div>
            </div>
          </div>

          {/* Distance Radius */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-800">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-stone-500" />
                <span>Maximum Distance</span>
              </span>
              <span className="text-rose-600 font-bold">Within {distanceKm} km</span>
            </div>
            <input
              type="range"
              min={5}
              max={250}
              value={distanceKm}
              onChange={(e) => setDistanceKm(Number(e.target.value))}
              className="w-full accent-rose-600"
            />
            <p className="text-[11px] text-stone-400">
              Your exact street address is never shared; only general city proximity is evaluated.
            </p>
          </div>

          {/* Relationship Intentions Filter */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-2">Relationship Goals</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'long-term', label: 'Long-term Connection' },
                { id: 'marriage', label: 'Marriage / Life Partner' },
                { id: 'casual', label: 'Casual Dating' },
                { id: 'figuring-out', label: 'Still Exploring' },
              ].map((goal) => {
                const isSelected = selectedGoals.includes(goal.id as RelationshipGoal);
                return (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => toggleGoal(goal.id as RelationshipGoal)}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-rose-50 border-rose-500 text-rose-700 font-semibold'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {isSelected ? '✓ ' : ''}{goal.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 18+ Verified Only Toggle */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-stone-900">Verified Profiles Only</h4>
                <p className="text-[11px] text-stone-500">Only view members with confirmed 18+ identity badges.</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{saving ? 'Updating Feed...' : 'Save & Start Discovering'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
