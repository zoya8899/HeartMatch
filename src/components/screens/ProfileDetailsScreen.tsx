import React, { useState } from 'react';
import {
  ArrowLeft,
  Heart,
  X,
  Star,
  MapPin,
  Briefcase,
  GraduationCap,
  Globe2,
  ShieldCheck,
  Sparkles,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  HeartHandshake,
  MessageCircle,
  Wine,
  Cigarette,
  Dumbbell,
  Dog,
  Ruler,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useMatch } from '../../contexts/MatchContext';
import { useChat } from '../../contexts/ChatContext';
import { UserProfile, AICompatibilityResponse } from '../../types';
import { geminiService } from '../../services/geminiService';
import { isAIPersonaUser } from '../../services/aiPersonas';
import { InternationalUpgradeModal } from '../modals/InternationalUpgradeModal';

interface ProfileDetailsScreenProps {
  profile: UserProfile;
  onBack: () => void;
  onOpenReportModal: (userId: string, name: string) => void;
  onOpenChat?: (matchId: string) => void;
  onNavigate?: (screen: string) => void;
}

export const ProfileDetailsScreen: React.FC<ProfileDetailsScreenProps> = ({
  profile,
  onBack,
  onOpenReportModal,
  onNavigate,
}) => {
  const { userProfile, isPakistanUser, isPremium } = useAuth();
  const { swipe } = useMatch();
  const { startChatWithProfile } = useChat();

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [compatibility, setCompatibility] = useState<AICompatibilityResponse | null>(null);
  const [loadingCompat, setLoadingCompat] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const handleStartDirectChat = async () => {
    const isPersona = profile.isAIPersona || isAIPersonaUser(profile.userId);
    if (!isPersona && isPakistanUser && !isPremium && profile.country && profile.country.toLowerCase() !== 'pakistan') {
      setUpgradeModalOpen(true);
      return;
    }
    await startChatWithProfile(profile);
    if (onNavigate) {
      onNavigate('chat');
    }
  };

  const photos = profile.photos && profile.photos.length > 0
    ? profile.photos
    : ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'];

  const handleCalculateCompatibility = async () => {
    setLoadingCompat(true);
    try {
      const res = await geminiService.getCompatibility(userProfile || {}, profile);
      setCompatibility(res);
    } catch (e) {
      console.warn('Compat check error:', e);
    }
    setLoadingCompat(false);
  };

  const handleAction = async (action: 'like' | 'pass' | 'superlike') => {
    if (action !== 'pass' && profile.country && profile.country.toLowerCase() !== 'pakistan') {
      if (isPakistanUser && !isPremium) {
        setUpgradeModalOpen(true);
        return;
      }
    }
    await swipe(action);
    onBack();
  };

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4 sm:px-6 selection:bg-rose-100 selection:text-rose-900 text-left">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Navigation & Safety header */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-white px-3 py-1.5 rounded-xl border border-stone-200 shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            onClick={() => onOpenReportModal(profile.userId, profile.name)}
            className="text-xs text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
          >
            Report or Block
          </button>
        </div>

        {/* Hero Photo Carousel */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-stone-200">
          <div className="relative h-[480px] sm:h-[540px] w-full bg-stone-900">
            <img
              src={photos[activePhotoIdx]}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/20 to-transparent" />

            {/* Photo Indicators */}
            {photos.length > 1 && (
              <div className="absolute top-4 inset-x-4 flex items-center gap-1.5 z-10">
                {photos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePhotoIdx(i)}
                    className={`h-1 flex-1 rounded-full transition-all cursor-pointer ${
                      i === activePhotoIdx ? 'bg-white' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Bottom Hero Overlay */}
            <div className="absolute bottom-6 inset-x-6 text-white z-10">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight">
                  {profile.name}, {profile.age}
                </h1>
                {profile.verified && (
                  <span className="bg-emerald-500/90 text-white text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified 18+</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-stone-300 mt-1">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>
                  {profile.showCity !== false && profile.city ? `${profile.city}, ` : ''}
                  {profile.country} · Approximate region
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Toolbar */}
          <div className="p-4 bg-white border-t border-stone-100 flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
            <button
              onClick={() => handleAction('pass')}
              className="w-14 h-14 rounded-full bg-stone-50 border border-stone-200 text-stone-500 hover:text-rose-600 hover:border-rose-300 flex items-center justify-center shadow-xs transition-transform hover:scale-105 cursor-pointer"
              title="Pass"
            >
              <X className="w-6 h-6 stroke-[2.5]" />
            </button>
            <button
              onClick={() => handleAction('superlike')}
              className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-500 hover:bg-amber-100 flex items-center justify-center shadow-xs transition-transform hover:scale-105 cursor-pointer"
              title="Super Like"
            >
              <Star className="w-5 h-5 fill-amber-500" />
            </button>
            <button
              onClick={() => handleAction('like')}
              className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-md transition-transform hover:scale-105 cursor-pointer"
              title="Like"
            >
              <Heart className="w-7 h-7 fill-white" />
            </button>
            <button
              onClick={handleStartDirectChat}
              className="px-5 py-3.5 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-full shadow-sm flex items-center justify-center gap-2 transition-transform hover:scale-105 cursor-pointer"
              title="Direct Chat & Messaging"
            >
              <MessageCircle className="w-4 h-4 text-rose-400" />
              <span>Message {profile.name.split(' ')[0]}</span>
            </button>
          </div>
        </div>

        {/* Bio Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-4">
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest">About {profile.name}</h3>
          <p className="text-sm text-stone-800 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-stone-100 text-xs text-stone-700">
            {profile.profession && (
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-stone-400" />
                <span>{profile.profession}</span>
              </div>
            )}
            {profile.education && (
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-stone-400" />
                <span>{profile.education}</span>
              </div>
            )}
            {profile.relationshipGoal && (
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" />
                <span className="capitalize">Seeking: {profile.relationshipGoal.replace('-', ' ')}</span>
              </div>
            )}
            {profile.languages && profile.languages.length > 0 && (
              <div className="flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-stone-400" />
                <span>Speaks: {profile.languages.join(', ')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Profile Prompts */}
        {profile.prompts && profile.prompts.length > 0 && (
          <div className="space-y-4">
            {profile.prompts.map((p) => (
              <div key={p.id} className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-2">
                <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">
                  {p.question}
                </span>
                <p className="text-base font-serif font-bold text-stone-900 leading-relaxed">
                  "{p.answer}"
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Voice Note Simulation */}
        {profile.voiceNote && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPlayingVoice(!isPlayingVoice)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors cursor-pointer ${
                  isPlayingVoice ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                }`}
              >
                <Volume2 className="w-5 h-5" />
              </button>
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase">Voice Vibe Note</span>
                <h4 className="text-xs font-bold text-stone-900">{profile.voiceNote.topic}</h4>
                <span className="text-[11px] text-stone-400">{profile.voiceNote.duration}</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {[4, 8, 14, 22, 16, 12, 18, 24, 15, 8, 4].map((h, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all ${
                    isPlayingVoice ? 'bg-rose-600 animate-pulse' : 'bg-stone-200'
                  }`}
                  style={{ height: `${h}px` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Lifestyle Grid */}
        {profile.lifestyle && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-4">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Lifestyle & Habits</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-stone-700">
              {profile.lifestyle.drinking && (
                <div className="flex items-center gap-2 p-2.5 bg-stone-50 rounded-xl">
                  <Wine className="w-4 h-4 text-stone-400" />
                  <span className="capitalize">Drinks {profile.lifestyle.drinking}</span>
                </div>
              )}
              {profile.lifestyle.smoking && (
                <div className="flex items-center gap-2 p-2.5 bg-stone-50 rounded-xl">
                  <Cigarette className="w-4 h-4 text-stone-400" />
                  <span className="capitalize">Smoking: {profile.lifestyle.smoking}</span>
                </div>
              )}
              {profile.lifestyle.workout && (
                <div className="flex items-center gap-2 p-2.5 bg-stone-50 rounded-xl">
                  <Dumbbell className="w-4 h-4 text-stone-400" />
                  <span className="capitalize">Workout: {profile.lifestyle.workout}</span>
                </div>
              )}
              {profile.lifestyle.pets && (
                <div className="flex items-center gap-2 p-2.5 bg-stone-50 rounded-xl">
                  <Dog className="w-4 h-4 text-stone-400" />
                  <span>{profile.lifestyle.pets}</span>
                </div>
              )}
              {profile.lifestyle.height && (
                <div className="flex items-center gap-2 p-2.5 bg-stone-50 rounded-xl">
                  <Ruler className="w-4 h-4 text-stone-400" />
                  <span>{profile.lifestyle.height}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Passions & Hobbies */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-4">
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Passions & Interests</h3>
          <div className="flex flex-wrap gap-1.5">
            {profile.interests?.map((item, i) => (
              <span key={i} className="bg-stone-100 text-stone-800 text-xs px-3 py-1.5 rounded-full font-medium">
                {item}
              </span>
            ))}
          </div>

          {profile.hobbies && profile.hobbies.length > 0 && (
            <div className="pt-3 border-t border-stone-100">
              <h4 className="text-xs font-semibold text-stone-500 mb-2">Weekend Activities:</h4>
              <div className="flex flex-wrap gap-1.5">
                {profile.hobbies.map((h, i) => (
                  <span key={i} className="bg-rose-50 text-rose-800 text-xs px-3 py-1.5 rounded-full font-medium border border-rose-200">
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI Compatibility Analysis Trigger */}
        <div className="bg-gradient-to-tr from-amber-50 to-rose-50 rounded-3xl p-6 sm:p-8 border border-amber-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-amber-700" />
              <h3 className="text-sm font-bold text-amber-950">AI Chemistry Analysis</h3>
            </div>
            {!compatibility && (
              <button
                type="button"
                onClick={handleCalculateCompatibility}
                disabled={loadingCompat}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                {loadingCompat ? 'Analyzing...' : 'Generate Compatibility'}
              </button>
            )}
          </div>

          {compatibility ? (
            <div className="space-y-3 pt-2 text-xs text-amber-950">
              <div className="flex items-baseline justify-between border-b border-amber-200 pb-2">
                <span className="font-semibold">Synergy Match:</span>
                <span className="text-2xl font-serif font-bold text-amber-900">{compatibility.score}%</span>
              </div>
              <p className="leading-relaxed text-stone-700">{compatibility.summary}</p>
              <div className="p-3 bg-white/80 rounded-xl border border-amber-200">
                <strong className="block text-amber-900 mb-1">Recommended First Date:</strong>
                <p className="text-stone-600">{compatibility.advice}</p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-amber-800 leading-relaxed">
              Use Gemini AI to analyze your profiles and uncover shared strengths, communication alignment, and personalized first-date ideas.
            </p>
          )}
        </div>
      </div>

      {/* International Upgrade Modal */}
      <InternationalUpgradeModal
        isOpen={upgradeModalOpen}
        targetCountry={profile.country}
        targetProfileName={profile.name}
        onClose={() => setUpgradeModalOpen(false)}
        onUpgrade={() => {
          setUpgradeModalOpen(false);
          onNavigate?.('premium_plans');
        }}
        onExplorePakistan={() => {
          setUpgradeModalOpen(false);
          onBack();
        }}
      />
    </div>
  );
};
