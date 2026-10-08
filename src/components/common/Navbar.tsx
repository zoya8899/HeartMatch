import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Shield,
  Crown,
  Sparkles,
  Zap,
  RotateCcw,
  Star,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  UserCheck,
  LayoutDashboard,
  SlidersHorizontal,
  Camera,
  CreditCard,
  Lock,
  Flag,
  Mail,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useMatch } from '../../contexts/MatchContext';

interface NavbarProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  openNotifications: () => void;
  unreadCount?: number;
  onOpenProfileModal?: (tab?: 'profile' | 'photos') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  onNavigate,
  openNotifications,
  unreadCount = 0,
  onOpenProfileModal,
}) => {
  const {
    currentUser,
    userAccount,
    userProfile,
    subscription,
    isAdmin,
    superLikesCount,
    boostsCount,
    rewindsCount,
    logout,
  } = useAuth();
  const { matches, activeBoost } = useMatch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const hasActiveSub = subscription?.status === 'active';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => onNavigate(currentUser ? 'discover' : 'landing')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <Heart className="w-5 h-5 fill-white" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-bold text-xl text-stone-900 tracking-tight">HeartMatch</span>
              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 uppercase">18+</span>
            </div>
            <p className="text-[10px] text-stone-400 hidden sm:block">Modern Adult Matchmaking</p>
          </div>
        </div>

        {/* Navigation Links for Authenticated Users */}
        {currentUser && (
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onNavigate('discover')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
                currentScreen === 'discover'
                  ? 'bg-rose-50 text-rose-700 font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              Discover
            </button>

            <button
              onClick={() => onNavigate('likes')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentScreen === 'likes'
                  ? 'bg-rose-50 text-rose-700 font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>Likes</span>
            </button>

            <button
              onClick={() => onNavigate('matches')}
              className={`relative px-3.5 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentScreen === 'matches' || currentScreen === 'chat'
                  ? 'bg-rose-50 text-rose-700 font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Matches</span>
              {matches.length > 0 && (
                <span className="bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {matches.length}
                </span>
              )}
            </button>

            <button
              onClick={() => onNavigate('safety_center')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentScreen === 'safety_center'
                  ? 'bg-rose-50 text-rose-700 font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Safety</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => onNavigate('admin')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
                  currentScreen === 'admin'
                    ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-amber-600" />
                <span>Admin</span>
              </button>
            )}
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {currentUser ? (
            <>
              {/* Consumables indicators */}
              <div className="hidden lg:flex items-center gap-2 bg-stone-50 border border-stone-200 px-3 py-1 rounded-full text-xs text-stone-700">
                <div className="flex items-center gap-1" title="Super Likes">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="font-semibold">{hasActiveSub ? '∞' : superLikesCount}</span>
                </div>
                <span className="text-stone-300">·</span>
                <div className="flex items-center gap-1" title="Profile Boosts">
                  <Zap className="w-3.5 h-3.5 text-purple-600 fill-purple-600" />
                  <span className="font-semibold">{activeBoost ? 'Active' : boostsCount}</span>
                </div>
                <span className="text-stone-300">·</span>
                <div className="flex items-center gap-1" title="Rewinds">
                  <RotateCcw className="w-3.5 h-3.5 text-blue-500" />
                  <span className="font-semibold">{hasActiveSub ? '∞' : rewindsCount}</span>
                </div>
              </div>

              {/* Premium Button */}
              <button
                onClick={() => onNavigate('premium_plans')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                  hasActiveSub
                    ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                    : 'bg-gradient-to-r from-amber-500 to-rose-500 text-white hover:opacity-95'
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{hasActiveSub ? 'VIP Member' : 'Upgrade'}</span>
              </button>

              {/* Notification Bell */}
              <button
                onClick={openNotifications}
                className="relative p-2 text-stone-600 hover:text-stone-900 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-600 ring-2 ring-white" />
                )}
              </button>

              {/* User Menu Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-0.5 rounded-full hover:ring-2 hover:ring-rose-200 transition-all cursor-pointer focus:outline-none"
                  title="Profile Menu"
                >
                  {userProfile?.photos && userProfile.photos.length > 0 && userProfile.photos[0] ? (
                    <img
                      src={userProfile.photos[0]}
                      alt={userProfile?.name || 'Profile'}
                      className="w-8 h-8 rounded-full object-cover border border-rose-300 shadow-xs"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-600 to-rose-400 text-white font-bold text-xs flex items-center justify-center border border-stone-200 shadow-xs">
                      {userProfile?.name?.charAt(0)?.toUpperCase() || '👤'}
                    </div>
                  )}
                </button>

                {profileDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in text-left divide-y divide-stone-100"
                    onMouseLeave={() => setProfileDropdownOpen(false)}
                  >
                    <div className="px-4 py-2">
                      <p className="text-xs font-bold text-stone-900">{userProfile?.name || 'Member'}</p>
                      <p className="text-[11px] text-stone-400 truncate">{currentUser.email}</p>
                      {userProfile?.verified && (
                        <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-700 font-semibold">
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>18+ Verified Profile</span>
                        </div>
                      )}
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          if (onOpenProfileModal) {
                            onOpenProfileModal('profile');
                          } else {
                            onNavigate('create_profile');
                          }
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
                      >
                        <UserCheck className="w-4 h-4 text-rose-500" />
                        <span className="font-semibold text-stone-900">Edit Profile</span>
                      </button>

                      <button
                        onClick={() => {
                          if (onOpenProfileModal) {
                            onOpenProfileModal('photos');
                          } else {
                            onNavigate('upload_photos');
                          }
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
                      >
                        <Camera className="w-4 h-4 text-rose-500" />
                        <span className="font-semibold text-stone-900">Upload Photos</span>
                      </button>

                      <button
                        onClick={() => {
                          onNavigate('dating_preferences');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                      >
                        <SlidersHorizontal className="w-4 h-4 text-stone-400" />
                        <span>Dating Preferences</span>
                      </button>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          onNavigate('subscription_management');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                      >
                        <CreditCard className="w-4 h-4 text-stone-400" />
                        <span>Subscription & Billing</span>
                      </button>

                      <button
                        onClick={() => {
                          onNavigate('privacy_settings');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                      >
                        <Lock className="w-4 h-4 text-stone-400" />
                        <span>Privacy Controls</span>
                      </button>

                      <button
                        onClick={() => {
                          onNavigate('settings');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4 text-stone-400" />
                        <span>Account Settings</span>
                      </button>

                      <button
                        onClick={() => {
                          onNavigate('report_user');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                      >
                        <Flag className="w-4 h-4 text-stone-400" />
                        <span>Report an Incident</span>
                      </button>
                    </div>

                    {isAdmin && (
                      <div className="py-1 bg-amber-50/50">
                        <button
                          onClick={() => {
                            onNavigate('admin');
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-amber-900 font-bold hover:bg-amber-100 flex items-center gap-2"
                        >
                          <LayoutDashboard className="w-4 h-4 text-amber-600" />
                          <span>Admin Console</span>
                        </button>
                      </div>
                    )}

                    <div className="py-1">
                      <button
                        onClick={() => {
                          logout();
                          onNavigate('landing');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('login')}
                className="px-3.5 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => onNavigate('signup')}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Join (18+)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 py-3 space-y-2 text-left animate-in slide-in-from-top-2">
          {currentUser ? (
            <>
              <button
                onClick={() => {
                  onNavigate('discover');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl ${
                  currentScreen === 'discover' ? 'bg-rose-50 text-rose-700' : 'text-stone-700'
                }`}
              >
                Discover
              </button>
              <button
                onClick={() => {
                  onNavigate('likes');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl ${
                  currentScreen === 'likes' ? 'bg-rose-50 text-rose-700' : 'text-stone-700'
                }`}
              >
                Who Liked You
              </button>
              <button
                onClick={() => {
                  onNavigate('matches');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl flex items-center justify-between ${
                  currentScreen === 'matches' ? 'bg-rose-50 text-rose-700' : 'text-stone-700'
                }`}
              >
                <span>Matches & Chat</span>
                {matches.length > 0 && (
                  <span className="bg-rose-600 text-white text-[10px] px-1.5 py-0.2 rounded-full">
                    {matches.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  onNavigate('safety_center');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-bold rounded-xl text-stone-700"
              >
                Safety Center
              </button>
              <button
                onClick={() => {
                  onNavigate('settings');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-bold rounded-xl text-stone-700"
              >
                Settings
              </button>
            </>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => {
                  onNavigate('signup');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 bg-rose-600 text-white text-xs font-bold rounded-xl text-center"
              >
                Create Account (18+)
              </button>
              <button
                onClick={() => {
                  onNavigate('login');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 bg-stone-100 text-stone-800 text-xs font-bold rounded-xl text-center"
              >
                Member Sign In
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
