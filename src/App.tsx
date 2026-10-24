/**
 * ISCanteen Go - Smart Ordering & Slot Booking for Mobile Commerce
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { PWAInstallBanner } from './components/common/PWAInstallBanner';
import { Toast } from './components/common/Toast';
import { AuthModal } from './components/common/AuthModal';
import { AppStoreModal } from './components/common/AppStoreModal';
import { StudentApp } from './components/student/StudentApp';
import { AdminApp } from './components/admin/AdminApp';

const AppContent: React.FC = () => {
  const { role } = useApp();

  return (
    <div className="min-h-screen bg-[#f3f1eb] flex justify-center selection:bg-stone-900 selection:text-white">
      {/* Mobile viewport container */}
      <div className="w-full max-w-md bg-[#faf9f6] min-h-screen shadow-[0_4px_32px_rgba(0,0,0,0.04)] relative flex flex-col">
        {/* Header with Role Switcher & Holding Countdown */}
        <Header />

        {/* PWA in-app install prompt & Offline indicator */}
        <PWAInstallBanner />

        {/* Global Toast Alerts */}
        <Toast />

        {/* Authentication Modal */}
        <AuthModal />

        {/* App Store & Mobile Install Modal */}
        <AppStoreModal />

        {/* Main View Router */}
        <div className="flex-1">
          {role === 'student' ? <StudentApp /> : <AdminApp />}
        </div>

        {/* Mobile Bottom Navigation (Student mode) */}
        {role === 'student' && <BottomNav />}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
