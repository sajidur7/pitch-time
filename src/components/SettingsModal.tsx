'use client';

import React, { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { TEAMS } from '@/lib/teams-data';
import { COMMON_TIMEZONES, getCurrentTimeInZone } from '@/lib/timezone';
import { sendTestNotification, getNotificationPermission, requestNotificationPermission } from '@/lib/push-notifications';
import { X, Search, Bell, Clock, Trash2, Plus, Send } from 'lucide-react';
import { PitchTimeLogo } from './PitchTimeLogo';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const {
    preferences,
    updateTimezone,
    toggleFavoriteTeam,
    updateNotificationPreferences,
  } = useUser();

  const [activeTab, setActiveTab] = useState<'teams' | 'timezone' | 'notifications'>('teams');
  const [tzSearch, setTzSearch] = useState('');
  const [teamSearch, setTeamSearch] = useState('');
  const [testStatus, setTestStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentTeams = TEAMS.filter((t) => (preferences.favoriteTeamIds || []).includes(t.id));
  const availableTeams = TEAMS.filter((t) => !(preferences.favoriteTeamIds || []).includes(t.id));

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
    setTestStatus('Sending test alert...');
    const res = await sendTestNotification(
      'pitch time. Kickoff Alert',
      `Match starts in 10 minutes! Local time: ${preferences.timezone}`
    );
    setTestStatus(res.message);
    setTimeout(() => setTestStatus(null), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white w-full max-w-xl max-h-[90vh] rounded-[12px] flex flex-col shadow-2xl overflow-hidden border border-black/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-black/8 flex items-center justify-between">
          <div className="space-y-1">
            <PitchTimeLogo size="sm" />
            <h2 className="text-xl font-semibold text-black tracking-tight">
              Tracker Preferences
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-[8px] bg-black/5 hover:bg-black/10 flex items-center justify-center text-black/60 hover:text-black transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notion Segmented Tab Switcher */}
        <div className="p-3 bg-[#f6f5f4] border-b border-black/8">
          <div className="inline-flex w-full bg-black/5 p-1 rounded-[8px] space-x-1">
            <button
              onClick={() => setActiveTab('teams')}
              className={`flex-1 py-1.5 rounded-[6px] text-xs font-medium transition-all ${
                activeTab === 'teams'
                  ? 'bg-white text-black shadow-xs'
                  : 'text-black/60 hover:text-black'
              }`}
            >
              Clubs ({preferences.favoriteTeamIds?.length || 0}/5)
            </button>
            <button
              onClick={() => setActiveTab('timezone')}
              className={`flex-1 py-1.5 rounded-[6px] text-xs font-medium transition-all ${
                activeTab === 'timezone'
                  ? 'bg-white text-black shadow-xs'
                  : 'text-black/60 hover:text-black'
              }`}
            >
              Timezone
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex-1 py-1.5 rounded-[6px] text-xs font-medium transition-all ${
                activeTab === 'notifications'
                  ? 'bg-white text-black shadow-xs'
                  : 'text-black/60 hover:text-black'
              }`}
            >
              Alerts
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: FAVORITE CLUBS (Typographic Badges - NO image dependencies) */}
          {activeTab === 'teams' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-medium text-black/60">
                    Your Tracked Clubs
                  </h3>
                  <span className="text-xs font-medium text-[#0075de]">
                    {preferences.favoriteTeamIds?.length || 0} of 5 selected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentTeams.map((team) => (
                    <div
                      key={team.id}
                      className="p-3 bg-[#f6f5f4] rounded-[8px] flex items-center justify-between border border-black/5"
                    >
                      <div className="flex items-center space-x-2 min-w-0">
                        <span className="px-2 py-0.5 rounded-[4px] bg-white text-black text-xs font-bold border border-black/10 shrink-0">
                          {team.code}
                        </span>
                        <span className="text-xs font-medium text-black truncate">
                          {team.name}
                        </span>
                      </div>
                      <button
                        onClick={() => toggleFavoriteTeam(team.id)}
                        className="text-black/40 hover:text-red-600 p-1"
                        title="Remove club"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add more clubs */}
              {(preferences.favoriteTeamIds?.length || 0) < 5 ? (
                <div className="space-y-3 pt-4 border-t border-black/8">
                  <label className="block text-xs font-medium text-black/60">
                    Add Club to Tracker
                  </label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3.5 top-3 text-black/40" />
                    <input
                      type="text"
                      value={teamSearch}
                      onChange={(e) => setTeamSearch(e.target.value)}
                      placeholder="Search club name (e.g. Arsenal, Real Madrid, Bayern)..."
                      className="w-full pl-9 pr-4 py-2 bg-white border border-black/10 rounded-[8px] text-xs focus:outline-none focus:border-[#0075de]"
                    />
                  </div>

                  <div className="max-h-44 overflow-y-auto border border-black/10 rounded-[8px] divide-y divide-black/5 bg-white">
                    {filteredAvailableTeams.map((team) => (
                      <div
                        key={team.id}
                        className="px-3.5 py-2 text-xs flex items-center justify-between hover:bg-[#f6f5f4]"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-black">{team.code}</span>
                          <span className="text-black">{team.name}</span>
                          <span className="text-[11px] text-black/50">({team.leagueName})</span>
                        </div>
                        <button
                          onClick={() => toggleFavoriteTeam(team.id)}
                          className="px-2.5 py-1 bg-[#0075de] text-white rounded-[6px] text-[11px] font-medium"
                        >
                          Add +
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-[#f6f5f4] rounded-[8px] text-xs font-medium text-black/60 text-center">
                  Maximum of 5 clubs tracked. Remove a club above to add another.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TIMEZONE */}
          {activeTab === 'timezone' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#f6f5f4] rounded-[8px] space-y-1 border border-black/5">
                <span className="text-[10px] font-medium uppercase text-black/50">
                  Active Selected Zone
                </span>
                <div className="text-lg font-semibold text-black">
                  {preferences.timezone}
                </div>
                <div className="text-xs text-black/60">
                  Current Time: {getCurrentTimeInZone(preferences.timezone)}
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-medium text-black/60">
                  Switch Timezone
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3.5 top-3 text-black/40" />
                  <input
                    type="text"
                    value={tzSearch}
                    onChange={(e) => setTzSearch(e.target.value)}
                    placeholder="Search timezone (e.g. London, Madrid, New York, Tokyo)..."
                    className="w-full pl-9 pr-4 py-2 bg-white border border-black/10 rounded-[8px] text-xs focus:outline-none focus:border-[#0075de]"
                  />
                </div>

                <div className="max-h-56 overflow-y-auto border border-black/10 rounded-[8px] divide-y divide-black/5 bg-white">
                  {filteredTimezones.map((tz) => {
                    const isSelected = preferences.timezone === tz.value;
                    return (
                      <button
                        key={tz.value}
                        type="button"
                        onClick={() => updateTimezone(tz.value)}
                        className={`w-full px-4 py-2 text-left text-xs flex items-center justify-between transition-colors ${
                          isSelected ? 'bg-[#0075de] text-white font-medium' : 'hover:bg-[#f6f5f4] text-black'
                        }`}
                      >
                        <span>{tz.label}</span>
                        <span className={`text-[11px] ${isSelected ? 'text-white/80' : 'text-black/40'}`}>
                          {tz.offset}
                        </span>
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
              <div className="p-4 bg-[#f6f5f4] rounded-[8px] space-y-3 border border-black/5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-medium text-black/60 block">
                      Push Service
                    </span>
                    <span className="text-sm font-semibold text-black">
                      Permission: {getNotificationPermission()}
                    </span>
                  </div>
                  <button
                    onClick={async () => {
                      await requestNotificationPermission();
                    }}
                    className="notion-btn-outline text-xs"
                  >
                    Request Permission
                  </button>
                </div>

                <div className="pt-2 border-t border-black/8">
                  <button
                    id="test-notification-btn"
                    onClick={handleSendTestPush}
                    className="w-full notion-btn-primary py-2 text-xs flex items-center justify-center space-x-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Instant Test Notification</span>
                  </button>

                  {testStatus && (
                    <div className="mt-2 p-2 bg-white rounded-[6px] text-xs font-medium text-black text-center border border-black/10">
                      {testStatus}
                    </div>
                  )}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-3.5 bg-[#f6f5f4] rounded-[8px] cursor-pointer hover:bg-black/5 transition-colors">
                  <input
                    type="checkbox"
                    checked={preferences.notification10Min}
                    onChange={(e) =>
                      updateNotificationPreferences({ notification10Min: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#0075de]"
                  />
                  <div>
                    <span className="text-sm font-medium text-black block">
                      10-Minute Kickoff Alert
                    </span>
                    <span className="text-xs text-black/60 block">
                      Sends notification 10 minutes prior to match start
                    </span>
                  </div>
                </label>

                <label className="flex items-center space-x-3 p-3.5 bg-[#f6f5f4] rounded-[8px] cursor-pointer hover:bg-black/5 transition-colors">
                  <input
                    type="checkbox"
                    checked={preferences.notificationKickoff}
                    onChange={(e) =>
                      updateNotificationPreferences({ notificationKickoff: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#0075de]"
                  />
                  <div>
                    <span className="text-sm font-medium text-black block">
                      Kickoff Whistle Alert
                    </span>
                    <span className="text-xs text-black/60 block">
                      Sends notification at match start
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-black/8 bg-[#f6f5f4] flex justify-end">
          <button
            onClick={onClose}
            className="notion-btn-primary px-5 py-1.5 text-xs font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
