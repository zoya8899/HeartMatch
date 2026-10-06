import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, Lock, ArrowRight, Camera, Upload, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AgeVerificationScreenProps {
  onNavigate: (screen: string) => void;
}

export const AgeVerificationScreen: React.FC<AgeVerificationScreenProps> = ({ onNavigate }) => {
  const { userProfile, updateProfileData, submitAgeVerification } = useAuth();

  const currentYear = new Date().getFullYear();
  const [birthYear, setBirthYear] = useState<number>(2000);
  const [birthMonth, setBirthMonth] = useState<number>(1);
  const [birthDay, setBirthDay] = useState<number>(1);
  const [method, setMethod] = useState<'selfie' | 'passport' | 'license'>('selfie');
  const [docUrl, setDocUrl] = useState('');
  const [selfieSimulated, setSelfieSimulated] = useState(false);
  const [agreed18, setAgreed18] = useState(false);
  const [agreedLaw, setAgreedLaw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);

  const today = new Date();
  const getCalculatedAge = () => {
    let age = today.getFullYear() - birthYear;
    const m = (today.getMonth() + 1) - birthMonth;
    if (m < 0 || (m === 0 && today.getDate() < birthDay)) {
      age--;
    }
    return age;
  };

  const calculatedAge = getCalculatedAge();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const exactAge = getCalculatedAge();
    if (exactAge < 18) {
      setError(`HeartMatch is strictly 18+. Based on your date of birth, you are currently ${exactAge} years old. You must be at least 18 years old to proceed.`);
      return;
    }

    if (!agreed18 || !agreedLaw) {
      setError('Please check both certification checkboxes to proceed.');
      return;
    }

    setLoading(true);
    try {
      await updateProfileData({ age: exactAge });
      await submitAgeVerification(
        method,
        docUrl || undefined,
        selfieSimulated
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
          : undefined
      );

      setLoading(false);
      setVerifiedSuccess(true);
      setTimeout(() => {
        onNavigate('create_profile');
      }, 1400);
    } catch (err: any) {
      setError(err.message || 'Age verification submission failed.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4 sm:p-6 text-left selection:bg-rose-100 selection:text-rose-900">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl border border-stone-200 p-6 sm:p-10 relative">
        <button
          onClick={() => onNavigate('landing')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to Home</span>
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-stone-900">18+ Age & Identity Verification</h1>
            <p className="text-xs text-stone-500">Step 2 of 3: International compliance and minor protection</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            HeartMatch enforces an absolute zero-tolerance policy against underage accounts. All users must legally certify they are 18 or older under local laws (USA, UK, Canada, Australia, UAE, Europe).
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {verifiedSuccess ? (
          <div className="py-8 text-center space-y-3 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-serif font-bold text-stone-900">18+ Age Verified!</h3>
            <p className="text-xs text-stone-500">Proceeding to complete your dating profile...</p>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="space-y-6">
            {/* Birth Date Picker */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-2">
                Confirm Exact Date of Birth
              </label>
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={birthMonth}
                  onChange={(e) => setBirthMonth(Number(e.target.value))}
                  className="border border-stone-300 rounded-xl px-3 py-2.5 text-xs focus:ring-rose-500 focus:border-rose-500 bg-white"
                >
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => (
                    <option key={m} value={i + 1}>{m}</option>
                  ))}
                </select>

                <select
                  value={birthDay}
                  onChange={(e) => setBirthDay(Number(e.target.value))}
                  className="border border-stone-300 rounded-xl px-3 py-2.5 text-xs focus:ring-rose-500 focus:border-rose-500 bg-white"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>

                <select
                  value={birthYear}
                  onChange={(e) => setBirthYear(Number(e.target.value))}
                  className="border border-stone-300 rounded-xl px-3 py-2.5 text-xs focus:ring-rose-500 focus:border-rose-500 bg-white"
                >
                  {Array.from({ length: 70 }, (_, i) => currentYear - 18 - i).map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div className="mt-2 flex items-center justify-between text-xs text-stone-500">
                <span>Calculated Age:</span>
                <strong className={`font-semibold ${calculatedAge >= 18 ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {calculatedAge} years old {calculatedAge >= 18 ? '(Eligible)' : '(Ineligible - Under 18)'}
                </strong>
              </div>
            </div>

            {/* Verification Method Selection */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-2">
                Select Identity Verification Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod('selfie')}
                  className={`p-3 rounded-xl border text-center transition-colors cursor-pointer ${
                    method === 'selfie' ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold' : 'border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <Camera className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
                  <span className="text-[11px] block">Live Selfie</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('passport')}
                  className={`p-3 rounded-xl border text-center transition-colors cursor-pointer ${
                    method === 'passport' ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold' : 'border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <Upload className="w-5 h-5 mx-auto mb-1 text-stone-600" />
                  <span className="text-[11px] block">Passport</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('license')}
                  className={`p-3 rounded-xl border text-center transition-colors cursor-pointer ${
                    method === 'license' ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold' : 'border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5 mx-auto mb-1 text-stone-600" />
                  <span className="text-[11px] block">Driver's License</span>
                </button>
              </div>
            </div>

            {method === 'selfie' ? (
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <p className="text-xs font-semibold text-stone-800">Biometric Live Camera Match</p>
                <p className="text-[11px] text-stone-500">
                  Take a quick live photo to confirm age and match your profile picture.
                </p>
                <button
                  type="button"
                  onClick={() => setSelfieSimulated(!selfieSimulated)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    selfieSimulated
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {selfieSimulated ? '✓ Camera Selfie Captured' : 'Simulate Camera Capture'}
                </button>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Document Reference Link or Sample File URL
                </label>
                <input
                  type="url"
                  placeholder="https://... or sample URL"
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 text-xs focus:ring-rose-500 focus:border-rose-500"
                />
              </div>
            )}

            <div className="space-y-2.5 pt-1">
              <label className="flex items-start gap-2 text-[11px] text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed18}
                  onChange={(e) => setAgreed18(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500 mt-0.5"
                />
                <span>I legally attest under penalty of perjury that I am at least 18 years of age and the date of birth supplied is truthful.</span>
              </label>

              <label className="flex items-start gap-2 text-[11px] text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedLaw}
                  onChange={(e) => setAgreedLaw(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500 mt-0.5"
                />
                <span>I understand that providing false age or fraudulent identification constitutes a crime and will be referred to relevant authorities.</span>
              </label>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => onNavigate('create_profile')}
                className="w-1/3 py-3 border border-stone-300 hover:bg-stone-50 rounded-xl text-xs font-semibold text-stone-700"
              >
                Skip Badge
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{loading ? 'Validating...' : 'Verify Age & Continue'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
