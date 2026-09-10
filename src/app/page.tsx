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
      <main className="min-h-screen flex items-center justify-center bg-[#f6f5f4]">
        <div className="flex items-center space-x-3 text-xs font-medium text-black/60">
          <div className="w-2.5 h-2.5 rounded-full bg-[#0075de] animate-ping" />
          <span>Opening pitch time notebook...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f5f4] text-black flex flex-col justify-between">
      {/* Sticky Notion Top Bar */}
      <Navbar onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* Main Kickoff Dashboard */}
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
