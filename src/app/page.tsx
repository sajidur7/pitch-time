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
      <main className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex items-center space-x-3 text-xs font-bold text-[#163300] uppercase tracking-wider">
          <div className="w-2.5 h-2.5 rounded-full bg-[#9fe870] animate-ping" />
          <span>Synchronizing Pitch Time Fixtures...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-[#454745] flex flex-col justify-between">
      {/* Wise Sticky Navigation Bar */}
      <Navbar onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* Main Kickoff Dashboard (Direct entry, zero login barrier) */}
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
