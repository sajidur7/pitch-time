'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { Settings, Bell, Clock, SlidersHorizontal } from 'lucide-react';
import { getCurrentTimeInZone } from '@/lib/timezone';
import { getNotificationPermission, PermissionState } from '@/lib/push-notifications';
import { PitchTimeLogo } from './PitchTimeLogo';

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
    <header className="sticky top-0 z-40 bg-[#c4c3b6]/95 backdrop-blur-xs border-b border-[#dfdcd5]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        {/* Gallery Monogram + Wordmark */}
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded-full border border-black flex items-center justify-center text-black font-semibold text-xs select-none">
            P
          </div>
          <PitchTimeLogo size="sm" />
          <span className="hidden md:inline-block text-[11px] font-mono uppercase tracking-wider text-[#595855] pl-2 border-l border-[#dfdcd5]">
            MATCH EXHIBITION
          </span>
        </div>

        {/* Right Actions: Stat & Capsule Pill Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Timezone Stat Capsule */}
          <button
            onClick={onOpenSettings}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-[#595855]/40 hover:border-black text-xs font-mono tracking-tight text-black transition-colors"
            title="Adjust timezone in settings"
          >
            <span className="text-[10px] text-[#595855] uppercase">ZONE:</span>
            <span className="font-medium max-w-[130px] sm:max-w-[170px] truncate">
              {preferences.timezone.split('/')[1]?.replace('_', ' ') || preferences.timezone}
            </span>
            <span className="text-[#595855] hidden sm:inline">•</span>
            <span className="text-[#595855] hidden sm:inline">
              {currentTimeStr.split('•')[1] || ''}
            </span>
          </button>

          {/* Notification Indicator Capsule */}
          <button
            onClick={onOpenSettings}
            className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase flex items-center space-x-1.5 transition-colors ${
              permState === 'granted'
                ? 'bg-black text-white'
                : 'border border-[#595855]/40 text-black hover:border-black'
            }`}
            title={`Notifications: ${permState}`}
          >
            <Bell className="w-3 h-3" />
            <span className="text-[11px] hidden sm:inline">
              {permState === 'granted' ? 'ALERTS ON' : 'ALERTS'}
            </span>
          </button>

          {/* Settings Trigger */}
          <button
            id="settings-trigger-btn"
            onClick={onOpenSettings}
            className="w-8 h-8 rounded-full border border-black flex items-center justify-center text-black hover:bg-black hover:text-white transition-colors"
            title="Settings"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
