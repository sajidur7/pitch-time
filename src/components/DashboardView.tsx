'use client';

import React, { useState, useMemo } from 'react';
import { useUser } from '@/context/UserContext';
import { Match, CompetitionCode } from '@/lib/types';
import { getMockMatches } from '@/lib/matches-data';
import { MatchRow } from './MatchRow';
import { Search, ArrowRight, Bell, Plus, Clock, Sparkles } from 'lucide-react';
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
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-10">
      {/* Shop Hero Section: Clean Discovery with Pill Search & Violet Submit */}
      <div className="space-y-6 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white border border-[#ebebeb] text-xs text-[#787574] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <Sparkles className="w-3.5 h-3.5 text-[#5433eb]" />
          <span>Live football fixtures auto-converted to {preferences.timezone}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-medium tracking-[-0.05em] text-black leading-tight">
          Never miss a kickoff.
        </h1>
        <p className="text-sm sm:text-base text-[#787574] leading-relaxed">
          Follow your favorite clubs across the Champions League, Premier League, and La Liga with instant 10-minute browser alerts.
        </p>

        {/* Shop Signature Pill Search Bar with 48px Circular Violet Submit */}
        <div className="relative max-w-xl mx-auto pt-2">
          <div className="shop-chip flex items-center p-1.5 pl-6 bg-white border border-black/10 focus-within:border-[#5433eb] transition-all">
            <Search className="w-4 h-4 text-[#787574] shrink-0 mr-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clubs, tournaments, or venues..."
              className="flex-1 bg-transparent text-sm text-black placeholder-[#787574] focus:outline-none tracking-[-0.031em]"
            />
            <button
              onClick={() => {}}
              className="shop-violet-btn w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              title="Search"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills Row (Shop Signature 9999px Pills) */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        <button
          onClick={() => setActiveTab('all-matches')}
          className={`shop-chip px-4 py-2 text-xs font-medium transition-all ${
            activeTab === 'all-matches' ? 'shop-chip-active' : 'text-black'
          }`}
        >
          All Fixtures ({allMatches.length})
        </button>
        <button
          onClick={() => setActiveTab('my-teams')}
          className={`shop-chip px-4 py-2 text-xs font-medium transition-all ${
            activeTab === 'my-teams' ? 'shop-chip-active' : 'text-black'
          }`}
        >
          My Clubs ({favoriteTeams.length})
        </button>

        <span className="w-px h-5 bg-[#ebebeb] mx-1 hidden sm:inline-block" />

        {(['ALL', 'UCL', 'EPL', 'La Liga'] as const).map((comp) => (
          <button
            key={comp}
            onClick={() => setSelectedCompetition(comp)}
            className={`shop-chip px-3.5 py-2 text-xs font-medium transition-all ${
              selectedCompetition === comp ? 'shop-chip-active' : 'text-[#787574] hover:text-black'
            }`}
          >
            {comp === 'ALL' ? 'All Competitions' : comp}
          </button>
        ))}
      </div>

      {/* Tracked Clubs Quick Chips Bar */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs text-[#787574]">
        <span className="font-medium text-[#787574]">Tracked clubs:</span>
        {favoriteTeams.map((team) => (
          <span
            key={team.id}
            className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white border border-[#ebebeb] text-black text-xs font-medium shadow-[0_2px_6px_rgba(0,0,0,0.03)]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#5433eb]" />
            <span>{team.name}</span>
          </span>
        ))}
        <button
          onClick={onOpenSettings}
          className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-white border border-[#5433eb]/40 text-[#5433eb] hover:bg-[#5433eb]/5 text-xs font-medium transition-colors"
        >
          <Plus className="w-3 h-3" />
          <span>Edit ({favoriteTeams.length}/5)</span>
        </button>
      </div>

      {/* Shop Floating Match Cards List */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center justify-between px-2 pb-2">
          <span className="text-xs font-medium text-[#787574]">
            Upcoming Matches • {filteredMatches.length} fixtures
          </span>
          <span className="text-xs font-medium text-[#787574]">
            Local Timezone: {preferences.timezone}
          </span>
        </div>

        {filteredMatches.length > 0 ? (
          filteredMatches.map((match) => (
            <MatchRow key={match.id} match={match} />
          ))
        ) : (
          <div className="shop-card-floating p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#f2f4f5] text-[#5433eb] flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-black">No matches found</h3>
              <p className="text-xs text-[#787574] max-w-sm mx-auto">
                {activeTab === 'my-teams'
                  ? 'None of your tracked clubs have fixtures in this filter. Switch to All Fixtures or add more clubs in settings.'
                  : 'No matches matched your search criteria.'}
              </p>
            </div>
            {activeTab === 'my-teams' && (
              <button
                onClick={() => setActiveTab('all-matches')}
                className="shop-violet-btn px-5 py-2 text-xs font-medium"
              >
                View all fixtures
              </button>
            )}
          </div>
        )}
      </div>

      {/* Notification Elevation Banner (Shop Brand Spotlight Card Style) */}
      <div className="shop-card-floating p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-[#ebebeb]/60">
        <div className="space-y-1 max-w-xl">
          <span className="text-[11px] font-semibold text-[#5433eb] uppercase tracking-wider">
            Browser Notifications
          </span>
          <h2 className="text-xl font-medium tracking-tight text-black">
            Never miss the opening whistle
          </h2>
          <p className="text-xs text-[#787574] leading-relaxed">
            Get instant alerts 10 minutes before kickoff with confirmed team lineups, converted to your local time.
          </p>
        </div>

        <button
          onClick={handleEnableNotifications}
          className="shop-violet-btn px-6 py-3 text-xs font-medium flex items-center space-x-2 shrink-0 cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          <span>
            {notificationEnabled || getNotificationPermission() === 'granted'
              ? 'Alerts Enabled'
              : 'Turn on 10-Min Alerts'}
          </span>
        </button>
      </div>

      {/* Shop Minimalist Footer */}
      <div className="border-t border-[#ebebeb] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#787574]">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-black">pitch time</span>
          <span className="text-[#5433eb]">•</span>
          <span>club football match tracker</span>
        </div>
        <div>
          UEFA Champions League • Premier League • La Liga
        </div>
      </div>
    </div>
  );
}
