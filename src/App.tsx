import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MatchProvider } from './contexts/MatchContext';
import { ChatProvider } from './contexts/ChatContext';
import { ProductsProvider } from './contexts/ProductsContext';
import { Navbar } from './components/common/Navbar';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { SafetyModal } from './components/common/SafetyModal';
import { UserProfile } from './types';
import { INITIAL_DISCOVERY_PROFILES } from './services/seedData';

// The 20 Requested Screens:
import { LandingScreen } from './components/screens/LandingScreen'; // Screen 1
import { SignUpScreen } from './components/screens/SignUpScreen'; // Screen 2
import { LoginScreen } from './components/screens/LoginScreen'; // Screen 3
import { AgeVerificationScreen } from './components/screens/AgeVerificationScreen'; // Screen 4
import { CreateProfileScreen } from './components/screens/CreateProfileScreen'; // Screen 5
import { UploadPhotosScreen } from './components/screens/UploadPhotosScreen'; // Screen 6
import { DatingPreferencesScreen } from './components/screens/DatingPreferencesScreen'; // Screen 7
import { DiscoverScreen } from './components/screens/DiscoverScreen'; // Screen 8
import { ProfileDetailsScreen } from './components/screens/ProfileDetailsScreen'; // Screen 9
import { LikesScreen } from './components/screens/LikesScreen'; // Screen 10
import { MatchesScreen } from './components/screens/MatchesScreen'; // Screen 11
import { ChatScreen } from './components/screens/ChatScreen'; // Screen 12
import { PremiumPlansScreen } from './components/screens/PremiumPlansScreen'; // Screen 13
import { PaymentScreen } from './components/screens/PaymentScreen'; // Screen 14
import { SubscriptionManagementScreen } from './components/screens/SubscriptionManagementScreen'; // Screen 15
import { SettingsScreen } from './components/screens/SettingsScreen'; // Screen 16
import { PrivacySettingsScreen } from './components/screens/PrivacySettingsScreen'; // Screen 17
import { SafetyCenterScreen } from './components/screens/SafetyCenterScreen'; // Screen 18
import { ReportUserScreen } from './components/screens/ReportUserScreen'; // Screen 19
import { AdminDashboardScreen } from './components/screens/AdminDashboardScreen'; // Screen 20
import { SuspendedAccountScreen } from './components/screens/SuspendedAccountScreen';
import { ProfileSetupModal } from './components/profile/ProfileSetupModal';

