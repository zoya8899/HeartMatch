import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Flame,
  MessageCircle,
  Heart,
  Globe2,
  ChevronRight,
  TrendingUp,
  X,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  TickerPairing,
  generateRandomMatchNotification,
  getNextActiveMembersCount,
  getCurrentActiveMembersCount,
} from '../../services/activityTickerService';

const COUNTRY_FLAGS: Record<string, string> = {
  PK: '🇵🇰',
  GB: '🇬🇧',
  US: '🇺🇸',
  CA: '🇨🇦',
  AE: '🇦🇪',
};

interface LiveActivityTickerProps {
  className?: string;
  compact?: boolean;
}

export const LiveActivityTicker: React.FC<LiveActivityTickerProps> = ({
  className = '',
  compact = false,
}) => {
  const [currentMatch, setCurrentMatch] = useState<TickerPairing>(() =>
    generateRandomMatchNotification()
  );
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [activeMembers, setActiveMembers] = useState<number>(() =>
    getCurrentActiveMembersCount()
  );
  const [memberDelta, setMemberDelta] = useState<'up' | 'down' | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  const rotationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const counterTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Rotate random match notification every 12 to 18 seconds
  const scheduleNextRotation = () => {
    if (rotationTimerRef.current) {
      clearTimeout(rotationTimerRef.current);
    }

    // Randomized duration between 12,000ms and 18,000ms (12 to 18 seconds)
    const nextInterval = Math.floor(Math.random() * 6000) + 12000;

    rotationTimerRef.current = setTimeout(() => {
      triggerNextMatch();
    }, nextInterval);
  };

  const triggerNextMatch = () => {
    if (isPaused) {
      scheduleNextRotation();
      return;
    }

    // Trigger smooth fade/slide out
    setIsTransitioning(true);

    setTimeout(() => {
      setCurrentMatch(generateRandomMatchNotification());
      setIsTransitioning(false);
      scheduleNextRotation();
    }, 400); // 400ms transition duration
  };

  useEffect(() => {
    scheduleNextRotation();
    return () => {
      if (rotationTimerRef.current) clearTimeout(rotationTimerRef.current);
    };
  }, [isPaused]);

  // Fluctuating Active Members Counter (every 7 to 10 seconds)
  useEffect(() => {
    const updateCounter = () => {
      const prev = activeMembers;
      const next = getNextActiveMembersCount();
      setMemberDelta(next >= prev ? 'up' : 'down');
      setActiveMembers(next);

      setTimeout(() => {
        setMemberDelta(null);
      }, 1500);

      const nextCounterInterval = Math.floor(Math.random() * 3000) + 7000; // 7-10s
      counterTimerRef.current = setTimeout(updateCounter, nextCounterInterval);
    };

    const initialTimer = setTimeout(updateCounter, 6000);
    return () => {
      clearTimeout(initialTimer);
      if (counterTimerRef.current) clearTimeout(counterTimerRef.current);
    };
  }, []);

  if (isMinimized) {
    return (
      <div className={`w-full bg-stone-900 border-b border-stone-800 text-stone-300 px-4 py-1.5 flex items-center justify-between text-xs ${className}`}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-medium text-stone-300">
            <span className="font-bold text-white tabular-nums">{activeMembers}</span> Active Members Online
          </span>
        </div>
        <button
          onClick={() => setIsMinimized(false)}
          className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>Show Live Activity</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    );
  }

  const p1Flag = COUNTRY_FLAGS[currentMatch.person1.countryCode] || '🌐';
  const p2Flag = COUNTRY_FLAGS[currentMatch.person2.countryCode] || '🌐';

  return (
    <aside
      aria-label="Live community match activity"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`relative w-full bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 text-stone-100 border-b border-stone-800/80 shadow-xs select-none z-30 transition-all ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          {/* Left: Live Match Announcement with smooth slide/fade animation */}
          <div className="flex-1 flex items-center gap-2.5 overflow-hidden min-w-0">
            {/* Live Indicator Pill */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-950/80 border border-rose-500/30 text-rose-300 text-[10px] sm:text-[11px] font-bold tracking-wider uppercase shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
              </span>
              <span>LIVE</span>
            </div>

            {/* Rotating Notification Message */}
            <div
              className={`flex-1 flex items-center gap-2 text-xs sm:text-sm font-medium transition-all duration-300 ease-out transform ${
                isTransitioning
                  ? 'opacity-0 -translate-y-2.5 scale-[0.99]'
                  : 'opacity-100 translate-y-0 scale-100'
              }`}
            >
              <span className="text-base sm:text-lg shrink-0" role="img" aria-label="activity emoji">
                {currentMatch.emoji}
              </span>

              {/* Message Content */}
              <div className="flex items-center gap-1.5 flex-wrap truncate">
                <span className="text-stone-100 font-medium tracking-tight">
                  {currentMatch.message}
                </span>

                {/* Country flags tag */}
                <span className="inline-flex items-center gap-1 text-[11px] text-stone-400 bg-stone-800/60 px-2 py-0.5 rounded-md border border-stone-700/50">
                  <span>{p1Flag}</span>
                  <span className="text-stone-500">⇄</span>
                  <span>{p2Flag}</span>
                  <span className="text-[10px] text-stone-400 uppercase tracking-widest ml-0.5">
                    {currentMatch.type.replace('_', ' ')}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Controls: Fluctuating Active Members + Quick Next Trigger */}
          <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-1 md:pt-0 border-t md:border-t-0 border-stone-800/60">
            {/* Naturally Fluctuating Active Members Counter */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-900/90 border border-stone-800 text-stone-300 text-xs shadow-inner"
              title="Active verified singles browsing right now across Pakistan, UK, USA, Canada & UAE"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>

              <div className="flex items-baseline gap-1">
                <span
                  className={`font-mono font-bold text-emerald-400 text-xs sm:text-sm tabular-nums transition-all duration-500 ${
                    memberDelta === 'up'
                      ? 'text-emerald-300 scale-105'
                      : memberDelta === 'down'
                      ? 'text-emerald-400 scale-95'
                      : 'text-emerald-400'
                  }`}
                >
                  {activeMembers}
                </span>
                <span className="text-[11px] text-stone-400 font-medium">
                  Active Members
                </span>
              </div>

              {/* Fluctuating subtle indicator */}
              {memberDelta && (
                <span
                  className={`text-[10px] font-bold ${
                    memberDelta === 'up' ? 'text-emerald-400 animate-bounce' : 'text-stone-400'
                  }`}
                >
                  {memberDelta === 'up' ? '↑' : '↓'}
                </span>
              )}
            </div>

            {/* Quick Skip to Next Match */}
            <button
              type="button"
              onClick={triggerNextMatch}
              title="See next match activity"
              className="p-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white transition-all cursor-pointer border border-stone-700/60"
              aria-label="Next activity"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Minimize button */}
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              title="Minimize activity ticker"
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-300 hover:bg-stone-800/60 transition-colors cursor-pointer"
              aria-label="Minimize ticker"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
