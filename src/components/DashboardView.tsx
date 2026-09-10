'use client';

import React, { useState, useMemo } from 'react';
import { useUser } from '@/context/UserContext';
import { Match, CompetitionCode } from '@/lib/types';
import { getMockMatches } from '@/lib/matches-data';
import { MatchRow } from './MatchRow';
import { Search, Bell, Plus, Calendar, Sparkles } from 'lucide-react';
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
    <div className="max-w-[1240px] mx-auto px-4 sm:px-8 py-10 sm:py-16 space-y-12">
      {/* Structured Gallery Hero Section */}
      <div className="space-y-6 text-center max-w-3xl mx-auto">
        {/* Gallery Folio Label */}
        <div className="text-[11px] font-mono tracking-widest uppercase text-[#595855]">
          KICKOFF FOLIO NO. 2026 • EUROPEAN CONTINENTAL SCHEDULE
        </div>

        {/* Brand Wordmark & Display Serif */}
        <div className="space-y-3">
          <PitchTimeLogo size="hero" />
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-normal font-serif-davinci text-black tracking-tight leading-tight">
            Matches converted to your local time.
          </h1>
        </div>

        {/* Structured Stat Display Block */}
        <div className="inline-flex flex-wrap items-center justify-center gap-6 sm:gap-10 py-3 font-mono text-xs text-black border-y border-[#dfdcd5]">
          <div>
            <span className="text-[#595855] mr-1">FIXTURES:</span>
            <strong className="font-semibold">{allMatches.length} MATCHES</strong>
          </div>
          <div className="hidden sm:inline text-[#dfdcd5]">•</div>
          <div>
            <span className="text-[#595855] mr-1">COMPETITIONS:</span>
            <strong className="font-semibold">UCL • EPL • LA LIGA</strong>
          </div>
          <div className="hidden sm:inline text-[#dfdcd5]">•</div>
          <div>
            <span className="text-[#595855] mr-1">TIMEZONE:</span>
            <strong className="font-semibold">{preferences.timezone}</strong>
          </div>
        </div>

        {/* Primary Capsule Action Button */}
        <div className="pt-2">
          <button
            onClick={handleEnableNotifications}
            className="structured-pill-btn inline-flex items-center space-x-2"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>
              {notificationEnabled || getNotificationPermission() === 'granted'
                ? 'PUSH ALERTS ACTIVE (10M + KICKOFF)'
                : 'ENABLE 10-MINUTE PUSH ALERTS'}
            </span>
          </button>
        </div>
      </div>

      {/* Tracked Clubs Gallery Row */}
      <div className="bg-[#e7e5e4] border border-[#dfdcd5] rounded-[9px] p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-[#595855] uppercase mr-2">
            TRACKED CLUBS:
          </span>
          {favoriteTeams.map((team) => (
            <span
              key={team.id}
              className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white border border-[#dfdcd5] rounded-[2px] text-xs font-medium text-black"
            >
              <span className="font-mono text-[10px] font-bold">{team.code}</span>
              <span>{team.name}</span>
            </span>
          ))}
        </div>

        <button
          onClick={onOpenSettings}
          className="structured-pill-btn-outline inline-flex items-center space-x-1 text-xs font-mono uppercase"
        >
          <Plus className="w-3 h-3" />
          <span>MANAGE CLUBS ({favoriteTeams.length}/5)</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Segmented View Tabs */}
        <div className="inline-flex bg-[#e7e5e4] border border-[#dfdcd5] p-1 rounded-[9px] space-x-1">
          <button
            onClick={() => setActiveTab('all-matches')}
            className={`px-4 py-1.5 rounded-[6px] text-xs font-mono uppercase transition-colors ${
              activeTab === 'all-matches'
                ? 'bg-black text-white font-medium'
                : 'text-[#595855] hover:text-black'
            }`}
          >
            All Fixtures ({allMatches.length})
          </button>
          <button
            onClick={() => setActiveTab('my-teams')}
            className={`px-4 py-1.5 rounded-[6px] text-xs font-mono uppercase transition-colors ${
              activeTab === 'my-teams'
                ? 'bg-black text-white font-medium'
                : 'text-[#595855] hover:text-black'
            }`}
          >
            My Clubs ({favoriteTeams.length})
          </button>
        </div>

        {/* Competition Filters & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Competition Chips */}
          <div className="inline-flex bg-[#e7e5e4] border border-[#dfdcd5] p-1 rounded-[9px] space-x-1 overflow-x-auto">
            {(['ALL', 'UCL', 'EPL', 'La Liga'] as const).map((comp) => (
              <button
                key={comp}
                onClick={() => setSelectedCompetition(comp)}
                className={`px-3 py-1 rounded-[6px] text-xs font-mono uppercase transition-colors shrink-0 ${
                  selectedCompetition === comp
                    ? 'bg-black text-white'
                    : 'text-[#595855] hover:text-black'
                }`}
              >
                {comp === 'ALL' ? 'ALL COMPS' : comp}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[200px] sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#595855]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by club or tournament..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#e7e5e4] border border-[#dfdcd5] rounded-[9px] text-xs font-mono text-black placeholder-[#595855] focus:outline-none focus:border-black"
            />
          </div>
        </div>
      </div>

      {/* Index Column Label (Gallery Museum Style) */}
      <div className="hidden md:flex items-center justify-between px-6 py-2 text-[11px] font-mono text-[#595855] uppercase tracking-wider border-b border-[#dfdcd5]">
        <div className="w-[190px]">DATE / KICKOFF (LOCAL)</div>
        <div className="flex-1 text-center">MATCHUP (HOME VS AWAY)</div>
        <div className="w-[220px] text-right">COMPETITION • STATUS • ALERT</div>
      </div>

      {/* Match Cards List */}
      <div className="space-y-2">
        {filteredMatches.length > 0 ? (
          filteredMatches.map((match, idx) => (
            <MatchRow
              key={match.id}
              match={match}
              index={String(idx + 1).padStart(2, '0')}
            />
          ))
        ) : (
          <div className="bg-[#e7e5e4] border border-[#dfdcd5] rounded-[9px] p-12 text-center space-y-3 font-mono">
            <h3 className="text-base font-semibold text-black uppercase">NO FIXTURES IN SELECTION</h3>
            <p className="text-xs text-[#595855] max-w-sm mx-auto">
              {activeTab === 'my-teams'
                ? 'None of your tracked clubs have matches in this view. Switch to All Fixtures or add clubs in settings.'
                : 'No fixtures match your search query.'}
            </p>
            {activeTab === 'my-teams' && (
              <button
                onClick={() => setActiveTab('all-matches')}
                className="structured-pill-btn mt-2 text-xs"
              >
                VIEW ALL FIXTURES
              </button>
            )}
          </div>
        )}
      </div>

      {/* Structured Minimal Gallery Footer */}
      <div className="border-t border-[#dfdcd5] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#595855]">
        <div className="flex items-center space-x-2">
          <PitchTimeLogo size="sm" />
          <span>• RENAISSANCE MATCH FOLIO</span>
        </div>
        <div>
          UEFA CHAMPIONS LEAGUE • PREMIER LEAGUE • LA LIGA
        </div>
      </div>
    </div>
  );
}
