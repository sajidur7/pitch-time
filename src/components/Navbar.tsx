'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { Settings, Bell, Clock, SlidersHorizontal, Sparkles } from 'lucide-react';
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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#ebebeb]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Shop Wordmark: pitch time with violet dot */}
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-2xl font-semibold tracking-[-0.04em] text-black">
            pitch time
            <span className="text-[#5433eb] font-black text-2xl leading-none">.</span>
          </span>
          <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#f2f4f5] text-[#787574] border border-[#ebebeb]">
            live tracker
          </span>
        </div>

        {/* Right Action Cluster (Shop Pill Components) */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Timezone Pill Button */}
          <button
            onClick={onOpenSettings}
            className="shop-pill-white flex items-center space-x-2 px-3 sm:px-4 py-2 text-xs text-[#000000] transition-colors"
            title="Adjust timezone in settings"
          >
            <Clock className="w-3.5 h-3.5 text-[#787574]" />
            <span className="max-w-[130px] sm:max-w-[170px] truncate font-medium">
              {preferences.timezone.split('/')[1]?.replace('_', ' ') || preferences.timezone}
            </span>
            <span className="text-[#cccccc] hidden md:inline">•</span>
            <span className="text-[#787574] font-mono hidden md:inline">
              {currentTimeStr.split('•')[1] || ''}
            </span>
          </button>

          {/* Notification Pill */}
          <button
            onClick={onOpenSettings}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              permState === 'granted'
                ? 'bg-[#5433eb] text-white shadow-[0_4px_14px_rgba(69,36,219,0.3)]'
                : 'shop-pill-white text-[#787574] hover:text-black'
            }`}
            title={`Notifications: ${permState}`}
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* Settings Trigger */}
          <button
            id="settings-trigger-btn"
            onClick={onOpenSettings}
            className="shop-pill-white w-9 h-9 flex items-center justify-center text-[#787574] hover:text-black transition-colors"
            title="Preferences"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
