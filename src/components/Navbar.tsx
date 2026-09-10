'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { Settings, Bell, Globe, Clock } from 'lucide-react';
import { getCurrentTimeInZone } from '@/lib/timezone';
import { getNotificationPermission } from '@/lib/push-notifications';

interface NavbarProps {
  onOpenSettings: () => void;
}

export function Navbar({ onOpenSettings }: NavbarProps) {
  const { user } = useUser();
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [permState, setPermState] = useState<'granted' | 'denied' | 'default' | 'unsupported'>('default');

  useEffect(() => {
    if (!user?.timezone) return;
    const update = () => {
      setCurrentTimeStr(getCurrentTimeInZone(user.timezone));
      setPermState(getNotificationPermission());
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [user?.timezone]);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm hairline-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Lockup */}
        <div className="flex items-center space-x-3">
          <span className="status-dot status-dot-pulse" />
          <div className="flex flex-col">
            <span className="text-lg font-light tracking-[-0.04em] uppercase font-mono">
              PITCH TIME
            </span>
            <span className="text-[10px] tracking-wider uppercase text-neutral-500">
              LEDGER • MATCH TRACKER
            </span>
          </div>
        </div>

        {/* Center / Timezone preview (Desktop) */}
        {user && (
          <button
            onClick={onOpenSettings}
            className="hidden md:flex items-center space-x-2 text-xs font-mono tracking-tight text-neutral-800 hover:text-black hover:bg-neutral-50 px-2.5 py-1.5 transition-colors hairline-all"
            title="Click to adjust timezone in Settings"
          >
            <Clock className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>{user.timezone}</span>
            <span className="text-neutral-400">•</span>
            <span className="text-black font-normal">{currentTimeStr.split('•')[1] || currentTimeStr}</span>
          </button>
        )}

        {/* Actions & User Profile */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Notification status indicator */}
          <button
            onClick={onOpenSettings}
            className="relative p-2 text-black hover:bg-neutral-100 transition-colors"
            title={`Notifications: ${permState}`}
          >
            <Bell className="w-4 h-4 stroke-[1.5]" />
            {permState === 'granted' && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-black rounded-full" />
            )}
          </button>

          {/* Settings Trigger */}
          <button
            id="settings-trigger-btn"
            onClick={onOpenSettings}
            className="p-2 text-black hover:bg-neutral-100 transition-colors"
            title="Open Settings"
          >
            <Settings className="w-4 h-4 stroke-[1.5]" />
          </button>

          {/* User Avatar */}
          {user && (
            <div
              onClick={onOpenSettings}
              className="flex items-center space-x-2 cursor-pointer pl-2"
              title={user.name}
            >
              <div className="w-8 h-8 rounded-full border border-black overflow-hidden bg-neutral-100 flex items-center justify-center text-xs font-medium">
                {user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user.name.substring(0, 2).toUpperCase()
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
