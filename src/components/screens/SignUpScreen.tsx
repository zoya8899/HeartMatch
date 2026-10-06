import React, { useState } from 'react';
import { Heart, Lock, Mail, User, Calendar, ShieldCheck, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Gender, InterestedIn } from '../../types';

interface SignUpScreenProps {
  onNavigate: (screen: string) => void;
}

export const SignUpScreen: React.FC<SignUpScreenProps> = ({ onNavigate }) => {
  const { signupWithEmail, loginWithGoogle } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState<number>(25);
  const [gender, setGender] = useState<Gender>('woman');
  const [interestedIn, setInterestedIn] = useState<InterestedIn>('men');
  const [agreed18, setAgreed18] = useState<boolean>(false);
  const [agreedSafety, setAgreedSafety] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (age < 18) {
      setError('You must be at least 18 years of age to register on HeartMatch.');
      return;
    }

    if (!agreed18 || !agreedSafety) {
      setError('Please certify you are 18+ and accept the Safety Charter.');
      return;
    }

    setLoading(true);
    try {
      await signupWithEmail(email, password, name, age, gender, interestedIn);
      setLoading(false);
      onNavigate('age_verification');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your information.');
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      setLoading(false);
      onNavigate('create_profile');
    } catch (err: any) {
      setError(err.message || 'Google signup was cancelled.');
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
          <span>Back to Home</span>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-500 text-white flex items-center justify-center mx-auto mb-3 shadow-sm">
            <Heart className="w-6 h-6 fill-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">Apply for Membership</h1>
          <p className="text-xs text-stone-500 mt-1">
            Step 1 of 3: Create your private credentials (Strictly 18+)
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Quick Registration */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full py-3 px-4 border border-stone-300 hover:bg-stone-50 rounded-xl text-xs font-semibold text-stone-700 flex items-center justify-center gap-2.5 transition-colors shadow-xs mb-5 cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-200" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-semibold">
            <span className="bg-white px-3 text-stone-400">or sign up with email</span>
          </div>
        </div>

        {/* Email Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Your Full Name or First Name</label>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                placeholder="e.g. Elena"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-stone-300 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Age (18+ Mandatory)</label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                <input
                  type="number"
                  min={18}
                  max={99}
                  required
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full border border-stone-300 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:ring-rose-500 focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">I Identify As</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full border border-stone-300 rounded-xl px-3 py-2.5 text-xs focus:ring-rose-500 focus:border-rose-500"
              >
                <option value="woman">Woman</option>
                <option value="man">Man</option>
                <option value="nonbinary">Non-binary</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Interested in Meeting</label>
            <select
              value={interestedIn}
              onChange={(e) => setInterestedIn(e.target.value as InterestedIn)}
              className="w-full border border-stone-300 rounded-xl px-3 py-2.5 text-xs focus:ring-rose-500 focus:border-rose-500"
            >
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="everyone">Everyone</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-stone-300 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                minLength={8}
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-stone-300 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="flex items-start gap-2 text-[11px] text-stone-600 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed18}
                onChange={(e) => setAgreed18(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500 mt-0.5"
              />
              <span>I legally certify that I am at least 18 years of age. I understand HeartMatch is strictly prohibited to minors.</span>
            </label>

            <label className="flex items-start gap-2 text-[11px] text-stone-600 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedSafety}
                onChange={(e) => setAgreedSafety(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500 mt-0.5"
              />
              <span>I agree to the Terms of Service, Privacy Policy, and Community Safety Guidelines.</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>{loading ? 'Creating Credentials...' : 'Proceed to Age Verification'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-stone-500 mt-6">
          Already a registered member?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
          >
            Sign In Here
          </button>
        </p>
      </div>
    </div>
  );
};
