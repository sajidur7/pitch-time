'use client';

import React, { useState, useMemo } from 'react';
import { useUser } from '@/context/UserContext';
import { Match, CompetitionCode } from '@/lib/types';
import { getMockMatches } from '@/lib/matches-data';
import { MatchRow } from './MatchRow';
import { Search, Filter, Plus, Bell, RefreshCw, CalendarDays } from 'lucide-react';
import { TEAMS } from '@/lib/teams-data';

interface DashboardViewProps {
  onOpenSettings: () => void;
}

export function DashboardView({ onOpenSettings }: DashboardViewProps) {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'my-teams' | 'all-matches'>('my-teams');
  const [selectedCompetition, setSelectedCompetition] = useState<CompetitionCode | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const allMatches = useMemo(() => getMockMatches(), []);

  // Filter matches
  const filteredMatches = useMemo(() => {
    let list = allMatches;

    // Filter by My Teams vs All Matches
    if (activeTab === 'my-teams') {
      const favs = user?.favoriteTeamIds || [];
      list = list.filter(
        (m) => favs.includes(m.homeTeam.id) || favs.includes(m.awayTeam.id)
      );
    }

    // Filter by competition
    if (selectedCompetition !== 'ALL') {
      list = list.filter((m) => m.competition === selectedCompetition);
    }

    // Filter by search query
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
  }, [allMatches, activeTab, selectedCompetition, searchQuery, user?.favoriteTeamIds]);

  // User favorite teams details
  const favoriteTeams = useMemo(() => {
    const ids = user?.favoriteTeamIds || [];
    return TEAMS.filter((t) => ids.includes(t.id));
  }, [user?.favoriteTeamIds]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Dashboard Sub-Header / Ledger Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 hairline-b pb-6">
        <div>
          <div className="flex items-center space-x-2 font-mono text-xs text-neutral-500 uppercase">
            <span className="status-dot" />
            <span>LIVE SCHEDULE INDEX</span>
            <span>•</span>
            <span>ZONE: {user?.timezone}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-light tracking-[-0.04em] uppercase mt-2 text-black">
            Match Kickoff Ledger
          </h1>
        </div>

        {/* Favorite Clubs Pill Carousel */}
        <div className="flex items-center space-x-2 overflow-x-auto py-1">
          <span className="text-[11px] font-mono text-neutral-400 uppercase shrink-0">
            TRACKING:
          </span>
          {favoriteTeams.map((team) => (
            <div
              key={team.id}
              className="flex items-center space-x-1.5 px-2.5 py-1 hairline-all bg-white text-xs font-mono shrink-0"
            >
              <div className="w-3.5 h-3.5 rounded-full overflow-hidden shrink-0">
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
              <span className="font-medium text-black">{team.shortName}</span>
            </div>
          ))}
          <button
            onClick={onOpenSettings}
            className="p-1 hairline-all hover:bg-neutral-100 text-neutral-500 hover:text-black transition-colors"
            title="Manage favorite clubs"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Primary View Tabs */}
        <div className="flex items-center space-x-2">
          <button
            id="tab-my-teams"
            onClick={() => setActiveTab('my-teams')}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-wider hairline-all transition-colors ${
              activeTab === 'my-teams'
                ? 'bg-black text-white font-medium'
                : 'bg-white text-black hover:bg-neutral-100'
            }`}
          >
            My Teams ({user?.favoriteTeamIds?.length || 0})
          </button>
          <button
            id="tab-all-matches"
            onClick={() => setActiveTab('all-matches')}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-wider hairline-all transition-colors ${
              activeTab === 'all-matches'
                ? 'bg-black text-white font-medium'
                : 'bg-white text-black hover:bg-neutral-100'
            }`}
          >
            All Matches ({allMatches.length})
          </button>
        </div>

        {/* Competition Sub-Filters & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Competition Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto">
            {(['ALL', 'UCL', 'EPL', 'La Liga'] as const).map((comp) => (
              <button
                key={comp}
                onClick={() => setSelectedCompetition(comp)}
                className={`px-2.5 py-1 text-[11px] font-mono uppercase transition-colors hairline-all shrink-0 ${
                  selectedCompetition === comp
                    ? 'bg-black text-white'
                    : 'bg-white text-neutral-600 hover:text-black hover:bg-neutral-100'
                }`}
              >
                {comp === 'ALL' ? 'All Comps' : comp}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative min-w-[200px] sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter fixtures..."
              className="w-full pl-8 pr-3 py-1.5 bg-white hairline-all text-xs font-mono focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
        </div>
      </div>

      {/* Index Column Header (19-86 Typographic style) */}
      <div className="hidden md:flex items-center justify-between px-6 py-2.5 bg-neutral-50 hairline-b font-mono text-[11px] uppercase tracking-wider text-neutral-500">
        <div className="w-[240px]">Date / Kickoff (Local Time)</div>
        <div className="flex-1 text-center">Matchup (Home vs Away)</div>
        <div className="w-[220px] text-right">Competition • Status • Alert</div>
      </div>

      {/* Match Rows List */}
      <div className="hairline-t bg-white divide-y-0">
        {filteredMatches.length > 0 ? (
          filteredMatches.map((match, idx) => (
            <MatchRow
              key={match.id}
              match={match}
              indexNumber={String(idx + 1).padStart(2, '0')}
            />
          ))
        ) : (
          <div className="py-16 text-center space-y-4 hairline-b">
            <CalendarDays className="w-10 h-10 mx-auto text-neutral-300 stroke-[1]" />
            <div className="space-y-1 font-mono">
              <h3 className="text-base text-black font-medium">No Matches Found</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                {activeTab === 'my-teams'
                  ? "None of your selected clubs have scheduled fixtures in this filter. Switch to 'All Matches' or add more clubs in Settings."
                  : 'No fixtures match your current search query.'}
              </p>
            </div>
            {activeTab === 'my-teams' && (
              <div className="flex justify-center space-x-3 pt-2">
                <button
                  onClick={() => setActiveTab('all-matches')}
                  className="px-4 py-2 bg-white hairline-all text-xs font-mono uppercase hover:bg-neutral-100"
                >
                  View All Matches
                </button>
                <button
                  onClick={onOpenSettings}
                  className="px-4 py-2 bg-black text-white text-xs font-mono uppercase hover:bg-neutral-800"
                >
                  Manage Favorite Clubs
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Info / Timezone conversion notice */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-neutral-400 gap-2">
        <div>
          AUTONOMOUS KICKOFF TRACKER • SYNCHRONIZED TO {user?.timezone}
        </div>
        <div className="flex items-center space-x-2">
          <span>PUSH SUBSCRIPTION ACTIVE</span>
          <span className="status-dot" />
        </div>
      </div>
    </div>
  );
}
