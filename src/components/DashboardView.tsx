'use client';

import React, { useState, useMemo } from 'react';
import { useUser } from '@/context/UserContext';
import { Match, CompetitionCode } from '@/lib/types';
import { getMockMatches } from '@/lib/matches-data';
import { MatchRow } from './MatchRow';
import { Search, Bell, Plus, Check, Clock, Sparkles } from 'lucide-react';
import { TEAMS } from '@/lib/teams-data';
import { requestNotificationPermission, getNotificationPermission } from '@/lib/push-notifications';

interface DashboardViewProps {
  onOpenSettings: () => void;
}

export function DashboardView({ onOpenSettings }: DashboardViewProps) {
  const { preferences } = useUser();
  const [activeTab, setActiveTab] = useState<'all-matches' | 'my-teams'>('all-matches');
  const [selectedCompetition, setSelectedCompetition] = useState<CompetitionCode | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationEnabled, setNotificationEnabled] = useState(false);

  const allMatches = useMemo(() => getMockMatches(), []);

  // Filter matches
  const filteredMatches = useMemo(() => {
    let list = allMatches;

    if (activeTab === 'my-teams') {
      const favs = preferences.favoriteTeamIds || [];
      list = list.filter(
        (m) => favs.includes(m.homeTeam.id) || favs.includes(m.awayTeam.id)
      );
    }

    if (selectedCompetition !== 'ALL') {
      list = list.filter((m) => m.competition === selectedCompetition);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.homeTeam.name.toLowerCase().includes(q) ||
          m.awayTeam.name.toLowerCase().includes(q) ||
          m.homeTeam.code.toLowerCase().includes(q) ||
          m.awayTeam.code.toLowerCase().includes(q) ||
          m.competitionName.toLowerCase().includes(q) ||
          m.venue.toLowerCase().includes(q)
      );
    }

    return list;
  }, [allMatches, activeTab, selectedCompetition, searchQuery, preferences.favoriteTeamIds]);

  // Tracked clubs
  const favoriteTeams = useMemo(() => {
    const ids = preferences.favoriteTeamIds || [];
    return TEAMS.filter((t) => ids.includes(t.id));
  }, [preferences.favoriteTeamIds]);

  const handleEnableNotifications = async () => {
    const res = await requestNotificationPermission();
    if (res === 'granted') {
      setNotificationEnabled(true);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Wise Massive Display Hero */}
      <div className="space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#e2f6d5] text-[#163300] rounded-full text-xs font-bold tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5 text-[#163300]" />
          <span>Real-time Kickoff Schedule • {preferences.timezone}</span>
        </div>

        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-display-wise text-[#163300] uppercase tracking-[-0.04em] leading-[0.9]">
          NEVER MISS <br />
          <span className="text-[#0e0f0c]">KICKOFF.</span>
        </h1>

        <p className="text-base sm:text-xl text-[#454745] max-w-2xl font-medium leading-normal">
          Real fixtures from the UEFA Champions League, Premier League, and La Liga.
          Auto-converted to your local timezone with instant 10-minute browser alerts.
        </p>
      </div>

      {/* Wise Quick Push Notification Banner (Dark Section Card) */}
      <div className="wise-card-dark p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-md">
        <div className="space-y-1.5 max-w-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-[#9fe870]">
            Web Push Alerts
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
            Get pinged 10 minutes before kickoff
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300">
            Receive desktop and mobile notifications when lineups are confirmed and right at kickoff whistle.
          </p>
        </div>

        <button
          onClick={handleEnableNotifications}
          className="wise-pill-btn-primary px-6 py-3 text-sm flex items-center space-x-2 shrink-0 cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          <span>
            {notificationEnabled || getNotificationPermission() === 'granted'
              ? 'Notifications Active'
              : 'Enable Kickoff Alerts'}
          </span>
        </button>
      </div>

      {/* Tracked Clubs Quick Filter Strip */}
      <div className="flex flex-wrap items-center gap-2 pt-2">
        <span className="text-xs font-bold uppercase text-[#868685] tracking-wider mr-1">
          Tracking Clubs:
        </span>
        {favoriteTeams.map((team) => (
          <span
            key={team.id}
            className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#e8ebe6] text-[#163300] text-xs font-bold"
          >
            <span className="w-2 h-2 rounded-full bg-[#163300]" />
            <span>{team.name}</span>
          </span>
        ))}
        <button
          onClick={onOpenSettings}
          className="inline-flex items-center space-x-1 px-3 py-1 rounded-full border border-[#163300] text-[#163300] hover:bg-[#e2f6d5] text-xs font-bold transition-colors"
        >
          <Plus className="w-3 h-3" />
          <span>Edit Clubs ({favoriteTeams.length}/5)</span>
        </button>
      </div>

      {/* Primary Segmented Tab Control (Wise Pill Tabs) & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2">
        {/* Segmented Tab Control */}
        <div className="inline-flex bg-[#e8ebe6] p-1.5 rounded-full space-x-1 self-start">
          <button
            onClick={() => setActiveTab('all-matches')}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
              activeTab === 'all-matches'
                ? 'bg-[#9fe870] text-[#163300] shadow-xs'
                : 'text-[#454745] hover:text-[#163300]'
            }`}
          >
            All Matches ({allMatches.length})
          </button>
          <button
            onClick={() => setActiveTab('my-teams')}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
              activeTab === 'my-teams'
                ? 'bg-[#9fe870] text-[#163300] shadow-xs'
                : 'text-[#454745] hover:text-[#163300]'
            }`}
          >
            My Clubs ({favoriteTeams.length})
          </button>
        </div>

        {/* Competition Filters & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Competition Filter Pills */}
          <div className="inline-flex bg-[#e8ebe6] p-1 rounded-full space-x-1 overflow-x-auto">
            {(['ALL', 'UCL', 'EPL', 'La Liga'] as const).map((comp) => (
              <button
                key={comp}
                onClick={() => setSelectedCompetition(comp)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                  selectedCompetition === comp
                    ? 'bg-[#163300] text-[#9fe870]'
                    : 'text-[#454745] hover:text-[#163300]'
                }`}
              >
                {comp === 'ALL' ? 'All Competitions' : comp}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[200px] sm:w-60">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#868685]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search club or tournament..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#868685]/40 rounded-[10px] text-xs font-medium focus:outline-none focus:border-[#163300] text-[#0e0f0c]"
            />
          </div>
        </div>
      </div>

      {/* Match Cards List */}
      <div className="space-y-3">
        {filteredMatches.length > 0 ? (
          filteredMatches.map((match) => (
            <MatchRow key={match.id} match={match} />
          ))
        ) : (
          <div className="bg-[#e8ebe6] rounded-[10px] p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#163300] text-[#9fe870] flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-[#0e0f0c]">No Matches Found</h3>
              <p className="text-xs text-[#6a6c6a] max-w-sm mx-auto">
                {activeTab === 'my-teams'
                  ? 'None of your tracked clubs have fixtures matching this filter. Switch to All Matches or add more clubs in preferences.'
                  : 'No matches matched your search query.'}
              </p>
            </div>
            {activeTab === 'my-teams' && (
              <button
                onClick={() => setActiveTab('all-matches')}
                className="wise-pill-btn-primary px-5 py-2 text-xs font-bold"
              >
                Show All Matches
              </button>
            )}
          </div>
        )}
      </div>

      {/* Wise Clean Footer */}
      <div className="border-t border-[#e8ebe6] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#868685] font-medium">
        <div>
          PITCH TIME • REAL CLUB FOOTBALL MATCH TRACKER
        </div>
        <div className="flex items-center space-x-2">
          <span>TIMEZONE SYNCHRONIZED:</span>
          <strong className="text-[#163300]">{preferences.timezone}</strong>
        </div>
      </div>
    </div>
  );
}
