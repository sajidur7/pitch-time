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
    setTestStatus('Dispatching test alert...');
    const res = await sendTestNotification(
      'pitch time • Kickoff Alert',
      `Match starts in 10 minutes! Local time: ${preferences.timezone}`
    );
    setTestStatus(res.message);
    setTimeout(() => setTestStatus(null), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white w-full max-w-xl max-h-[90vh] rounded-[28px] flex flex-col shadow-2xl overflow-hidden border border-[#ebebeb]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Shop Modal Header */}
        <div className="p-6 border-b border-[#ebebeb] flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-[#5433eb] uppercase tracking-wider">
              Preferences
            </span>
            <h2 className="text-xl font-medium text-black tracking-tight">
              Tracker Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f2f4f5] hover:bg-[#ebebeb] flex items-center justify-center text-[#787574] hover:text-black transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shop Segmented Tab Switcher */}
        <div className="p-4 bg-[#f2f4f5] border-b border-[#ebebeb]">
          <div className="inline-flex w-full bg-white p-1 rounded-full space-x-1 border border-[#ebebeb]">
            <button
              onClick={() => setActiveTab('teams')}
              className={`flex-1 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeTab === 'teams'
                  ? 'bg-[#5433eb] text-white shadow-[0_2px_10px_rgba(69,36,219,0.3)]'
                  : 'text-[#787574] hover:text-black'
              }`}
            >
              Clubs ({preferences.favoriteTeamIds?.length || 0}/5)
            </button>
            <button
              onClick={() => setActiveTab('timezone')}
              className={`flex-1 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeTab === 'timezone'
                  ? 'bg-[#5433eb] text-white shadow-[0_2px_10px_rgba(69,36,219,0.3)]'
                  : 'text-[#787574] hover:text-black'
              }`}
            >
              Timezone
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex-1 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeTab === 'notifications'
                  ? 'bg-[#5433eb] text-white shadow-[0_2px_10px_rgba(69,36,219,0.3)]'
                  : 'text-[#787574] hover:text-black'
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
                  <h3 className="text-xs font-medium text-[#787574]">
                    Your Tracked Clubs
                  </h3>
                  <span className="text-xs font-medium text-[#5433eb]">
                    {preferences.favoriteTeamIds?.length || 0} of 5 selected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentTeams.map((team) => (
                    <div
                      key={team.id}
                      className="p-3 bg-[#f2f4f5] rounded-2xl flex items-center justify-between border border-[#ebebeb]/60"
                    >
                      <div className="flex items-center space-x-2 min-w-0">
                        <span className="px-2 py-0.5 rounded-full bg-white text-black text-xs font-semibold border border-[#ebebeb] shrink-0">
                          {team.code}
                        </span>
                        <span className="text-xs font-medium text-black truncate">
                          {team.name}
                        </span>
                      </div>
                      <button
                        onClick={() => toggleFavoriteTeam(team.id)}
                        className="text-[#787574] hover:text-red-500 p-1 rounded-full"
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
                <div className="space-y-3 pt-4 border-t border-[#ebebeb]">
                  <label className="block text-xs font-medium text-[#787574]">
                    Add a club to tracker
                  </label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3.5 top-3 text-[#787574]" />
                    <input
                      type="text"
                      value={teamSearch}
                      onChange={(e) => setTeamSearch(e.target.value)}
                      placeholder="Search club name (e.g. Arsenal, Real Madrid, Bayern)..."
                      className="w-full pl-9 pr-4 py-2 bg-[#f2f4f5] border border-[#ebebeb] rounded-full text-xs font-medium focus:outline-none focus:border-[#5433eb] focus:bg-white transition-all"
                    />
                  </div>

                  <div className="max-h-44 overflow-y-auto border border-[#ebebeb] rounded-2xl divide-y divide-[#ebebeb] bg-white">
                    {filteredAvailableTeams.map((team) => (
                      <div
                        key={team.id}
                        className="px-3.5 py-2.5 text-xs flex items-center justify-between hover:bg-[#f2f4f5]"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-black">{team.code}</span>
                          <span className="font-medium text-black">{team.name}</span>
                          <span className="text-[11px] text-[#787574]">({team.leagueName})</span>
                        </div>
                        <button
                          onClick={() => toggleFavoriteTeam(team.id)}
                          className="px-3 py-1 bg-[#5433eb] text-white rounded-full text-[11px] font-medium hover:brightness-105"
                        >
                          Add +
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-[#f2f4f5] rounded-2xl text-xs font-medium text-[#787574] text-center border border-[#ebebeb]">
                  Maximum of 5 clubs tracked. Remove a club above to add another.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TIMEZONE */}
          {activeTab === 'timezone' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#f2f4f5] rounded-2xl space-y-1 border border-[#ebebeb]">
                <span className="text-[11px] font-medium uppercase text-[#5433eb]">
                  Active Timezone
                </span>
                <div className="text-lg font-semibold text-black">
                  {preferences.timezone}
                </div>
                <div className="text-xs text-[#787574]">
                  Current Time: {getCurrentTimeInZone(preferences.timezone)}
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-medium text-[#787574]">
                  Switch Timezone
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3.5 top-3 text-[#787574]" />
                  <input
                    type="text"
                    value={tzSearch}
                    onChange={(e) => setTzSearch(e.target.value)}
                    placeholder="Search timezone (e.g. London, Madrid, New York, Tokyo)..."
                    className="w-full pl-9 pr-4 py-2 bg-[#f2f4f5] border border-[#ebebeb] rounded-full text-xs font-medium focus:outline-none focus:border-[#5433eb] focus:bg-white transition-all"
                  />
                </div>

                <div className="max-h-56 overflow-y-auto border border-[#ebebeb] rounded-2xl divide-y divide-[#ebebeb] bg-white">
                  {filteredTimezones.map((tz) => {
                    const isSelected = preferences.timezone === tz.value;
                    return (
                      <button
                        key={tz.value}
                        type="button"
                        onClick={() => updateTimezone(tz.value)}
                        className={`w-full px-4 py-2.5 text-left text-xs flex items-center justify-between transition-colors ${
                          isSelected ? 'bg-[#5433eb] text-white font-medium' : 'hover:bg-[#f2f4f5] text-black'
                        }`}
                      >
                        <span>{tz.label}</span>
                        <span className={`text-[11px] ${isSelected ? 'text-white/80' : 'text-[#787574]'}`}>
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
              <div className="p-4 bg-[#f2f4f5] rounded-2xl space-y-3 border border-[#ebebeb]">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-medium text-[#787574] block">
                      Browser Push Service
                    </span>
                    <span className="text-sm font-semibold text-black">
                      Permission: {getNotificationPermission()}
                    </span>
                  </div>
                  <button
                    onClick={async () => {
                      await requestNotificationPermission();
                    }}
                    className="px-3.5 py-1.5 bg-white text-black border border-[#ebebeb] rounded-full text-xs font-medium hover:bg-neutral-50"
                  >
                    Request Permission
                  </button>
                </div>

                <div className="pt-2 border-t border-[#ebebeb]">
                  <button
                    id="test-notification-btn"
                    onClick={handleSendTestPush}
                    className="w-full shop-violet-btn py-2.5 text-xs font-medium flex items-center justify-center space-x-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Instant Test Push Notification</span>
                  </button>

                  {testStatus && (
                    <div className="mt-2 p-2 bg-white rounded-xl text-xs font-medium text-black text-center border border-[#ebebeb]">
                      {testStatus}
                    </div>
                  )}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-3.5 bg-[#f2f4f5] rounded-2xl cursor-pointer hover:bg-white border border-[#ebebeb] transition-colors">
                  <input
                    type="checkbox"
                    checked={preferences.notification10Min}
                    onChange={(e) =>
                      updateNotificationPreferences({ notification10Min: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#5433eb]"
                  />
                  <div>
                    <span className="text-sm font-medium text-black block">
                      10-Minute Kickoff Alert
                    </span>
                    <span className="text-xs text-[#787574] block">
                      Sends notification 10 minutes prior to match start
                    </span>
                  </div>
                </label>

                <label className="flex items-center space-x-3 p-3.5 bg-[#f2f4f5] rounded-2xl cursor-pointer hover:bg-white border border-[#ebebeb] transition-colors">
                  <input
                    type="checkbox"
                    checked={preferences.notificationKickoff}
                    onChange={(e) =>
                      updateNotificationPreferences({ notificationKickoff: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#5433eb]"
                  />
                  <div>
                    <span className="text-sm font-medium text-black block">
                      Kickoff Whistle Alert
                    </span>
                    <span className="text-xs text-[#787574] block">
                      Sends notification when match officially kicks off
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#f2f4f5] border-t border-[#ebebeb] flex justify-end">
          <button
            onClick={onClose}
            className="shop-violet-btn px-6 py-2 text-xs font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
