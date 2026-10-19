import React, { useState } from 'react';
import { useRadioApp } from './context/RadioAppContext';
import { TopNavbar } from './components/common/TopNavbar';
import { LoginScreen } from './components/auth/LoginScreen';
import { MarketingAdminLogin } from './components/auth/MarketingAdminLogin';
import { StudioTabletMode } from './components/studio/StudioTabletMode';
import { StudioManagerDashboard } from './components/studio_manager/StudioManagerDashboard';
import { MarketingDashboard } from './components/marketing/MarketingDashboard';
import { ProductionDashboard } from './components/production/ProductionDashboard';
import { MainAdminDashboard } from './components/admin/MainAdminDashboard';
import { FullScheduleViewer } from './components/schedule/FullScheduleViewer';
import { AboutModal } from './components/common/AboutModal';
import { Calendar, LayoutDashboard } from 'lucide-react';

export function AppContent() {
  const { isLoggedIn, currentUser, studioDarkMode, t, isAdminAuthenticated, switchRole } = useRadioApp();
  const [aboutModalOpen, setAboutModalOpen] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'schedule'>('dashboard');

  if (!isLoggedIn) {
    return (
      <>
        <LoginScreen onOpenAbout={() => setAboutModalOpen(true)} />
        <AboutModal
          isOpen={aboutModalOpen}
          onClose={() => setAboutModalOpen(false)}
        />
      </>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col ${
        studioDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Main Top Navigation with Logo */}
      <TopNavbar
        onOpenAbout={() => setAboutModalOpen(true)}
      />

      {/* Sub-header navigation tabs for switching between Role Dashboard and Schedule */}
      <div
        className={`border-b ${
          studioDarkMode
            ? 'bg-slate-900/60 border-slate-800'
            : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                currentView === 'dashboard'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>{t.nav.dashboard} ({t.roles[currentUser.role]})</span>
            </button>

            <button
              onClick={() => setCurrentView('schedule')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                currentView === 'schedule'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{t.nav.schedule} (2026 Grid)</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
            <span>Radio Kwizera 97.7 FM • Jukwaa la Matumaini</span>
          </div>
        </div>
      </div>

      {/* Main Workspace Area */}
      <main className="flex-1">
        {currentView === 'schedule' ? (
          <FullScheduleViewer />
        ) : currentUser.role === 'presenter' ? (
          <StudioTabletMode />
        ) : !isAdminAuthenticated ? (
          <MarketingAdminLogin onSwitchToPresenter={() => switchRole('presenter')} />
        ) : (
          <MarketingDashboard />
        )}
      </main>

      {/* About Radio Kwizera Modal with Logo */}
      <AboutModal
        isOpen={aboutModalOpen}
        onClose={() => setAboutModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
