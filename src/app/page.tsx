'use client';

import React, { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { Navbar } from '@/components/Navbar';
import { DashboardView } from '@/components/DashboardView';
import { SettingsModal } from '@/components/SettingsModal';

export default function HomePage() {
  const { isLoading } = useUser();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f2f4f5]">
        <div className="flex items-center space-x-3 text-xs font-medium text-[#787574]">
          <div className="w-2.5 h-2.5 rounded-full bg-[#5433eb] animate-ping" />
          <span>Synchronizing pitch time fixtures...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f2f4f5] text-black flex flex-col justify-between">
      {/* Persistent Shop Header */}
      <Navbar onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* Main Kickoff Discovery Dashboard */}
      <div className="flex-1">
        <DashboardView onOpenSettings={() => setIsSettingsOpen(true)} />
      </div>

      {/* Preferences & Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </main>
  );
}
