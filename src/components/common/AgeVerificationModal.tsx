import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, FileText, CheckCircle2, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AgeVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const AgeVerificationModal: React.FC<AgeVerificationModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const { userProfile, updateProfileData, submitAgeVerification } = useAuth();

  const [birthYear, setBirthYear] = useState<number>(2000);
  const [birthMonth, setBirthMonth] = useState<number>(1);
  const [birthDay, setBirthDay] = useState<number>(1);
  const [docType, setDocType] = useState<string>('selfie');
  const [idPhotoUrl, setIdPhotoUrl] = useState<string>('');
  const [agreedTerms, setAgreedTerms] = useState<boolean>(false);
  const [agreedGuidelines, setAgreedGuidelines] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [step, setStep] = useState<'age_declaration' | 'id_optional'>('age_declaration');

  if (!isOpen) return null;

  const currentYear = new Date().getFullYear();
  const calculatedAge = currentYear - birthYear;

  const handleVerifyAge = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (calculatedAge < 18) {
      setError('You must be 18 years of age or older to use HeartMatch. Access is strictly denied to minors.');
      return;
    }

    if (!agreedTerms || !agreedGuidelines) {
      setError('You must accept the 18+ Legal Declaration and Safety Guidelines to proceed.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProfileData({ age: calculatedAge });
      setStep('id_optional');
      setIsSubmitting(false);
    } catch (err: any) {
      setError(err.message || 'Verification update failed.');
      setIsSubmitting(false);
    }
  };

  const handleFinalize = async (withDoc: boolean) => {
    setIsSubmitting(true);
    try {
      if (withDoc) {
        await submitAgeVerification(docType, idPhotoUrl || undefined);
      }
      setIsSubmitting(false);
      onComplete();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Could not record verification.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200">
        {step === 'age_declaration' ? (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold text-stone-900">18+ Age & Safety Requirement</h3>
                <p className="text-xs text-stone-500">Strict safety policy for international adult dating</p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-5 flex items-start gap-3 text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p>
                HeartMatch is exclusively for consenting adults aged 18 and older. Falsifying your age or impersonating another person results in an immediate permanent ban and report to authorities.
              </p>
            </div>

            {error && (
              <div className="p-3 mb-4 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleVerifyAge} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Confirm Your Date of Birth
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={birthMonth}
                    onChange={(e) => setBirthMonth(Number(e.target.value))}
                    className="border border-stone-300 rounded-lg px-2.5 py-2 text-xs focus:ring-rose-500 focus:border-rose-500"
                  >
                    {[
                      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                    ].map((m, i) => (
                      <option key={m} value={i + 1}>{m}</option>
                    ))}
                  </select>

                  <select
                    value={birthDay}
                    onChange={(e) => setBirthDay(Number(e.target.value))}
                    className="border border-stone-300 rounded-lg px-2.5 py-2 text-xs focus:ring-rose-500 focus:border-rose-500"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>

                  <select
                    value={birthYear}
                    onChange={(e) => setBirthYear(Number(e.target.value))}
                    className="border border-stone-300 rounded-lg px-2.5 py-2 text-xs focus:ring-rose-500 focus:border-rose-500"
                  >
                    {Array.from({ length: 70 }, (_, i) => currentYear - 18 - i).map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <p className="text-[11px] text-stone-500 mt-1">Calculated Age: <strong className="text-stone-800">{calculatedAge} years old</strong></p>
              </div>

              <div className="space-y-2.5 pt-2">
                <label className="flex items-start gap-2 text-xs text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-rose-500 mt-0.5"
                  />
                  <span>I legally certify that I am at least 18 years old and competent under local laws (USA, UK, Canada, Australia, UAE, Europe).</span>
                </label>

                <label className="flex items-start gap-2 text-xs text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedGuidelines}
                    onChange={(e) => setAgreedGuidelines(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-rose-500 mt-0.5"
                  />
                  <span>I agree to respect consent, zero harassment, no deceptive scam behavior, and the HeartMatch Safety Guidelines.</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                {isSubmitting ? 'Verifying...' : 'Confirm Age & Proceed'}
              </button>
            </form>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold text-stone-900">Get 18+ Verified Badge</h3>
                <p className="text-xs text-stone-500">Increase trust and stand out in discovery</p>
              </div>
            </div>

            <p className="text-xs text-stone-600 mb-4 leading-relaxed">
              Profiles with the <strong>18+ Verified Badge</strong> receive up to <strong>3x more matches</strong>. Submit a quick live selfie or ID verification to earn your trust badge.
            </p>

            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Verification Method
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-xs focus:ring-rose-500 focus:border-rose-500"
                >
                  <option value="selfie">Live Photo Selfie Match</option>
                  <option value="passport">Government Passport</option>
                  <option value="driving_license">Driver's License</option>
                  <option value="national_id">National ID Card</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Document / Photo Reference URL (or sample)
                </label>
                <input
                  type="url"
                  placeholder="https://... or leave blank for instant camera match"
                  value={idPhotoUrl}
                  onChange={(e) => setIdPhotoUrl(e.target.value)}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-xs focus:ring-rose-500 focus:border-rose-500"
                />
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-stone-500 bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                <Lock className="w-3.5 h-3.5 text-stone-400" />
                <span>Your verification documents are securely processed for age audit and never shown to other users.</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleFinalize(false)}
                className="w-1/2 py-2.5 border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-medium rounded-lg transition-colors"
              >
                Skip for Now
              </button>
              <button
                type="button"
                onClick={() => handleFinalize(true)}
                disabled={isSubmitting}
                className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Verification'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
