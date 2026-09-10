'use client';

import React, { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { TEAMS } from '@/lib/teams-data';
import { COMMON_TIMEZONES, getCurrentTimeInZone } from '@/lib/timezone';
import { sendTestNotification, getNotificationPermission, requestNotificationPermission } from '@/lib/push-notifications';
import { X, Search, Bell, Clock, Trash2, Plus, Check, LogOut, RotateCcw, Send } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const {
    user,
    logout,
    updateTimezone,
    toggleFavoriteTeam,
    updateNotificationPreferences,
    resetOnboarding,
  } = useUser();

  const [activeTab, setActiveTab] = useState<'teams' | 'timezone' | 'notifications'>('teams');
  const [tzSearch, setTzSearch] = useState('');
  const [teamSearch, setTeamSearch] = useState('');
  const [testStatus, setTestStatus] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const currentTeams = TEAMS.filter((t) => (user.favoriteTeamIds || []).includes(t.id));
  const availableTeams = TEAMS.filter((t) => !(user.favoriteTeamIds || []).includes(t.id));

  const filteredAvailableTeams = availableTeams.filter(
    (t) =>
      t.name.toLowerCase().includes(teamSearch.toLowerCase()) ||
      t.code.toLowerCase().includes(teamSearch.toLowerCase()) ||
      t.leagueName.toLowerCase().includes(teamSearch.toLowerCase())
  );

  const filteredTimezones = COMMON_TIMEZONES.filter(
    (tz) =>
      tz.label.toLowerCase().includes(tzSearch.toLowerCase()) ||
      tz.value.toLowerCase().includes(tzSearch.toLowerCase())
  );

  const handleSendTestPush = async () => {
    setTestStatus('Dispatching test notification...');
    const res = await sendTestNotification(
      'Pitch Time Test Alert',
      `Kickoff approaching! Converted to ${user.timezone}. 10-minute alert active.`
    );
    setTestStatus(res.message);
    setTimeout(() => setTestStatus(null), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white w-full max-w-2xl max-h-[90vh] hairline-all flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 hairline-b flex items-center justify-between">
          <div className="flex items-center space-x-2 font-mono text-xs text-neutral-500 uppercase">
            <span className="status-dot" />
            <span className="text-black font-medium">PREFERENCES & CONFIGURATION</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-neutral-100 transition-colors text-black"
            title="Close Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex hairline-b bg-neutral-50 text-xs font-mono uppercase">
          <button
            onClick={() => setActiveTab('teams')}
            className={`flex-1 py-3 text-center transition-colors ${
              activeTab === 'teams'
                ? 'bg-white text-black font-semibold hairline-b border-b-2 border-black'
                : 'text-neutral-500 hover:text-black'
            }`}
          >
            Favorite Clubs ({user.favoriteTeamIds?.length || 0}/5)
          </button>
          <button
            onClick={() => setActiveTab('timezone')}
            className={`flex-1 py-3 text-center transition-colors ${
              activeTab === 'timezone'
                ? 'bg-white text-black font-semibold hairline-b border-b-2 border-black'
                : 'text-neutral-500 hover:text-black'
            }`}
          >
            Timezone
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 py-3 text-center transition-colors ${
              activeTab === 'notifications'
                ? 'bg-white text-black font-semibold hairline-b border-b-2 border-black'
                : 'text-neutral-500 hover:text-black'
            }`}
          >
            Notifications
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: FAVORITE TEAMS */}
          {activeTab === 'teams' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs uppercase font-mono text-neutral-600">
                    Currently Tracked Clubs
                  </h3>
                  <span className="text-xs font-mono text-neutral-500">
                    {user.favoriteTeamIds?.length || 0} / 5 Max
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {currentTeams.map((team) => (
                    <div
                      key={team.id}
                      className="p-3 bg-white hairline-all flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-black/10">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={team.crest}
                            alt={team.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium truncate">{team.name}</span>
                      </div>
                      <button
                        onClick={() => toggleFavoriteTeam(team.id)}
                        className="text-neutral-400 hover:text-red-600 p-1"
                        title="Remove club"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add more clubs */}
              {(user.favoriteTeamIds?.length || 0) < 5 ? (
                <div className="space-y-3 pt-4 hairline-t">
                  <label className="block text-xs uppercase font-mono text-neutral-600">
                    Add Club to Ledger
                  </label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-neutral-400" />
                    <input
                      type="text"
                      value={teamSearch}
                      onChange={(e) => setTeamSearch(e.target.value)}
                      placeholder="Search to add (e.g. Liverpool, Barcelona, PSG)..."
                      className="w-full pl-8 pr-3 py-2 bg-white hairline-all text-xs font-mono focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>

                  <div className="max-h-48 overflow-y-auto hairline-all divide-y divide-black/10 bg-white">
                    {filteredAvailableTeams.map((team) => (
                      <div
                        key={team.id}
                        className="px-3 py-2 text-xs font-mono flex items-center justify-between hover:bg-neutral-50"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-black">{team.code}</span>
                          <span>{team.name}</span>
                          <span className="text-[10px] text-neutral-400">({team.leagueName})</span>
                        </div>
                        <button
                          onClick={() => toggleFavoriteTeam(team.id)}
                          className="px-2 py-1 bg-black text-white text-[10px] uppercase hover:bg-neutral-800"
                        >
                          Add +
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-neutral-50 hairline-all text-xs font-mono text-neutral-600 text-center">
                  Maximum of 5 clubs selected. Remove one above to add a different club.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TIMEZONE */}
          {activeTab === 'timezone' && (
            <div className="space-y-4">
              <div className="p-4 bg-neutral-50 hairline-all space-y-1">
                <span className="text-[11px] font-mono uppercase text-neutral-500">
                  Active Timezone
                </span>
                <div className="text-lg font-mono text-black font-semibold">
                  {user.timezone}
                </div>
                <div className="text-xs font-mono text-neutral-600">
                  Current Time: {getCurrentTimeInZone(user.timezone)}
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs uppercase font-mono text-neutral-600">
                  Select New Timezone
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-neutral-400" />
                  <input
                    type="text"
                    value={tzSearch}
                    onChange={(e) => setTzSearch(e.target.value)}
                    placeholder="Search timezones..."
                    className="w-full pl-8 pr-3 py-2 bg-white hairline-all text-xs font-mono focus:outline-none"
                  />
                </div>

                <div className="max-h-56 overflow-y-auto hairline-all divide-y divide-black/10 bg-white">
                  {filteredTimezones.map((tz) => {
                    const isSelected = user.timezone === tz.value;
                    return (
                      <button
                        key={tz.value}
                        type="button"
                        onClick={() => updateTimezone(tz.value)}
                        className={`w-full px-4 py-2.5 text-left font-mono text-xs flex items-center justify-between ${
                          isSelected ? 'bg-black text-white' : 'hover:bg-neutral-50 text-black'
                        }`}
                      >
                        <span>{tz.label}</span>
                        <span className="text-[10px] text-neutral-400">{tz.offset}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              {/* Permission & Test push */}
              <div className="p-4 bg-neutral-50 hairline-all space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-mono uppercase text-neutral-500 block">
                      Push Service Status
                    </span>
                    <span className="text-sm font-medium text-black">
                      Permission: {getNotificationPermission()}
                    </span>
                  </div>
                  <button
                    onClick={async () => {
                      await requestNotificationPermission();
                    }}
                    className="px-3 py-1.5 bg-white hairline-all text-xs font-mono uppercase hover:bg-neutral-100"
                  >
                    Request Permission
                  </button>
                </div>

                <div className="pt-3 hairline-t">
                  <button
                    id="test-notification-btn"
                    onClick={handleSendTestPush}
                    className="w-full py-2.5 bg-black text-white text-xs font-mono uppercase tracking-wider hover:bg-neutral-800 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Instant Test Notification</span>
                  </button>

                  {testStatus && (
                    <div className="mt-2 p-2 bg-white hairline-all text-xs font-mono text-black text-center animate-in fade-in">
                      {testStatus}
                    </div>
                  )}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-3.5 hairline-all cursor-pointer hover:bg-neutral-50">
                  <input
                    type="checkbox"
                    checked={user.notification10Min}
                    onChange={(e) =>
                      updateNotificationPreferences({ notification10Min: e.target.checked })
                    }
                    className="w-4 h-4 accent-black"
                  />
                  <div>
                    <span className="text-sm font-medium block">10-Minute Kickoff Reminder</span>
                    <span className="text-xs text-neutral-500 font-mono block">
                      Sends alert 10 minutes prior to kickoff
                    </span>
                  </div>
                </label>

                <label className="flex items-center space-x-3 p-3.5 hairline-all cursor-pointer hover:bg-neutral-50">
                  <input
                    type="checkbox"
                    checked={user.notificationKickoff}
                    onChange={(e) =>
                      updateNotificationPreferences({ notificationKickoff: e.target.checked })
                    }
                    className="w-4 h-4 accent-black"
                  />
                  <div>
                    <span className="text-sm font-medium block">Exact Kickoff Alert</span>
                    <span className="text-xs text-neutral-500 font-mono block">
                      Sends alert when match is officially underway
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-neutral-50 hairline-t flex items-center justify-between">
          <button
            onClick={() => {
              resetOnboarding();
              onClose();
            }}
            className="flex items-center space-x-1.5 text-xs font-mono text-neutral-600 hover:text-black"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Re-run Onboarding</span>
          </button>

          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-mono uppercase tracking-wider"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
