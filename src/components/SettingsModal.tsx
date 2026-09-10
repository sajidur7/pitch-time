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
    setTestStatus('Dispatching test notification...');
    const res = await sendTestNotification(
      'pitch time. Kickoff Alert',
      `Match starts in 10 minutes! Local time: ${preferences.timezone}`
    );
    setTestStatus(res.message);
    setTimeout(() => setTestStatus(null), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-[#e7e5e4] w-full max-w-xl max-h-[90vh] rounded-[9px] flex flex-col shadow-2xl overflow-hidden border border-black"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#dfdcd5] bg-[#dfdcd5]/30 flex items-center justify-between">
          <div className="space-y-1">
            <PitchTimeLogo size="sm" />
            <h2 className="text-xl font-normal font-serif-davinci text-black tracking-tight">
              Tracker Preferences & Folio
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-black flex items-center justify-center text-black hover:bg-black hover:text-white transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Segmented Tab Switcher */}
        <div className="p-4 border-b border-[#dfdcd5] bg-[#e7e5e4]">
          <div className="inline-flex w-full bg-[#dfdcd5]/40 p-1 rounded-[9px] space-x-1 border border-[#dfdcd5]">
            <button
              onClick={() => setActiveTab('teams')}
              className={`flex-1 py-1.5 rounded-[6px] text-xs font-mono uppercase transition-colors ${
                activeTab === 'teams'
                  ? 'bg-black text-white font-medium'
                  : 'text-[#595855] hover:text-black'
              }`}
            >
              Clubs ({preferences.favoriteTeamIds?.length || 0}/5)
            </button>
            <button
              onClick={() => setActiveTab('timezone')}
              className={`flex-1 py-1.5 rounded-[6px] text-xs font-mono uppercase transition-colors ${
                activeTab === 'timezone'
                  ? 'bg-black text-white font-medium'
                  : 'text-[#595855] hover:text-black'
              }`}
            >
              Timezone
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex-1 py-1.5 rounded-[6px] text-xs font-mono uppercase transition-colors ${
                activeTab === 'notifications'
                  ? 'bg-black text-white font-medium'
                  : 'text-[#595855] hover:text-black'
              }`}
            >
              Alerts
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: FAVORITE CLUBS */}
          {activeTab === 'teams' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3 font-mono text-xs">
                  <span className="text-[#595855] uppercase">
                    CURRENTLY TRACKED CLUBS
                  </span>
                  <span className="font-semibold text-black">
                    {preferences.favoriteTeamIds?.length || 0} OF 5 SELECTED
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentTeams.map((team) => (
                    <div
                      key={team.id}
                      className="p-3 bg-white rounded-[9px] border border-[#dfdcd5] flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2 min-w-0">
                        <span className="px-2 py-0.5 rounded-[2px] bg-[#e7e5e4] text-black text-[10px] font-mono font-bold shrink-0">
                          {team.code}
                        </span>
                        <span className="text-xs font-medium text-black truncate">
                          {team.name}
                        </span>
                      </div>
                      <button
                        onClick={() => toggleFavoriteTeam(team.id)}
                        className="text-[#595855] hover:text-black p-1"
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
                <div className="space-y-3 pt-4 border-t border-[#dfdcd5]">
                  <label className="block text-xs font-mono uppercase text-[#595855]">
                    Add Club to Tracker
                  </label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3.5 top-3 text-[#595855]" />
                    <input
                      type="text"
                      value={teamSearch}
                      onChange={(e) => setTeamSearch(e.target.value)}
                      placeholder="Search club name (e.g. Arsenal, Real Madrid, Bayern)..."
                      className="w-full pl-9 pr-4 py-2 bg-white border border-[#dfdcd5] rounded-[9px] text-xs font-mono focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="max-h-44 overflow-y-auto border border-[#dfdcd5] rounded-[9px] divide-y divide-[#dfdcd5] bg-white">
                    {filteredAvailableTeams.map((team) => (
                      <div
                        key={team.id}
                        className="px-3.5 py-2.5 text-xs font-mono flex items-center justify-between hover:bg-[#e7e5e4]"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-black">{team.code}</span>
                          <span className="text-black">{team.name}</span>
                          <span className="text-[10px] text-[#595855]">({team.leagueName})</span>
                        </div>
                        <button
                          onClick={() => toggleFavoriteTeam(team.id)}
                          className="px-2.5 py-1 bg-black text-white text-[10px] font-mono uppercase rounded-[2px]"
                        >
                          ADD +
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-white rounded-[9px] border border-[#dfdcd5] text-xs font-mono text-[#595855] text-center">
                  Maximum of 5 clubs tracked. Remove a club above to add another.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TIMEZONE */}
          {activeTab === 'timezone' && (
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-[9px] border border-[#dfdcd5] space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#595855]">
                  ACTIVE TIMEZONE
                </span>
                <div className="text-lg font-mono font-bold text-black">
                  {preferences.timezone}
                </div>
                <div className="text-xs font-mono text-[#595855]">
                  CURRENT LOCAL TIME: {getCurrentTimeInZone(preferences.timezone)}
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-mono uppercase text-[#595855]">
                  SWITCH TIMEZONE
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3.5 top-3 text-[#595855]" />
                  <input
                    type="text"
                    value={tzSearch}
                    onChange={(e) => setTzSearch(e.target.value)}
                    placeholder="Search timezone (e.g. London, Madrid, New York, Tokyo)..."
                    className="w-full pl-9 pr-4 py-2 bg-white border border-[#dfdcd5] rounded-[9px] text-xs font-mono focus:outline-none focus:border-black"
                  />
                </div>

                <div className="max-h-56 overflow-y-auto border border-[#dfdcd5] rounded-[9px] divide-y divide-[#dfdcd5] bg-white">
                  {filteredTimezones.map((tz) => {
                    const isSelected = preferences.timezone === tz.value;
                    return (
                      <button
                        key={tz.value}
                        type="button"
                        onClick={() => updateTimezone(tz.value)}
                        className={`w-full px-4 py-2.5 text-left text-xs font-mono flex items-center justify-between transition-colors ${
                          isSelected ? 'bg-black text-white font-semibold' : 'hover:bg-[#e7e5e4] text-black'
                        }`}
                      >
                        <span>{tz.label}</span>
                        <span className={`text-[11px] ${isSelected ? 'text-white' : 'text-[#595855]'}`}>
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
              <div className="p-4 bg-white rounded-[9px] border border-[#dfdcd5] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono uppercase text-[#595855] block">
                      PUSH SERVICE
                    </span>
                    <span className="text-sm font-mono font-semibold text-black">
                      STATUS: {getNotificationPermission().toUpperCase()}
                    </span>
                  </div>
                  <button
                    onClick={async () => {
                      await requestNotificationPermission();
                    }}
                    className="px-3 py-1 bg-[#e7e5e4] text-black border border-black rounded-[28.8px] text-xs font-mono uppercase hover:bg-black hover:text-white"
                  >
                    REQUEST PERMISSION
                  </button>
                </div>

                <div className="pt-2 border-t border-[#dfdcd5]">
                  <button
                    id="test-notification-btn"
                    onClick={handleSendTestPush}
                    className="w-full structured-pill-btn py-2 text-xs flex items-center justify-center space-x-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>SEND INSTANT TEST PUSH NOTIFICATION</span>
                  </button>

                  {testStatus && (
                    <div className="mt-2 p-2 bg-[#e7e5e4] rounded-[9px] text-xs font-mono text-black text-center border border-[#dfdcd5]">
                      {testStatus}
                    </div>
                  )}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-3.5 bg-white rounded-[9px] cursor-pointer hover:bg-[#eae8e7] border border-[#dfdcd5] transition-colors">
                  <input
                    type="checkbox"
                    checked={preferences.notification10Min}
                    onChange={(e) =>
                      updateNotificationPreferences({ notification10Min: e.target.checked })
                    }
                    className="w-4 h-4 accent-black"
                  />
                  <div>
                    <span className="text-sm font-mono font-medium text-black block">
                      10-MINUTE KICKOFF ALERT
                    </span>
                    <span className="text-xs font-mono text-[#595855] block">
                      Sends notification 10 minutes prior to match start
                    </span>
                  </div>
                </label>

                <label className="flex items-center space-x-3 p-3.5 bg-white rounded-[9px] cursor-pointer hover:bg-[#eae8e7] border border-[#dfdcd5] transition-colors">
                  <input
                    type="checkbox"
                    checked={preferences.notificationKickoff}
                    onChange={(e) =>
                      updateNotificationPreferences({ notificationKickoff: e.target.checked })
                    }
                    className="w-4 h-4 accent-black"
                  />
                  <div>
                    <span className="text-sm font-mono font-medium text-black block">
                      KICKOFF WHISTLE ALERT
                    </span>
                    <span className="text-xs font-mono text-[#595855] block">
                      Sends notification at match start
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#dfdcd5] bg-[#dfdcd5]/30 flex justify-end">
          <button
            onClick={onClose}
            className="structured-pill-btn px-6 py-2 text-xs"
          >
            CONFIRM & CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
