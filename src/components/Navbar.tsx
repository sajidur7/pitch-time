'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { Settings, Bell, Clock, SlidersHorizontal } from 'lucide-react';
import { getCurrentTimeInZone } from '@/lib/timezone';
import { getNotificationPermission, PermissionState } from '@/lib/push-notifications';

interface NavbarProps {
  onOpenSettings: () => void;
}

export function Navbar({ onOpenSettings }: NavbarProps) {
  const { preferences } = useUser();
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [permState, setPermState] = useState<PermissionState>('default');

  useEffect(() => {
    const update = () => {
      setCurrentTimeStr(getCurrentTimeInZone(preferences.timezone));
      setPermState(getNotificationPermission());
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [preferences.timezone]);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e8ebe6]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Lockup (Wise typography) */}
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded-full bg-[#163300] flex items-center justify-center text-[#9fe870] font-black text-xs">
            PT
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-xl tracking-tight text-[#163300]">
              Pitch Time
            </span>
            <span className="hidden sm:inline-block px-2.5 py-0.5 text-[11px] font-semibold bg-[#e2f6d5] text-[#163300] rounded-full">
              Live Tracker
            </span>
          </div>
        </div>

        {/* Right Cluster: Timezone Pill & Settings (Wise Pill Styling) */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Timezone Pill Button */}
          <button
            onClick={onOpenSettings}
            className="flex items-center space-x-2 px-3 sm:px-4 py-1.5 bg-[#e8ebe6] hover:bg-[#e2f6d5] text-[#163300] rounded-full text-xs font-medium transition-colors"
            title="Adjust timezone"
          >
            <Clock className="w-3.5 h-3.5 text-[#163300]" />
            <span className="max-w-[130px] sm:max-w-[180px] truncate font-semibold">
              {preferences.timezone.split('/')[1]?.replace('_', ' ') || preferences.timezone}
            </span>
            <span className="text-[#868685] hidden md:inline">•</span>
            <span className="text-[#163300] font-mono hidden md:inline">
              {currentTimeStr.split('•')[1] || ''}
            </span>
          </button>

          {/* Push Notification Status Pill */}
          <button
            onClick={onOpenSettings}
            className={`p-2 rounded-full transition-colors flex items-center justify-center ${
              permState === 'granted'
                ? 'bg-[#9fe870] text-[#163300]'
                : 'bg-[#e8ebe6] hover:bg-neutral-200 text-[#454745]'
            }`}
            title={`Push Notifications: ${permState}`}
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* Settings Trigger */}
          <button
            id="settings-trigger-btn"
            onClick={onOpenSettings}
            className="p-2 bg-[#e8ebe6] hover:bg-neutral-200 text-[#163300] rounded-full transition-colors"
            title="Open Preferences"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
