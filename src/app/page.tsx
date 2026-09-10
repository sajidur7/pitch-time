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
      <main className="min-h-screen flex items-center justify-center bg-[#c4c3b6]">
        <div className="flex items-center space-x-3 text-xs font-mono uppercase text-[#595855]">
          <div className="w-2 h-2 rounded-full bg-black animate-ping" />
          <span>SYNCHRONIZING PITCH TIME FOLIO...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#c4c3b6] text-black flex flex-col justify-between">
      {/* Structured Minimal Header */}
      <Navbar onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* Main Kickoff Gallery Dashboard */}
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
