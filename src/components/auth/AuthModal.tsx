import React, { useState } from 'react';
import { X, Heart, Shield, Lock, Mail, Key, User, Calendar, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Gender, InterestedIn } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'login' | 'signup';
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode,
  onClose,
  onSuccess,
}) => {
  const { loginWithEmail, signupWithEmail, loginWithGoogle, resetPassword } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(24);
  const [gender, setGender] = useState<Gender>('woman');
  const [interestedIn, setInterestedIn] = useState<InterestedIn>('everyone');
  const [agreed18, setAgreed18] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (age < 18) {
          setError('HeartMatch is strictly for adults aged 18 and older.');
          setLoading(false);
          return;
        }
        if (!agreed18) {
          setError('Please certify that you are 18 years of age or older.');
          setLoading(false);
          return;
        }
        await signupWithEmail(email, password, name, age, gender, interestedIn);
      } else if (mode === 'login') {
        await loginWithEmail(email, password);
      } else if (mode === 'forgot') {
        await resetPassword(email);
        setResetSent(true);
        setLoading(false);
        return;
      }

      setLoading(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your details.');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      setLoading(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google sign-in was cancelled or failed.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Brand Header */}
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-500 flex items-center justify-center text-white mx-auto mb-2 shadow-sm">
            <Heart className="w-5 h-5 fill-white" />
          </div>
          <h3 className="text-xl font-serif font-bold text-stone-900">
            {mode === 'signup' ? 'Join HeartMatch' : mode === 'login' ? 'Welcome Back' : 'Reset Password'}
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            {mode === 'signup'
              ? 'Real connections for verified adults 18+'
              : mode === 'login'
              ? 'Log in to continue your conversations'
              : 'Enter your email to receive recovery instructions'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {resetSent ? (
          <div className="text-center py-4 space-y-3">
            <p className="text-xs text-stone-600">
              A password reset link has been dispatched to <strong>{email}</strong>. Please check your inbox.
            </p>
            <button
              onClick={() => {
                setResetSent(false);
                setMode('login');
              }}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700"
            >
              Return to Sign In
            </button>
          </div>
        ) : (
          <>
            {/* Google Sign-in Option */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full mb-4 py-2.5 px-4 border border-stone-300 hover:bg-stone-50 rounded-lg text-xs font-semibold text-stone-700 flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase">
                <span className="bg-white px-2 text-stone-400">or with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === 'signup' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Your Name</label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Alex"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border border-stone-300 rounded-lg pl-9 pr-3 py-2 text-xs focus:ring-rose-500 focus:border-rose-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Age (18+)</label>
                      <div className="relative">
                        <Calendar className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                        <input
                          type="number"
                          min={18}
                          max={100}
                          required
                          value={age}
                          onChange={(e) => setAge(Number(e.target.value))}
                          className="w-full border border-stone-300 rounded-lg pl-9 pr-3 py-2 text-xs focus:ring-rose-500 focus:border-rose-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">I am a</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value as Gender)}
                        className="w-full border border-stone-300 rounded-lg px-2.5 py-2 text-xs focus:ring-rose-500 focus:border-rose-500"
                      >
                        <option value="woman">Woman</option>
                        <option value="man">Man</option>
                        <option value="nonbinary">Non-binary</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Interested in dating</label>
                    <select
                      value={interestedIn}
                      onChange={(e) => setInterestedIn(e.target.value as InterestedIn)}
                      className="w-full border border-stone-300 rounded-lg px-2.5 py-2 text-xs focus:ring-rose-500 focus:border-rose-500"
                    >
                      <option value="men">Men</option>
                      <option value="women">Women</option>
                      <option value="everyone">Everyone</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-stone-300 rounded-lg pl-9 pr-3 py-2 text-xs focus:ring-rose-500 focus:border-rose-500"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-stone-700">Password</label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-[11px] text-rose-600 hover:text-rose-700"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Key className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border border-stone-300 rounded-lg pl-9 pr-3 py-2 text-xs focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>
                </div>
              )}

              {mode === 'signup' && (
                <label className="flex items-start gap-2 pt-1 text-[11px] text-stone-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed18}
                    onChange={(e) => setAgreed18(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-rose-500 mt-0.5"
                  />
                  <span>
                    I certify that I am at least 18 years old and agree to the Terms of Service & Safety Guidelines.
                  </span>
                </label>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                {loading
                  ? 'Processing...'
                  : mode === 'signup'
                  ? 'Create My Account'
                  : mode === 'login'
                  ? 'Sign In to HeartMatch'
                  : 'Send Reset Link'}
              </button>
            </form>

            <div className="mt-4 text-center text-xs text-stone-500">
              {mode === 'login' ? (
                <p>
                  Don't have an account?{' '}
                  <button
                    onClick={() => {
                      setMode('signup');
                      setError(null);
                    }}
                    className="font-semibold text-rose-600 hover:text-rose-700"
                  >
                    Sign up (18+)
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    onClick={() => {
                      setMode('login');
                      setError(null);
                    }}
                    className="font-semibold text-rose-600 hover:text-rose-700"
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
