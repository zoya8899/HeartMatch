import React, { useState } from 'react';
import {
  Settings,
  Bell,
  Lock,
  PauseCircle,
  LogOut,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Sliders,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SettingsScreenProps {
  onNavigate: (screen: string) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onNavigate }) => {
  const { currentUser, userProfile, logout, deleteAccount } = useAuth();

  const [notifMatches, setNotifMatches] = useState(true);
  const [notifMessages, setNotifMessages] = useState(true);
  const [notifLikes, setNotifLikes] = useState(true);
  const [unitMetric, setUnitMetric] = useState<'km' | 'miles'>('km');
  const [snoozeDiscovery, setSnoozeDiscovery] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleLogout = async () => {
    await logout();
    onNavigate('landing');
  };

  const handleDelete = async () => {
    await deleteAccount();
    onNavigate('landing');
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
        <h1 className="text-2xl font-serif font-bold text-stone-900">Account & App Settings</h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Manage your notifications, measurement units, and security parameters
        </p>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-4">
        <h3 className="text-base font-bold text-stone-900">Account Credentials</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone-700">
          <div>
            <span className="text-[10px] text-stone-400 block mb-0.5">Registered Email</span>
            <strong className="text-stone-900">{currentUser?.email || 'user@heartmatch.com'}</strong>
          </div>
          <div>
            <span className="text-[10px] text-stone-400 block mb-0.5">Age Status</span>
            <strong className="text-emerald-700">Verified Adult 18+</strong>
          </div>
        </div>
      </div>

      {/* Discovery Pause Mode */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-stone-900">Pause Discovery</h3>
            <p className="text-xs text-stone-500">Temporarily hide your card from other daters without losing matches.</p>
          </div>
          <button
            onClick={() => setSnoozeDiscovery(!snoozeDiscovery)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              snoozeDiscovery ? 'bg-rose-600' : 'bg-stone-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                snoozeDiscovery ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Notifications Management */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-4">
        <h3 className="text-base font-bold text-stone-900">Notifications</h3>
        <div className="space-y-3 text-xs text-stone-700">
          <div className="flex items-center justify-between">
            <span>New Mutual Matches</span>
            <input
              type="checkbox"
              checked={notifMatches}
              onChange={(e) => setNotifMatches(e.target.checked)}
              className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <span>Direct Chat Messages</span>
            <input
              type="checkbox"
              checked={notifMessages}
              onChange={(e) => setNotifMessages(e.target.checked)}
              className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <span>Someone Liked or Super Liked You</span>
            <input
              type="checkbox"
              checked={notifLikes}
              onChange={(e) => setNotifLikes(e.target.checked)}
              className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
            />
          </div>
        </div>
      </div>

      {/* Localization Units */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-4">
        <h3 className="text-base font-bold text-stone-900">Measurement Units</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setUnitMetric('km')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border ${
              unitMetric === 'km' ? 'bg-stone-900 text-white border-stone-900' : 'border-stone-200 text-stone-600'
            }`}
          >
            Kilometers (km)
          </button>
          <button
            onClick={() => setUnitMetric('miles')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border ${
              unitMetric === 'miles' ? 'bg-stone-900 text-white border-stone-900' : 'border-stone-200 text-stone-600'
            }`}
          >
            Miles (mi)
          </button>
        </div>
      </div>

      {/* Critical Actions */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 flex items-center justify-between">
        <button
          onClick={handleLogout}
          className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="text-xs font-semibold text-rose-600 hover:text-rose-800 cursor-pointer"
        >
          Delete Account Permanently
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <h3 className="text-base font-bold text-rose-700">Delete Account & Stored Data</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              This action permanently purges your profile, mutual connections, and private messages. This action is not reversible.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="w-1/2 py-2.5 border border-stone-300 text-stone-700 text-xs font-medium rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
