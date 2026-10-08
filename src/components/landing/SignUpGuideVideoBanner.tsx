import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  X,
  Volume2,
  VolumeX,
  MessageCircle,
  Users,
  Heart,
  Mic,
  Maximize2,
} from 'lucide-react';

interface SignUpGuideVideoBannerProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
}

export const SignUpGuideVideoBanner: React.FC<SignUpGuideVideoBannerProps> = ({ onOpenAuth }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const totalDuration = 30; // 30-second guide

  const timerRef = useRef<any>(null);

  // Scene determination based on current playback time (0 - 30 seconds)
  // Scene 1: 0 - 10s (Sign Up & Auto-Approval)
  // Scene 2: 10 - 20s (Explore Singles by Country & Pakistan Free Access)
  // Scene 3: 20 - 30s (Free Chat & Voice Notes)
  const currentScene = currentTime < 10 ? 1 : currentTime < 20 ? 2 : 3;

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            return 0; // restart
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setIsPlaying(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsPlaying(false);
  };

  return (
    <>
      {/* Homepage Video Banner Card (Placed right near Apply for Membership / Hero section) */}
      <div className="w-full bg-gradient-to-r from-stone-900 via-stone-850 to-stone-950 border border-stone-800 rounded-3xl p-5 sm:p-7 text-white shadow-xl relative overflow-hidden text-left group">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Left Column: Title & Key Highlights */}
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-semibold text-rose-300">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>🎬 How It Works: 30-sec Sign Up Guide</span>
              <span className="text-stone-400">·</span>
              <span className="text-emerald-400 font-bold">100% Free in Pakistan 🇵🇰</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
              Get Started in Under 30 Seconds
            </h3>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Watch this quick interactive guide to see how fast registration is with <strong>instant auto-approval</strong> (no admin wait) and explore verified singles with unlimited messaging and voice notes.
            </p>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] text-stone-400 pt-1">
              <div className="flex items-center gap-1.5 bg-stone-800/80 px-2.5 py-1 rounded-lg border border-stone-700/60">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Instant Auto-Approval</span>
              </div>
              <div className="flex items-center gap-1.5 bg-stone-800/80 px-2.5 py-1 rounded-lg border border-stone-700/60">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                <span>Strictly 18+ Verified</span>
              </div>
              <div className="flex items-center gap-1.5 bg-stone-800/80 px-2.5 py-1 rounded-lg border border-stone-700/60">
                <Mic className="w-3.5 h-3.5 text-amber-400" />
                <span>Free Chat & Voice Notes</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Video Preview Thumbnail with Play Trigger */}
          <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-4 shrink-0">
            <button
              onClick={handleOpenModal}
              className="w-full sm:w-72 h-44 rounded-2xl relative overflow-hidden bg-stone-800 border-2 border-stone-700/80 hover:border-rose-500 transition-all group/btn shadow-lg cursor-pointer"
            >
              {/* Simulated Screen Background */}
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80"
                alt="Video Guide Thumbnail"
                className="w-full h-full object-cover opacity-60 group-hover/btn:scale-105 group-hover/btn:opacity-75 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/40 to-transparent" />

              {/* Pulsing Play Button */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center">
                <div className="w-13 h-13 rounded-full bg-rose-600 group-hover/btn:bg-rose-500 text-white flex items-center justify-center shadow-lg transition-transform group-hover/btn:scale-110 mb-2">
                  <Play className="w-6 h-6 fill-white ml-1" />
                </div>
                <span className="text-xs font-bold text-white drop-shadow">Watch 30-Sec Video</span>
                <span className="text-[10px] text-stone-300 font-mono">0:30 HD Tutorial</span>
              </div>

              {/* Badge */}
              <div className="absolute top-2.5 right-2.5 bg-stone-950/80 backdrop-blur px-2 py-0.5 rounded text-[10px] font-mono font-bold text-emerald-400 border border-emerald-500/30">
                100% FREE GUIDE
              </div>
            </button>

            {/* Quick Action Trigger */}
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <button
                onClick={() => onOpenAuth('signup')}
                className="px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <span>Apply for Membership</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onOpenAuth('login')}
                className="px-5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-xl border border-stone-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                Member Sign In
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Video Modal Player */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-stone-900 text-white rounded-3xl max-w-2xl w-full border border-stone-700 shadow-2xl overflow-hidden text-left relative flex flex-col">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-stone-800 flex items-center justify-between bg-stone-900/90">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎬</span>
                <div>
                  <h4 className="text-sm font-bold text-white">How HeartMatch Works (30-Sec Guide)</h4>
                  <p className="text-[11px] text-stone-400">Step-by-step registration, instant approval & free chatting</p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Animated Video Screen Canvas */}
            <div className="relative aspect-video w-full bg-stone-950 flex items-center justify-center overflow-hidden select-none">
              {/* Scene 1: 0 - 10 seconds -> Registration & Instant Auto-Approval */}
              {currentScene === 1 && (
                <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 bg-gradient-to-b from-stone-900 to-stone-950">
                  <div className="w-16 h-16 rounded-2xl bg-rose-600/20 text-rose-500 flex items-center justify-center mb-3 ring-8 ring-rose-500/10">
                    <Heart className="w-8 h-8 fill-rose-500" />
                  </div>
                  <span className="text-xs font-bold font-mono text-rose-400 uppercase tracking-widest mb-1">
                    Step 1 of 3 (0:00 - 0:10)
                  </span>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mb-2">
                    Quick Sign-Up with Instant Auto-Approval
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto leading-relaxed mb-4">
                    Sign up with email or Google. Submit your age (18+) and your profile is <strong>automatically approved immediately</strong> — no waiting for manual admin approval!
                  </p>
                  <div className="inline-flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs px-3 py-1.5 rounded-full font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Status: Auto-Approved & Public Instantly</span>
                  </div>
                </div>
              )}

              {/* Scene 2: 10 - 20 seconds -> Explore Singles & Pakistan Free Access */}
              {currentScene === 2 && (
                <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 bg-gradient-to-b from-stone-900 to-stone-950">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-3 ring-8 ring-emerald-500/10">
                    <Users className="w-8 h-8" />
                  </div>
                  <span className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-widest mb-1">
                    Step 2 of 3 (0:10 - 0:20)
                  </span>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mb-2">
                    100% Free Unlimited Access Across Pakistan 🇵🇰
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto leading-relaxed mb-4">
                    Explore verified Pakistani singles in Lahore, Karachi, Islamabad, and worldwide. Zero paywalls, zero hidden charges, and authentic profiles.
                  </p>
                  <div className="inline-flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs px-3 py-1.5 rounded-full font-semibold">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Free Admirers & Instant Matching in Pakistan</span>
                  </div>
                </div>
              )}

              {/* Scene 3: 20 - 30 seconds -> Free Chat, Voice Notes & Safety Filter */}
              {currentScene === 3 && (
                <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 bg-gradient-to-b from-stone-900 to-stone-950">
                  <div className="w-16 h-16 rounded-2xl bg-rose-600/20 text-rose-400 flex items-center justify-center mb-3 ring-8 ring-rose-500/10">
                    <Mic className="w-8 h-8" />
                  </div>
                  <span className="text-xs font-bold font-mono text-rose-400 uppercase tracking-widest mb-1">
                    Step 3 of 3 (0:20 - 0:30)
                  </span>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mb-2">
                    Start Chatting & Sending Voice Notes
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto leading-relaxed mb-4">
                    Connect instantly with mutual matches! Send messages and recorded voice notes freely. Protected by our automated Urdu/Roman Urdu abuse moderation.
                  </p>
                  <div className="inline-flex items-center gap-2 bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs px-3 py-1.5 rounded-full font-semibold">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Respectful Community with Two-Strike Protection</span>
                  </div>
                </div>
              )}

              {/* Watermark Logo */}
              <div className="absolute top-4 left-4 flex items-center gap-2 pointer-events-none">
                <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center font-serif font-bold text-sm shadow-md">
                  H
                </div>
                <span className="text-xs font-bold font-serif text-white tracking-wide">HeartMatch</span>
              </div>

              {/* Live Chapter Indicator */}
              <div className="absolute top-4 right-4 bg-stone-900/80 backdrop-blur border border-stone-700 px-2.5 py-1 rounded-md text-[11px] font-mono text-stone-300">
                Chapter {currentScene}/3 · {currentTime}s / {totalDuration}s
              </div>
            </div>

            {/* Video Controls Bar */}
            <div className="p-4 bg-stone-900 border-t border-stone-800 space-y-3">
              {/* Progress Scrubber */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-stone-400">
                  <span>0:{currentTime.toString().padStart(2, '0')}</span>
                  <span>0:{totalDuration}</span>
                </div>
                <div
                  className="w-full h-2 bg-stone-800 rounded-full overflow-hidden cursor-pointer relative"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const percent = clickX / rect.width;
                    handleSeek(Math.floor(percent * totalDuration));
                  }}
                >
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 to-rose-600 transition-all duration-300 rounded-full"
                    style={{ width: `${(currentTime / totalDuration) * 100}%` }}
                  />
                </div>
              </div>

              {/* Control Buttons & Chapter Tabs */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTogglePlay}
                    className="w-9 h-9 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                  </button>

                  <button
                    onClick={() => {
                      setCurrentTime(0);
                      setIsPlaying(true);
                    }}
                    title="Replay from beginning"
                    className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>

                {/* Chapter Shortcuts */}
                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    onClick={() => handleSeek(0)}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      currentScene === 1 ? 'bg-rose-600/30 text-rose-300 font-bold border border-rose-500/40' : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    1. Sign Up
                  </button>
                  <button
                    onClick={() => handleSeek(10)}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      currentScene === 2 ? 'bg-emerald-600/30 text-emerald-300 font-bold border border-emerald-500/40' : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    2. Pakistan Free
                  </button>
                  <button
                    onClick={() => handleSeek(20)}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      currentScene === 3 ? 'bg-rose-600/30 text-rose-300 font-bold border border-rose-500/40' : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    3. Chat & Voice
                  </button>
                </div>

                {/* Action CTA inside modal */}
                <button
                  onClick={() => {
                    handleCloseModal();
                    onOpenAuth('signup');
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <span>Register Free Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
