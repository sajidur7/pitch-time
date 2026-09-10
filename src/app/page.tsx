'use client';

import React, { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { Watermark } from '@/components/Watermark';
import { Navbar } from '@/components/Navbar';
import { LandingView } from '@/components/LandingView';
import { OnboardingWizard } from '@/components/OnboardingWizard';
import { DashboardView } from '@/components/DashboardView';
import { SettingsModal } from '@/components/SettingsModal';

export default function HomePage() {
  const { user, isLoading } = useUser();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Initial loading shimmer
  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex items-center space-x-3 font-mono text-xs uppercase tracking-wider">
          <span className="status-dot status-dot-pulse" />
          <span>SYNCHRONIZING PITCH TIME LEDGER...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-white text-black flex flex-col justify-between selection:bg-black selection:text-white">
      {/* 19-86 Monumental Architectural Background Watermark */}
      <Watermark text="PITCH TIME" />

      {/* Top Navigation */}
      <Navbar onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* Primary Content View Switcher */}
      <div className="relative z-10 flex-1 flex flex-col">
        {!user ? (
          <LandingView />
        ) : !user.onboarding_completed ? (
          <OnboardingWizard />
        ) : (
          <DashboardView onOpenSettings={() => setIsSettingsOpen(true)} />
        )}
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </main>
  );
}
