'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserPreferences } from '@/lib/types';
import { getDetectedTimezone } from '@/lib/timezone';
import { registerServiceWorker } from '@/lib/push-notifications';

interface UserContextType {
  preferences: UserPreferences;
  isLoading: boolean;
  updateTimezone: (timezone: string) => void;
  toggleFavoriteTeam: (teamId: string) => boolean; // returns false if max reached
  updateNotificationPreferences: (prefs: {
    notification10Min?: boolean;
    notificationKickoff?: boolean;
  }) => void;
  toggleMatchAlert: (matchId: string) => boolean;
}

const STORAGE_KEY = 'pitch_time_wise_preferences_v1';

const defaultPreferences: UserPreferences = {
  timezone: 'Europe/London',
  favoriteTeamIds: ['arsenal', 'real-madrid', 'bayern-munich', 'man-city'],
  notification10Min: true,
  notificationKickoff: true,
  matchAlerts: { 'm-1': true },
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage or auto-detect timezone
  useEffect(() => {
    try {
      const detected = getDetectedTimezone();
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setPreferences({
          ...defaultPreferences,
          ...parsed,
          timezone: parsed.timezone || detected,
        });
      } else {
        setPreferences({
          ...defaultPreferences,
          timezone: detected,
        });
      }
    } catch (e) {
      console.warn('Failed to load user state from localStorage:', e);
    } finally {
      setIsLoading(false);
    }

    // Register service worker quietly
    registerServiceWorker().catch(() => {});
  }, []);

  // Save to localStorage when preferences change
  useEffect(() => {
    if (isLoading) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (e) {
      console.warn('Failed to persist preferences:', e);
    }
  }, [preferences, isLoading]);

  const updateTimezone = useCallback((timezone: string) => {
    setPreferences((prev) => ({ ...prev, timezone }));
  }, []);

  const toggleFavoriteTeam = useCallback((teamId: string): boolean => {
    let success = true;
    setPreferences((prev) => {
      const current = prev.favoriteTeamIds || [];
      if (current.includes(teamId)) {
        return {
          ...prev,
          favoriteTeamIds: current.filter((id) => id !== teamId),
        };
      } else {
        if (current.length >= 5) {
          success = false;
          return prev;
        }
        return {
          ...prev,
          favoriteTeamIds: [...current, teamId],
        };
      }
    });
    return success;
  }, []);

  const updateNotificationPreferences = useCallback(
    (prefs: { notification10Min?: boolean; notificationKickoff?: boolean }) => {
      setPreferences((prev) => ({
        ...prev,
        notification10Min:
          prefs.notification10Min !== undefined ? prefs.notification10Min : prev.notification10Min,
        notificationKickoff:
          prefs.notificationKickoff !== undefined ? prefs.notificationKickoff : prev.notificationKickoff,
      }));
    },
    []
  );

  const toggleMatchAlert = useCallback((matchId: string): boolean => {
    let newState = true;
    setPreferences((prev) => {
      const currentAlerts = { ...(prev.matchAlerts || {}) };
      newState = !currentAlerts[matchId];
      currentAlerts[matchId] = newState;
      return {
        ...prev,
        matchAlerts: currentAlerts,
      };
    });
    return newState;
  }, []);

  return (
    <UserContext.Provider
      value={{
        preferences,
        isLoading,
        updateTimezone,
        toggleFavoriteTeam,
        updateNotificationPreferences,
        toggleMatchAlert,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
