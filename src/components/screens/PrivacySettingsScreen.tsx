import React, { useState, useEffect } from 'react';
import {
  Lock,
  EyeOff,
  Shield,
  Download,
  UserX,
  ArrowLeft,
  CheckCircle2,
  FileText,
  BadgeCheck,
  MapPin,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { safetyService } from '../../services/safetyService';
import { ProfileVerificationModal } from '../common/ProfileVerificationModal';
import { BlockRecord } from '../../types';

interface PrivacySettingsScreenProps {
  onNavigate: (screen: string) => void;
}

export const PrivacySettingsScreen: React.FC<PrivacySettingsScreenProps> = ({ onNavigate }) => {
  const { currentUser, userProfile, updateProfileData } = useAuth();

  const [isIncognito, setIsIncognito] = useState<boolean>(userProfile?.isIncognito || false);
  const [hideDistance, setHideDistance] = useState<boolean>(userProfile?.hideDistance || false);
  const [readReceipts, setReadReceipts] = useState<boolean>(userProfile?.readReceiptsEnabled ?? true);
  const [downloadingData, setDownloadingData] = useState<boolean>(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  // Blocked users
  const [blockedList, setBlockedList] = useState<BlockRecord[]>([]);
  const [loadingBlocks, setLoadingBlocks] = useState(false);

  // Profile photo verification modal
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadBlockedUsers();
    }
  }, [currentUser]);

  const loadBlockedUsers = async () => {
    if (!currentUser) return;
    setLoadingBlocks(true);
    const list = await safetyService.fetchBlockedUsers(currentUser.uid);
    setBlockedList(list);
    setLoadingBlocks(false);
  };

  const handleUnblock = async (blockId: string) => {
    await safetyService.unblockUser(blockId);
    setBlockedList((prev) => prev.filter((b) => b.id !== blockId));
    setSavedNotice('Member unblocked successfully.');
    setTimeout(() => setSavedNotice(null), 3000);
  };

  const handleToggleIncognito = async () => {
    const nextVal = !isIncognito;
    setIsIncognito(nextVal);
    await updateProfileData({ isIncognito: nextVal });
    setSavedNotice(nextVal ? 'Incognito mode activated. Only profiles you like can see you.' : 'Incognito mode disabled.');
    setTimeout(() => setSavedNotice(null), 3000);
  };

  const handleToggleHideDistance = async (checked: boolean) => {
    setHideDistance(checked);
    await updateProfileData({ hideDistance: checked });
    setSavedNotice(checked ? 'Distance hidden. Only your city is visible.' : 'Approximate distance visible.');
    setTimeout(() => setSavedNotice(null), 3000);
  };

  const handleToggleReadReceipts = async (checked: boolean) => {
    setReadReceipts(checked);
    await updateProfileData({ readReceiptsEnabled: checked });
    setSavedNotice('Read receipts setting updated.');
    setTimeout(() => setSavedNotice(null), 3000);
  };

  const handleDownloadGDPR = () => {
    setDownloadingData(true);
    setTimeout(() => {
      const dataPayload = {
        exportedAt: new Date().toISOString(),
        userProfile,
        privacySettings: {
          incognito: isIncognito,
          hideDistance,
          readReceipts,
          minimumLocationOnly: true,
        },
        notice: 'HeartMatch complies strictly with GDPR, CCPA, and adult safety mandates. No raw GPS coordinates are ever retained.',
      };

      const dataStr = JSON.stringify(dataPayload, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `HeartMatch_Privacy_Archive_${Date.now()}.json`;
      a.click();
      setDownloadingData(false);
    }, 800);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 text-left space-y-6 selection:bg-rose-100 selection:text-rose-900">
      <div>
        <button
          onClick={() => onNavigate('discover')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 mb-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Discover</span>
        </button>
        <h1 className="text-2xl font-serif font-bold text-stone-900">Privacy & Safety Controls</h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Manage incognito visibility, location privacy, photo verification, and blocked members
        </p>
      </div>

      {savedNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{savedNotice}</span>
        </div>
      )}

      {/* Optional Photo Verification Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
            <BadgeCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-stone-900">Optional Profile Photo Verification</h3>
              {userProfile?.profileVerified && (
                <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-200">
                  Verified
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 mt-0.5 leading-relaxed max-w-md">
              Complete a simple pose challenge to earn the blue verification checkmark and prove your photos are authentic.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setVerificationModalOpen(true)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
            userProfile?.profileVerified
              ? 'border border-stone-300 text-stone-700 hover:bg-stone-50'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
          }`}
        >
          {userProfile?.profileVerified ? 'Re-verify Photo' : 'Get Verified Now'}
        </button>
      </div>

      {/* Incognito Browsing Mode */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700 shrink-0 mt-0.5">
              <EyeOff className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">Incognito Browsing Mode</h3>
              <p className="text-xs text-stone-500 leading-relaxed max-w-lg mt-0.5">
                When activated, your profile is hidden from general discovery feeds. Only people you have explicitly liked will be able to see and match with you.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleIncognito}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
              isIncognito ? 'bg-rose-600' : 'bg-stone-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                isIncognito ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Minimum Location Privacy & Read Receipts */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-rose-600" />
          <h3 className="text-base font-bold text-stone-900">Location Privacy Guarantee</h3>
        </div>

        <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600">
          <strong className="text-stone-900 block mb-0.5">Coarse Matching Only:</strong>
          <span>
            HeartMatch never tracks, accesses, or shares your exact GPS coordinates or live location.
            Only your chosen metropolitan area ({userProfile?.city || 'City'}, {userProfile?.country || 'Country'}) is stored for match discovery.
          </span>
        </div>

        <div className="space-y-4 text-xs text-stone-700 divide-y divide-stone-100 pt-2">
          <div className="flex items-center justify-between pt-2">
            <div>
              <h4 className="font-semibold text-stone-900">Hide Distance Radius on Profile</h4>
              <p className="text-[11px] text-stone-400">Display only city and country without showing approximate kilometers.</p>
            </div>
            <input
              type="checkbox"
              checked={hideDistance}
              onChange={(e) => handleToggleHideDistance(e.target.checked)}
              className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <div>
              <h4 className="font-semibold text-stone-900">Chat Read Receipts</h4>
              <p className="text-[11px] text-stone-400">Allow your mutual matches to see when you have read their messages.</p>
            </div>
            <input
              type="checkbox"
              checked={readReceipts}
              onChange={(e) => handleToggleReadReceipts(e.target.checked)}
              className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Blocked Users Management */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserX className="w-5 h-5 text-stone-700" />
            <h3 className="text-base font-bold text-stone-900">Blocked Members</h3>
          </div>
          <button
            onClick={loadBlockedUsers}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-50"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loadingBlocks ? (
          <p className="text-xs text-stone-400">Loading blocked list...</p>
        ) : blockedList.length === 0 ? (
          <p className="text-xs text-stone-400">You haven't blocked any members.</p>
        ) : (
          <div className="divide-y divide-stone-100 text-xs">
            {blockedList.map((block) => (
              <div key={block.id} className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-stone-900 block font-mono">
                    Member ID: {block.blockedUserId}
                  </span>
                  <span className="text-[11px] text-stone-400">
                    Blocked on {new Date(block.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={() => handleUnblock(block.id)}
                  className="px-3 py-1 border border-stone-300 hover:bg-stone-50 rounded-lg text-xs font-semibold text-stone-700 cursor-pointer"
                >
                  Unblock
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Data Export & GDPR Rights */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700 shrink-0">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900">Export Your Personal Data Archive</h3>
            <p className="text-xs text-stone-500 leading-relaxed max-w-lg mt-0.5">
              Under international privacy laws (GDPR, CCPA, and UK DPA), you have the right to download a full portable copy of all data stored on HeartMatch.
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadGDPR}
          disabled={downloadingData}
          className="px-4 py-2.5 bg-stone-900 hover:bg-black text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
        >
          <FileText className="w-4 h-4" />
          <span>{downloadingData ? 'Generating Archive...' : 'Download Personal Data Archive (JSON)'}</span>
        </button>
      </div>

      {/* Profile Verification Modal */}
      <ProfileVerificationModal
        isOpen={verificationModalOpen}
        onClose={() => setVerificationModalOpen(false)}
      />
    </div>
  );
};
