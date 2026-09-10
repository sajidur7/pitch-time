'use client';

import React, { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { TEAMS } from '@/lib/teams-data';
import { COMMON_TIMEZONES, getCurrentTimeInZone } from '@/lib/timezone';
import { sendTestNotification, getNotificationPermission, requestNotificationPermission } from '@/lib/push-notifications';
import { X, Search, Bell, Clock, Trash2, Plus, Send, Check } from 'lucide-react';

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
      'Pitch Time Kickoff Alert',
      `Match starts in 10 minutes! Local time: ${preferences.timezone}`
    );
    setTestStatus(res.message);
    setTimeout(() => setTestStatus(null), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white w-full max-w-xl max-h-[90vh] rounded-[24px] flex flex-col shadow-2xl overflow-hidden border border-black/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Wise Modal Header */}
        <div className="p-6 bg-[#e8ebe6] flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#163300]">
              Configuration
            </span>
            <h2 className="text-2xl font-black text-[#0e0f0c] tracking-tight">
              Preferences
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white hover:bg-neutral-200 flex items-center justify-center text-[#163300] transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wise Segmented Tab Switcher */}
        <div className="p-4 bg-[#e8ebe6] border-t border-black/5">
          <div className="inline-flex w-full bg-white p-1 rounded-full space-x-1">
            <button
              onClick={() => setActiveTab('teams')}
              className={`flex-1 py-2 rounded-full text-xs font-bold transition-all ${
                activeTab === 'teams'
                  ? 'bg-[#9fe870] text-[#163300]'
                  : 'text-[#454745] hover:text-[#163300]'
              }`}
            >
              Clubs ({preferences.favoriteTeamIds?.length || 0}/5)
            </button>
            <button
              onClick={() => setActiveTab('timezone')}
              className={`flex-1 py-2 rounded-full text-xs font-bold transition-all ${
                activeTab === 'timezone'
                  ? 'bg-[#9fe870] text-[#163300]'
                  : 'text-[#454745] hover:text-[#163300]'
              }`}
            >
              Timezone
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex-1 py-2 rounded-full text-xs font-bold transition-all ${
                activeTab === 'notifications'
                  ? 'bg-[#9fe870] text-[#163300]'
                  : 'text-[#454745] hover:text-[#163300]'
              }`}
            >
              Alerts
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: FAVORITE CLUBS (NO images - pure typography) */}
          {activeTab === 'teams' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#6a6c6a]">
                    Your Tracked Clubs
                  </h3>
                  <span className="text-xs font-bold text-[#163300]">
                    {preferences.favoriteTeamIds?.length || 0} of 5 selected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentTeams.map((team) => (
                    <div
                      key={team.id}
                      className="p-3 bg-[#e8ebe6] rounded-[10px] flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <span className="px-2 py-0.5 rounded-full bg-[#163300] text-[#9fe870] text-xs font-black shrink-0">
                          {team.code}
                        </span>
                        <span className="text-sm font-bold text-[#0e0f0c] truncate">
                          {team.name}
                        </span>
                      </div>
                      <button
                        onClick={() => toggleFavoriteTeam(team.id)}
                        className="text-[#868685] hover:text-red-600 p-1.5 rounded-full hover:bg-white"
                        title="Remove club"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add more clubs */}
              {(preferences.favoriteTeamIds?.length || 0) < 5 ? (
                <div className="space-y-3 pt-4 border-t border-[#e8ebe6]">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#6a6c6a]">
                    Add Club to Tracker
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#868685]" />
                    <input
                      type="text"
                      value={teamSearch}
                      onChange={(e) => setTeamSearch(e.target.value)}
                      placeholder="Search to add (e.g. Arsenal, Liverpool, Real Madrid)..."
                      className="w-full pl-9 pr-4 py-2 bg-white border border-[#868685]/30 rounded-[10px] text-xs font-medium focus:outline-none focus:border-[#163300]"
                    />
                  </div>

                  <div className="max-h-44 overflow-y-auto border border-[#868685]/20 rounded-[10px] divide-y divide-black/5 bg-white">
                    {filteredAvailableTeams.map((team) => (
                      <div
                        key={team.id}
                        className="px-3.5 py-2.5 text-xs flex items-center justify-between hover:bg-[#e8ebe6]"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-black text-[#163300]">{team.code}</span>
                          <span className="font-bold text-[#0e0f0c]">{team.name}</span>
                          <span className="text-[10px] text-[#868685]">({team.leagueName})</span>
                        </div>
                        <button
                          onClick={() => toggleFavoriteTeam(team.id)}
                          className="px-3 py-1 bg-[#163300] text-[#9fe870] rounded-full text-[11px] font-bold hover:bg-[#054d28]"
                        >
                          Add +
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-[#e8ebe6] rounded-[10px] text-xs font-semibold text-[#163300] text-center">
                  Maximum of 5 clubs tracked. Remove a club above to add another.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TIMEZONE */}
          {activeTab === 'timezone' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#e2f6d5] rounded-[10px] space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#163300]">
                  Active Selected Zone
                </span>
                <div className="text-xl font-black text-[#163300]">
                  {preferences.timezone}
                </div>
                <div className="text-xs text-[#163300] font-medium">
                  Current Time: {getCurrentTimeInZone(preferences.timezone)}
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6a6c6a]">
                  Change Timezone
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#868685]" />
                  <input
                    type="text"
                    value={tzSearch}
                    onChange={(e) => setTzSearch(e.target.value)}
                    placeholder="Search timezones (e.g. London, Madrid, New York, Tokyo)..."
                    className="w-full pl-9 pr-4 py-2 bg-white border border-[#868685]/30 rounded-[10px] text-xs font-medium focus:outline-none focus:border-[#163300]"
                  />
                </div>

                <div className="max-h-56 overflow-y-auto border border-[#868685]/20 rounded-[10px] divide-y divide-black/5 bg-white">
                  {filteredTimezones.map((tz) => {
                    const isSelected = preferences.timezone === tz.value;
                    return (
                      <button
                        key={tz.value}
                        type="button"
                        onClick={() => updateTimezone(tz.value)}
                        className={`w-full px-4 py-2.5 text-left text-xs flex items-center justify-between transition-colors ${
                          isSelected ? 'bg-[#163300] text-white font-bold' : 'hover:bg-[#e8ebe6] text-[#0e0f0c]'
                        }`}
                      >
                        <span>{tz.label}</span>
                        <span className={`text-[11px] ${isSelected ? 'text-[#9fe870]' : 'text-[#868685]'}`}>
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
              <div className="p-4 bg-[#e8ebe6] rounded-[10px] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#6a6c6a] block">
                      Push Service
                    </span>
                    <span className="text-sm font-bold text-[#0e0f0c]">
                      Status: {getNotificationPermission()}
                    </span>
                  </div>
                  <button
                    onClick={async () => {
                      await requestNotificationPermission();
                    }}
                    className="px-3.5 py-1.5 bg-white text-[#163300] rounded-full text-xs font-bold hover:bg-neutral-100"
                  >
                    Request Permission
                  </button>
                </div>

                <div className="pt-2 border-t border-black/5">
                  <button
                    id="test-notification-btn"
                    onClick={handleSendTestPush}
                    className="w-full wise-pill-btn-primary py-2.5 text-xs font-bold flex items-center justify-center space-x-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Instant Test Notification</span>
                  </button>

                  {testStatus && (
                    <div className="mt-2 p-2 bg-white rounded-[8px] text-xs font-semibold text-[#163300] text-center">
                      {testStatus}
                    </div>
                  )}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-3.5 bg-[#e8ebe6] rounded-[10px] cursor-pointer hover:bg-[#e2f6d5] transition-colors">
                  <input
                    type="checkbox"
                    checked={preferences.notification10Min}
                    onChange={(e) =>
                      updateNotificationPreferences({ notification10Min: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#163300]"
                  />
                  <div>
                    <span className="text-sm font-bold text-[#0e0f0c] block">
                      10-Minute Kickoff Alert
                    </span>
                    <span className="text-xs text-[#6a6c6a] block">
                      Receive a notification 10 minutes prior to kickoff
                    </span>
                  </div>
                </label>

                <label className="flex items-center space-x-3 p-3.5 bg-[#e8ebe6] rounded-[10px] cursor-pointer hover:bg-[#e2f6d5] transition-colors">
                  <input
                    type="checkbox"
                    checked={preferences.notificationKickoff}
                    onChange={(e) =>
                      updateNotificationPreferences({ notificationKickoff: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#163300]"
                  />
                  <div>
                    <span className="text-sm font-bold text-[#0e0f0c] block">
                      Match Kickoff Alert
                    </span>
                    <span className="text-xs text-[#6a6c6a] block">
                      Receive an instant alert at exact kickoff whistle
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#e8ebe6] border-t border-black/5 flex justify-end">
          <button
            onClick={onClose}
            className="wise-pill-btn-dark px-6 py-2.5 text-xs font-bold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
