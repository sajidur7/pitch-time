'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { TEAMS } from '@/lib/teams-data';
import { LeagueId, Team } from '@/lib/types';
import { COMMON_TIMEZONES, getCurrentTimeInZone } from '@/lib/timezone';
import { requestNotificationPermission, getNotificationPermission, PermissionState } from '@/lib/push-notifications';
import { Check, Search, Bell, Clock, Shield, ArrowRight, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';

export function OnboardingWizard() {
  const { user, completeOnboarding } = useUser();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Timezone
  const [selectedTz, setSelectedTz] = useState(user?.timezone || 'Europe/London');
  const [tzSearch, setTzSearch] = useState('');
  const [tzCurrentTime, setTzCurrentTime] = useState('');

  // Step 2: Teams (Max 5, Min 1)
  const [selectedTeams, setSelectedTeams] = useState<string[]>(
    user?.favoriteTeamIds && user.favoriteTeamIds.length > 0 ? user.favoriteTeamIds : ['arsenal']
  );
  const [leagueFilter, setLeagueFilter] = useState<LeagueId | 'all'>('all');
  const [teamSearch, setTeamSearch] = useState('');

  // Step 3: Notifications
  const [permStatus, setPermStatus] = useState<PermissionState>('default');
  const [alert10Min, setAlert10Min] = useState(true);
  const [alertKickoff, setAlertKickoff] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update time for step 1
  useEffect(() => {
    const update = () => {
      setTzCurrentTime(getCurrentTimeInZone(selectedTz));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [selectedTz]);

  // Check notification permission on step 3
  useEffect(() => {
    if (step === 3) {
      setPermStatus(getNotificationPermission());
    }
  }, [step]);

  // Handle Team Selection
  const handleToggleTeam = (teamId: string) => {
    if (selectedTeams.includes(teamId)) {
      setSelectedTeams(selectedTeams.filter((id) => id !== teamId));
    } else {
      if (selectedTeams.length < 5) {
        setSelectedTeams([...selectedTeams, teamId]);
      }
    }
  };

  // Step 3: Request Permission
  const handleRequestPermission = async () => {
    const res = await requestNotificationPermission();
    setPermStatus(res);
  };

  // Finish Onboarding
  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#000000', '#555555', '#888888', '#CCCCCC'],
        });
      } catch {}

      completeOnboarding({
        timezone: selectedTz,
        favoriteTeamIds: selectedTeams,
        notification10Min: alert10Min,
        notificationKickoff: alertKickoff,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTimezones = COMMON_TIMEZONES.filter(
    (tz) =>
      tz.label.toLowerCase().includes(tzSearch.toLowerCase()) ||
      tz.value.toLowerCase().includes(tzSearch.toLowerCase()) ||
      tz.city.toLowerCase().includes(tzSearch.toLowerCase())
  );

  const filteredTeams = TEAMS.filter((team) => {
    const matchesLeague = leagueFilter === 'all' || team.leagueId === leagueFilter;
    const matchesSearch =
      team.name.toLowerCase().includes(teamSearch.toLowerCase()) ||
      team.code.toLowerCase().includes(teamSearch.toLowerCase());
    return matchesLeague && matchesSearch;
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Wizard Header */}
      <div className="mb-8 hairline-b pb-6">
        <div className="flex items-center justify-between font-mono text-xs text-neutral-500 uppercase">
          <div className="flex items-center space-x-2">
            <span className="status-dot" />
            <span>ACCOUNT SETUP INITIALIZATION</span>
          </div>
          <div>STEP 0{step} OF 03</div>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className={`h-1 ${step >= 1 ? 'bg-black' : 'bg-neutral-200'}`} />
          <div className={`h-1 ${step >= 2 ? 'bg-black' : 'bg-neutral-200'}`} />
          <div className={`h-1 ${step >= 3 ? 'bg-black' : 'bg-neutral-200'}`} />
        </div>

        <h2 className="text-2xl sm:text-3xl font-light tracking-[-0.03em] uppercase mt-6 text-black">
          {step === 1 && '01. Configure Local Timezone'}
          {step === 2 && '02. Select Supported Clubs (Max 5)'}
          {step === 3 && '03. Kickoff Notification Alerts'}
        </h2>
        <p className="text-sm text-neutral-600 font-light mt-1">
          {step === 1 &&
            'Match kickoffs will be calculated with precision according to your target geographical zone.'}
          {step === 2 &&
            'Choose between 1 and 5 clubs across Premier League, La Liga, and Champions League to track.'}
          {step === 3 &&
            'Never miss kickoff. Configure browser push alerts 10 minutes prior to kickoff and at match start.'}
        </p>
      </div>

      {/* STEP 1: TIME ZONE */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="bg-neutral-50 p-4 sm:p-6 hairline-all">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-mono text-neutral-500 block">
                  Current Selected Timezone
                </span>
                <span className="text-xl font-mono text-black font-medium">{selectedTz}</span>
              </div>
              <div className="text-right">
                <span className="text-xs uppercase font-mono text-neutral-500 block">
                  Local Clock
                </span>
                <span className="text-sm font-mono text-black">{tzCurrentTime || 'Synchronizing...'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-xs uppercase font-mono text-neutral-600">
              Search or Switch Timezone
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
              <input
                type="text"
                value={tzSearch}
                onChange={(e) => setTzSearch(e.target.value)}
                placeholder="Search by city or country (e.g. London, Madrid, New York, Tokyo)..."
                className="w-full pl-9 pr-4 py-2.5 bg-white hairline-all text-sm font-mono focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div className="max-h-64 overflow-y-auto hairline-all divide-y divide-black/10 bg-white">
              {filteredTimezones.map((tz) => {
                const isSelected = selectedTz === tz.value;
                return (
                  <button
                    key={tz.value}
                    type="button"
                    onClick={() => setSelectedTz(tz.value)}
                    className={`w-full px-4 py-3 text-left font-mono text-xs flex items-center justify-between transition-colors ${
                      isSelected ? 'bg-black text-white' : 'hover:bg-neutral-100 text-black'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-neutral-500'}`} />
                      <span>{tz.label}</span>
                    </div>
                    <span className={`text-[11px] ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                      {tz.offset}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-6 hairline-t flex justify-end">
            <button
              id="onboarding-step1-next"
              onClick={() => setStep(2)}
              className="group flex items-center space-x-2 px-6 py-3 bg-black text-white text-xs font-mono uppercase tracking-wider hover:bg-neutral-900 transition-colors"
            >
              <span>Next: Team Selection</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: TEAM SELECTION */}
      {step === 2 && (
        <div className="space-y-6">
          {/* League Filter & Counter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'All Leagues' },
                { id: 'premier-league', label: 'Premier League' },
                { id: 'la-liga', label: 'La Liga' },
                { id: 'champions-league', label: 'Champions League' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setLeagueFilter(tab.id as any)}
                  className={`px-3 py-1.5 text-xs font-mono uppercase transition-colors hairline-all ${
                    leagueFilter === tab.id
                      ? 'bg-black text-white'
                      : 'bg-white text-black hover:bg-neutral-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Counter badge */}
            <div className="font-mono text-xs">
              <span className="text-neutral-500">Selected: </span>
              <span
                id="selected-teams-counter"
                className={`px-2 py-0.5 hairline-all font-semibold ${
                  selectedTeams.length === 5 ? 'bg-black text-white' : 'bg-neutral-100 text-black'
                }`}
              >
                {selectedTeams.length} / 5
              </span>
            </div>
          </div>

          {/* Search teams input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
            <input
              type="text"
              value={teamSearch}
              onChange={(e) => setTeamSearch(e.target.value)}
              placeholder="Search club name or code (e.g. Arsenal, Real Madrid, Bayern)..."
              className="w-full pl-9 pr-4 py-2.5 bg-white hairline-all text-sm font-mono focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          {/* Grid of Teams */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[380px] overflow-y-auto p-1">
            {filteredTeams.map((team) => {
              const isSelected = selectedTeams.includes(team.id);
              const isDisabled = !isSelected && selectedTeams.length >= 5;

              return (
                <div
                  key={team.id}
                  onClick={() => !isDisabled && handleToggleTeam(team.id)}
                  className={`p-3.5 hairline-all cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-black text-white'
                      : isDisabled
                      ? 'opacity-40 cursor-not-allowed bg-neutral-100'
                      : 'bg-white hover:bg-neutral-50 text-black'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-white border border-black/20 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={team.crest}
                        alt={team.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          // Fallback to monogram
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <span className="text-[10px] font-mono font-bold text-black uppercase">
                        {team.code}
                      </span>
                    </div>

                    <div className="truncate">
                      <div className="text-sm font-medium leading-tight truncate">{team.name}</div>
                      <div className={`text-[10px] font-mono uppercase ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                        {team.leagueName}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 pl-2">
                    <div
                      className={`w-5 h-5 hairline-all flex items-center justify-center ${
                        isSelected ? 'bg-white text-black' : 'bg-transparent'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedTeams.length === 0 && (
            <p className="text-xs font-mono text-red-600">
              * Please select at least 1 club to proceed.
            </p>
          )}

          {/* Navigation Controls */}
          <div className="pt-6 hairline-t flex items-center justify-between">
            <button
              onClick={() => setStep(1)}
              className="flex items-center space-x-2 px-4 py-2 text-xs font-mono uppercase text-black hover:bg-neutral-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              id="onboarding-step2-next"
              disabled={selectedTeams.length === 0}
              onClick={() => setStep(3)}
              className={`flex items-center space-x-2 px-6 py-3 text-xs font-mono uppercase tracking-wider transition-colors ${
                selectedTeams.length > 0
                  ? 'bg-black text-white hover:bg-neutral-900'
                  : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
              }`}
            >
              <span>Next: Notifications</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: NOTIFICATIONS */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="bg-neutral-50 p-6 hairline-all space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase text-neutral-500 block">
                  Browser Push Permission
                </span>
                <h3 className="text-lg font-light text-black">
                  Instant Kickoff Browser Alerts
                </h3>
                <p className="text-xs text-neutral-600 max-w-md">
                  We use the Web Push API and background service workers to notify you even when the tab is closed.
                </p>
              </div>

              <span
                className={`px-2.5 py-1 text-xs font-mono uppercase hairline-all ${
                  permStatus === 'granted'
                    ? 'bg-black text-white'
                    : permStatus === 'denied'
                    ? 'bg-red-50 text-red-700 border-red-300'
                    : 'bg-white text-neutral-700'
                }`}
              >
                Status: {permStatus}
              </span>
            </div>

            {permStatus !== 'granted' && (
              <div className="pt-2">
                <button
                  type="button"
                  id="enable-notifications-btn"
                  onClick={handleRequestPermission}
                  className="px-5 py-2.5 bg-black text-white text-xs font-mono uppercase tracking-wider hover:bg-neutral-800 transition-colors flex items-center space-x-2"
                >
                  <Bell className="w-4 h-4" />
                  <span>Request Push Notification Permission</span>
                </button>
              </div>
            )}
          </div>

          {/* Notification Timing Preferences */}
          <div className="space-y-4">
            <label className="block text-xs uppercase font-mono text-neutral-600">
              Notification Preferences
            </label>

            <div className="space-y-3">
              <label className="flex items-center space-x-3 p-4 bg-white hairline-all cursor-pointer hover:bg-neutral-50 transition-colors">
                <input
                  type="checkbox"
                  id="alert-10min-checkbox"
                  checked={alert10Min}
                  onChange={(e) => setAlert10Min(e.target.checked)}
                  className="w-4 h-4 accent-black"
                />
                <div className="space-y-0.5">
                  <span className="text-sm font-medium text-black block">
                    Alert 10 minutes before kickoff
                  </span>
                  <span className="text-xs text-neutral-500 block font-mono">
                    Gives you enough time to tune into the broadcast and check team line-ups.
                  </span>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-4 bg-white hairline-all cursor-pointer hover:bg-neutral-50 transition-colors">
                <input
                  type="checkbox"
                  id="alert-kickoff-checkbox"
                  checked={alertKickoff}
                  onChange={(e) => setAlertKickoff(e.target.checked)}
                  className="w-4 h-4 accent-black"
                />
                <div className="space-y-0.5">
                  <span className="text-sm font-medium text-black block">
                    Alert at exact match start (Kickoff)
                  </span>
                  <span className="text-xs text-neutral-500 block font-mono">
                    Instant whistle notification when the ball is officially in play.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Finish Button */}
          <div className="pt-6 hairline-t flex items-center justify-between">
            <button
              onClick={() => setStep(2)}
              className="flex items-center space-x-2 px-4 py-2 text-xs font-mono uppercase text-black hover:bg-neutral-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              id="finish-setup-btn"
              disabled={isSubmitting}
              onClick={handleFinish}
              className="px-8 py-3 bg-black text-white text-xs font-mono uppercase tracking-wider hover:bg-neutral-900 transition-colors flex items-center space-x-2"
            >
              <span>{isSubmitting ? 'Saving...' : 'Finish Setup & Enter Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
