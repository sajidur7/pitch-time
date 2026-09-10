'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserPreferences } from '@/lib/types';
import { getDetectedTimezone } from '@/lib/timezone';
import { registerServiceWorker } from '@/lib/push-notifications';

interface UserContextType {
  user: UserPreferences | null;
  isLoading: boolean;
  loginWithGoogle: (customEmail?: string, customName?: string) => void;
  logout: () => void;
  completeOnboarding: (data: {
    timezone: string;
    favoriteTeamIds: string[];
    notification10Min: boolean;
    notificationKickoff: boolean;
  }) => void;
  updateTimezone: (timezone: string) => void;
  toggleFavoriteTeam: (teamId: string) => boolean; // returns false if max reached
  updateNotificationPreferences: (prefs: {
    notification10Min?: boolean;
    notificationKickoff?: boolean;
  }) => void;
  toggleMatchAlert: (matchId: string) => boolean;
  resetOnboarding: () => void;
}

const STORAGE_KEY = 'pitch_time_preferences_v2';

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setUser(parsed);
      }
    } catch (e) {
      console.warn('Failed to load user state from localStorage:', e);
    } finally {
      setIsLoading(false);
    }

    // Register service worker quietly in background
    registerServiceWorker().catch(() => {});
  }, []);

  // Save to localStorage when user changes
  useEffect(() => {
    if (isLoading) return;
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Failed to persist user state:', e);
    }
  }, [user, isLoading]);

  const loginWithGoogle = useCallback((customEmail?: string, customName?: string) => {
    const defaultTz = getDetectedTimezone();
    const newUser: UserPreferences = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      email: customEmail || 'alex.football@gmail.com',
      name: customName || 'Alex Mercer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      onboarding_completed: false,
      timezone: defaultTz,
      favoriteTeamIds: ['arsenal', 'real-madrid'], // Defaults for initial pick
      notification10Min: true,
      notificationKickoff: true,
      matchAlerts: { 'm-1': true },
    };

    setUser((prev) => {
      if (prev && prev.onboarding_completed) {
        return prev;
      }
      return newUser;
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  const completeOnboarding = useCallback(
    (data: {
      timezone: string;
      favoriteTeamIds: string[];
      notification10Min: boolean;
      notificationKickoff: boolean;
    }) => {
      setUser((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          ...data,
          onboarding_completed: true,
        };
      });
    },
    []
  );

  const updateTimezone = useCallback((timezone: string) => {
    setUser((prev) => {
      if (!prev) return null;
      return { ...prev, timezone };
    });
  }, []);

  const toggleFavoriteTeam = useCallback((teamId: string): boolean => {
    let success = true;
    setUser((prev) => {
      if (!prev) return null;
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
      setUser((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          notification10Min:
            prefs.notification10Min !== undefined ? prefs.notification10Min : prev.notification10Min,
          notificationKickoff:
            prefs.notificationKickoff !== undefined ? prefs.notificationKickoff : prev.notificationKickoff,
        };
      });
    },
    []
  );

  const toggleMatchAlert = useCallback((matchId: string): boolean => {
    let newState = true;
    setUser((prev) => {
      if (!prev) return null;
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

  const resetOnboarding = useCallback(() => {
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        onboarding_completed: false,
      };
    });
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        loginWithGoogle,
        logout,
        completeOnboarding,
        updateTimezone,
        toggleFavoriteTeam,
        updateNotificationPreferences,
        toggleMatchAlert,
        resetOnboarding,
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
