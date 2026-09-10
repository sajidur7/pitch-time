'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { Bell, Clock, SlidersHorizontal, BookOpen } from 'lucide-react';
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
    <header className="sticky top-0 z-40 bg-[#f6f5f4]/95 backdrop-blur-xs border-b border-black/8">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        {/* Brand Lockup: pitch time. */}
        <div className="flex items-center space-x-3">
          <PitchTimeLogo size="md" />
        </div>

        {/* Right Navigation Actions (Notion 8px Buttons) */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Timezone Pill/Button */}
          <button
            onClick={onOpenSettings}
            className="notion-btn-outline flex items-center space-x-2 text-xs"
            title="Adjust timezone"
          >
            <Clock className="w-3.5 h-3.5 text-black/60" />
            <span className="max-w-[130px] sm:max-w-[180px] truncate font-medium">
              {preferences.timezone.split('/')[1]?.replace('_', ' ') || preferences.timezone}
            </span>
            <span className="text-black/30 hidden md:inline">•</span>
            <span className="text-black/70 font-mono hidden md:inline">
              {currentTimeStr.split('•')[1] || ''}
            </span>
          </button>

          {/* Notifications Button */}
          <button
            onClick={onOpenSettings}
            className={`flex items-center space-x-1.5 text-xs ${
              permState === 'granted'
                ? 'notion-btn-primary'
                : 'notion-btn-ghost'
            }`}
            title={`Notifications: ${permState}`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {permState === 'granted' ? 'Alerts On' : 'Enable Alerts'}
            </span>
          </button>

          {/* Settings Trigger */}
          <button
            id="settings-trigger-btn"
            onClick={onOpenSettings}
            className="w-8 h-8 rounded-[8px] bg-white border border-black/10 hover:bg-black/5 flex items-center justify-center text-black transition-colors"
            title="Preferences"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