function AppContent() {
  const { currentUser, userAccount, userProfile, loading } = useAuth();

  const [currentScreen, setCurrentScreen] = useState<string>(currentUser ? 'discover' : 'landing');
  const [selectedProfile, setSelectedProfile] = useState<UserProfile>(INITIAL_DISCOVERY_PROFILES[0]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('monthly_premium');
  const [reportTarget, setReportTarget] = useState<{ id: string; name: string }>({ id: 'user_target', name: 'Member' });

  // Notifications, Safety modal, and Profile setup modal
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [safetyModalOpen, setSafetyModalOpen] = useState(false);
  const [safetyModalType, setSafetyModalType] = useState<'report' | 'block' | 'unmatch' | 'report_message'>('report');
  const [reportedMessage, setReportedMessage] = useState<{ id?: string; text?: string }>({});

  // Real User Profile Setup & Edit Modal
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState<'profile' | 'photos'>('profile');

  // Mandatory Onboarding: If real logged in user hasn't set up their real photo/profile, prompt them immediately!
  useEffect(() => {
    if (currentUser && userProfile) {
      const hasRealPhoto = userProfile.photos && userProfile.photos.length > 0;
      if (!userProfile.profileSetupCompleted || !hasRealPhoto) {
        setProfileModalTab(!hasRealPhoto ? 'photos' : 'profile');
        setProfileModalOpen(true);
      }
    }
  }, [currentUser, userProfile?.profileSetupCompleted, userProfile?.photos?.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-500 flex items-center justify-center text-white shadow-md animate-pulse">
            <span className="font-serif font-bold text-xl">H</span>
          </div>
          <p className="text-xs text-stone-500 font-medium">Securing adult environment...</p>
        </div>
      </div>
    );
  }

  // Account Suspension & Appeals Flow
  if (currentUser && userAccount?.status === 'suspended') {
    return <SuspendedAccountScreen />;
  }

  const navigateTo = (screen: string, extraData?: any) => {
    if (extraData?.profile) setSelectedProfile(extraData.profile);
    if (extraData?.planId) setSelectedPlanId(extraData.planId);
    if (extraData?.targetId) setReportTarget({ id: extraData.targetId, name: extraData.targetName || 'Member' });
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSafetyModal = (
    targetUserId: string,
    targetName: string,
    actionType: 'report' | 'block' | 'unmatch' | 'report_message' = 'report',
    extra?: { messageId?: string; messageText?: string }
  ) => {
    setReportTarget({ id: targetUserId, name: targetName });
    setSafetyModalType(actionType);
    if (extra) {
      setReportedMessage({ id: extra.messageId, text: extra.messageText });
    } else {
      setReportedMessage({});
    }
    setSafetyModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-rose-100 selection:text-rose-900 flex flex-col">
      {/* Top Navbar */}
      <Navbar
        currentScreen={currentScreen}
        onNavigate={navigateTo}
        openNotifications={() => setNotificationsOpen(true)}
        onOpenProfileModal={(tab) => {
          setProfileModalTab(tab || 'profile');
          setProfileModalOpen(true);
        }}
      />

      {/* Main Content Router rendering the 20 requested screens */}
      <main className="flex-1">
        {/* Screen 1: Landing Page */}
        {currentScreen === 'landing' && <LandingScreen onNavigate={navigateTo} />}

        {/* Screen 2: Sign Up */}
        {currentScreen === 'signup' && <SignUpScreen onNavigate={navigateTo} />}

        {/* Screen 3: Login */}
        {currentScreen === 'login' && <LoginScreen onNavigate={navigateTo} />}

        {/* Screen 4: Age Verification */}
        {currentScreen === 'age_verification' && <AgeVerificationScreen onNavigate={navigateTo} />}

        {/* Screen 5: Create Profile */}
        {currentScreen === 'create_profile' && <CreateProfileScreen onNavigate={navigateTo} />}

        {/* Screen 6: Upload Photos */}
        {currentScreen === 'upload_photos' && <UploadPhotosScreen onNavigate={navigateTo} />}

        {/* Screen 7: Dating Preferences */}
        {currentScreen === 'dating_preferences' && <DatingPreferencesScreen onNavigate={navigateTo} />}

        {/* Screen 8: Discover / Swipe */}
        {currentScreen === 'discover' && (
          <DiscoverScreen
            onNavigate={navigateTo}
            onOpenProfileDetails={(profile) => {
              setSelectedProfile(profile);
              navigateTo('profile_details');
            }}
          />
        )}

        {/* Screen 9: Profile Details */}
        {currentScreen === 'profile_details' && (
          <ProfileDetailsScreen
            profile={selectedProfile}
            onBack={() => navigateTo('discover')}
            onNavigate={navigateTo}
            onOpenReportModal={(id, name) => {
              setReportTarget({ id, name });
              navigateTo('report_user');
            }}
          />
        )}

        {/* Screen 10: Likes */}
        {currentScreen === 'likes' && (
          <LikesScreen
            onNavigate={navigateTo}
            onOpenProfile={(profile) => {
              setSelectedProfile(profile);
              navigateTo('profile_details');
            }}
          />
        )}

        {/* Screen 11: Matches */}
        {currentScreen === 'matches' && <MatchesScreen onNavigate={navigateTo} />}

        {/* Screen 12: Chat */}
        {currentScreen === 'chat' && (
          <ChatScreen
            onNavigate={navigateTo}
            onOpenSafetyModal={handleOpenSafetyModal}
          />
        )}

        {/* Screen 13: Premium Plans */}
        {currentScreen === 'premium_plans' && <PremiumPlansScreen onNavigate={navigateTo} />}

        {/* Screen 14: Payment */}
        {currentScreen === 'payment' && (
          <PaymentScreen planId={selectedPlanId} onNavigate={navigateTo} />
        )}

        {/* Screen 15: Subscription Management */}
        {currentScreen === 'subscription_management' && (
          <SubscriptionManagementScreen onNavigate={navigateTo} />
        )}

        {/* Screen 16: Settings */}
        {currentScreen === 'settings' && <SettingsScreen onNavigate={navigateTo} />}

        {/* Screen 17: Privacy Settings */}
        {currentScreen === 'privacy_settings' && (
          <PrivacySettingsScreen onNavigate={navigateTo} />
        )}

        {/* Screen 18: Safety Center */}
        {currentScreen === 'safety_center' && (
          <SafetyCenterScreen onNavigate={navigateTo} />
        )}

        {/* Screen 19: Report User */}
        {currentScreen === 'report_user' && (
          <ReportUserScreen
            targetUserId={reportTarget.id}
            targetUserName={reportTarget.name}
            onNavigate={navigateTo}
          />
        )}

        {/* Screen 20: Admin Dashboard */}
        {currentScreen === 'admin' && <AdminDashboardScreen onNavigate={navigateTo} />}
      </main>

      {/* Global Safety Modal */}
      <SafetyModal
        isOpen={safetyModalOpen}
        type={safetyModalType}
        targetUserId={reportTarget.id}
        targetUserName={reportTarget.name}
        reportedMessageId={reportedMessage.id}
        reportedMessageText={reportedMessage.text}
        onClose={() => setSafetyModalOpen(false)}
      />

      {/* Global Notifications Drawer */}
      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onSelectNotification={(link) => {
          if (link?.includes('matches')) navigateTo('matches');
          else if (link?.includes('likes')) navigateTo('likes');
        }}
      />

      {/* Real User Profile Onboarding & Editing Modal */}
      <ProfileSetupModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        initialTab={profileModalTab}
        isOnboarding={Boolean(currentUser && (!userProfile?.profileSetupCompleted || !userProfile?.photos || userProfile.photos.length === 0))}
        onComplete={() => {
          setProfileModalOpen(false);
          navigateTo('discover');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ProductsProvider>
      <AuthProvider>
        <MatchProvider>
          <ChatProvider>
            <AppContent />
          </ChatProvider>
        </MatchProvider>
      </AuthProvider>
    </ProductsProvider>
  );
}
