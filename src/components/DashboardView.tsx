'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useUser } from '@/context/UserContext';
import { Match, CompetitionCode } from '@/lib/types';
import { getMockMatches } from '@/lib/matches-data';
import { MatchRow } from './MatchRow';
import { Search, Bell, Plus, Clock } from 'lucide-react';
import { TEAMS } from '@/lib/teams-data';
import { requestNotificationPermission, getNotificationPermission } from '@/lib/push-notifications';
import { PitchTimeLogo } from './PitchTimeLogo';

interface DashboardViewProps {
  onOpenSettings: () => void;
}

export function DashboardView({ onOpenSettings }: DashboardViewProps) {
  const { preferences } = useUser();
  const [activeTab, setActiveTab] = useState<'all-matches' | 'my-teams'>('all-matches');
  const [selectedCompetition, setSelectedCompetition] = useState<CompetitionCode | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationEnabled, setNotificationEnabled] = useState(false);

  // Live match state from official API
  const [allMatches, setAllMatches] = useState<Match[]>(() => getMockMatches());
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);

  // Fetch real matches live from /api/matches (ESPN Scoreboard for UCL, EPL, and La Liga)
  useEffect(() => {
    let isMounted = true;

    async function loadLiveMatches() {
      try {
        const res = await fetch('/api/matches');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.matches && data.matches.length > 0) {
            setAllMatches(data.matches);
          }
        }
      } catch (err) {
        console.warn('Could not load live match feed:', err);
      } finally {
        if (isMounted) setIsLoadingMatches(false);
      }
    }

    loadLiveMatches();

    // Revalidate every 2 minutes
    const interval = setInterval(loadLiveMatches, 120000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Filter matches
  const filteredMatches = useMemo(() => {
    let list = allMatches;

    if (activeTab === 'my-teams') {
      const favs = (preferences.favoriteTeamIds || []).map((id) => id.toLowerCase());
      list = list.filter((m) => {
        const homeCode = m.homeTeam.code?.toLowerCase() || '';
        const homeId = m.homeTeam.id?.toLowerCase() || '';
        const homeName = m.homeTeam.name?.toLowerCase() || '';
        const awayCode = m.awayTeam.code?.toLowerCase() || '';
        const awayId = m.awayTeam.id?.toLowerCase() || '';
        const awayName = m.awayTeam.name?.toLowerCase() || '';

        return favs.some((fav) =>
          homeCode === fav ||
          homeId.includes(fav) ||
          homeName.includes(fav) ||
          fav.includes(homeCode) ||
          awayCode === fav ||
          awayId.includes(fav) ||
          awayName.includes(fav) ||
          fav.includes(awayCode)
        );
      });
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
    <div className="max-w-[1240px] mx-auto px-4 sm:px-8 py-10 sm:py-16 space-y-10">
      {/* Notion Hero: Centered Stack with Match Notebook Pill */}
      <div className="space-y-6 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-normal text-black/70 bg-black/5">
          <span>⚽</span>
          <span>match notebook</span>
        </div>

        {/* Headline */}
        <div className="space-y-3">
          <PitchTimeLogo size="hero" />
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-[-0.035em] text-black leading-tight">
            Never miss a kickoff again.
          </h1>
        </div>


        {/* Notion Two-Button CTA Row */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={handleEnableNotifications}
            className="notion-btn-primary flex items-center space-x-2 text-sm py-2 px-4 shadow-none"
          >
            <Bell className="w-4 h-4" />
            <span>
              {notificationEnabled || getNotificationPermission() === 'granted'
                ? 'Kickoff Alerts Active'
                : 'Turn on 10-Min Alerts'}
            </span>
          </button>

          <button
            onClick={onOpenSettings}
            className="notion-btn-ghost text-sm py-2 px-4"
          >
            Adjust Preferences
          </button>
        </div>
      </div>

      {/* Tracked Clubs Notion Banner */}
      <div className="notion-card p-4 flex flex-wrap items-center justify-between gap-4 bg-white">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-black/60 mr-1">
            Tracked clubs:
          </span>
          {favoriteTeams.map((team) => (
            <span
              key={team.id}
              className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/5 text-black text-xs font-medium"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#0075de]" />
              <span>{team.name}</span>
            </span>
          ))}
        </div>

        <button
          onClick={onOpenSettings}
          className="notion-btn-outline text-xs inline-flex items-center space-x-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Edit Clubs ({favoriteTeams.length}/5)</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Primary View Tabs */}
        <div className="inline-flex bg-black/5 p-1 rounded-[8px] space-x-1 self-start">
          <button
            onClick={() => setActiveTab('all-matches')}
            className={`px-3.5 py-1.5 rounded-[6px] text-xs font-medium transition-colors ${
              activeTab === 'all-matches'
                ? 'bg-white text-black shadow-xs'
                : 'text-black/60 hover:text-black'
            }`}
          >
            All Matches ({allMatches.length})
          </button>
          <button
            onClick={() => setActiveTab('my-teams')}
            className={`px-3.5 py-1.5 rounded-[6px] text-xs font-medium transition-colors ${
              activeTab === 'my-teams'
                ? 'bg-white text-black shadow-xs'
                : 'text-black/60 hover:text-black'
            }`}
          >
            My Clubs ({favoriteTeams.length})
          </button>
        </div>

        {/* Competition Filters & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Competition Pills */}
          <div className="inline-flex bg-black/5 p-1 rounded-full space-x-1 overflow-x-auto">
            {(['ALL', 'UCL', 'EPL', 'La Liga'] as const).map((comp) => (
              <button
                key={comp}
                onClick={() => setSelectedCompetition(comp)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
                  selectedCompetition === comp
                    ? 'bg-white text-black shadow-xs'
                    : 'text-black/60 hover:text-black'
                }`}
              >
                {comp === 'ALL' ? 'All Competitions' : comp}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[200px] sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-black/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search fixtures..."
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-black/10 rounded-[8px] text-xs text-black placeholder-black/40 focus:outline-none focus:border-[#0075de]"
            />
          </div>
        </div>
      </div>

      {/* Real Live Match Feed Counter & Timezone */}
      <div className="flex items-center justify-between text-xs text-black/50 px-1 font-medium">
        <span>
          Showing {filteredMatches.length} official matches across 3 leagues
          {isLoadingMatches ? ' (updating live data...)' : ''}
        </span>
        <span>Local Timezone: {preferences.timezone}</span>
      </div>

      {/* Match Cards List */}
      <div className="space-y-2.5">
        {filteredMatches.length > 0 ? (
          filteredMatches.map((match) => (
            <MatchRow key={match.id} match={match} />
          ))
        ) : (
          <div className="notion-card p-12 text-center space-y-3 bg-white">
            <h3 className="text-base font-semibold text-black">No matches found</h3>
            <p className="text-xs text-black/60 max-w-sm mx-auto">
              {activeTab === 'my-teams'
                ? 'None of your tracked clubs have fixtures in this filter. Switch to All Matches or add more clubs in preferences.'
                : 'No matches matched your search query.'}
            </p>
            {activeTab === 'my-teams' && (
              <button
                onClick={() => setActiveTab('all-matches')}
                className="notion-btn-primary mt-2 text-xs"
              >
                View all fixtures
              </button>
            )}
          </div>
        )}
      </div>

      {/* Notion Minimal Footer (Clean without extra tracker label) */}
      <div className="border-t border-black/8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-black/50">
        <div>
          <PitchTimeLogo size="sm" />
        </div>
        <div>
          UEFA Champions League • Premier League • La Liga
        </div>
      </div>
    </div>
  );
}
