'use client';

import React, { useState } from 'react';
import { Match } from '@/lib/types';
import { useUser } from '@/context/UserContext';
import { formatMatchKickoff } from '@/lib/timezone';
import { Bell, BellOff, MapPin, Trophy, CheckCircle2 } from 'lucide-react';
import { requestNotificationPermission } from '@/lib/push-notifications';

interface MatchRowProps {
  match: Match;
}

export function MatchRow({ match }: MatchRowProps) {
  const { preferences, toggleMatchAlert } = useUser();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const kickoff = formatMatchKickoff(match.utcKickoff, preferences.timezone);
  const isAlertActive = preferences.matchAlerts?.[match.id] ?? false;

  const handleToggleBell = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = toggleMatchAlert(match.id);
    const msg = newState
      ? `10-min alert set for ${match.homeTeam.shortName} vs ${match.awayTeam.shortName}`
      : `Alert turned off for ${match.homeTeam.shortName} vs ${match.awayTeam.shortName}`;
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);

    if (newState && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        await requestNotificationPermission();
      }
    }
  };

  return (
    <div className="relative group">
      {/* Toast Confirmation */}
      {toastMessage && (
        <div className="absolute top-3 right-6 z-20 bg-black text-white px-4 py-2 text-xs font-medium rounded-full shadow-lg flex items-center space-x-2 animate-in fade-in slide-in-from-top-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#c0b5f3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Shop Floating Card (28px radius, white surface, dual-layer soft shadow) */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="shop-card-floating p-5 sm:p-6 cursor-pointer mb-3 border border-[#ebebeb]/60"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Kickoff Date & Local Time */}
          <div className="flex items-center space-x-3 min-w-[170px]">
            <div className="space-y-0.5">
              <div className="text-[11px] font-medium text-[#787574] uppercase tracking-wide">
                {kickoff.dateStr}
              </div>
              <div className="text-xl sm:text-2xl font-semibold tracking-[-0.05em] text-black">
                {kickoff.timeStr}
              </div>
            </div>
            {kickoff.isToday && (
              <span className="px-2.5 py-0.5 text-[10px] font-semibold rounded-full bg-[#f2f4f5] text-[#5433eb] border border-[#c0b5f3]/40">
                Today
              </span>
            )}
          </div>

          {/* Teams Matchup (Typographic Monograms - NO image dependencies) */}
          <div className="flex-1 flex items-center justify-start md:justify-center">
            <div className="flex items-center space-x-3 sm:space-x-5 w-full max-w-lg justify-between sm:justify-center">
              {/* Home Team */}
              <div className="flex items-center space-x-2 text-right flex-1 justify-end min-w-0">
                <span className="text-sm sm:text-base font-medium tracking-[-0.031em] text-black truncate">
                  {match.homeTeam.name}
                </span>
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-[#f2f4f5] text-black border border-[#ebebeb] shrink-0">
                  {match.homeTeam.code}
                </span>
              </div>

              {/* VS Divider */}
              <span className="text-xs font-medium text-[#acb0aa] shrink-0">
                vs
              </span>

              {/* Away Team */}
              <div className="flex items-center space-x-2 text-left flex-1 justify-start min-w-0">
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-[#f2f4f5] text-black border border-[#ebebeb] shrink-0">
                  {match.awayTeam.code}
                </span>
                <span className="text-sm sm:text-base font-medium tracking-[-0.031em] text-black truncate">
                  {match.awayTeam.name}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Competition, Countdown, Violet Bell Button */}
          <div className="flex items-center justify-between md:justify-end space-x-3 min-w-[220px]">
            {/* Competition Badge */}
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-[#f2f4f5] text-[#332f2d] border border-[#ebebeb] shrink-0">
              {match.competition}
            </span>

            {/* Countdown Badge */}
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                kickoff.relativeBadge === 'LIVE'
                  ? 'bg-[#5433eb] text-white shadow-[0_4px_14px_rgba(69,36,219,0.3)] animate-pulse'
                  : kickoff.isImminent
                  ? 'bg-[#f2f4f5] text-[#5433eb] border border-[#c0b5f3]/60'
                  : 'bg-[#f2f4f5] text-[#787574]'
              }`}
            >
              {kickoff.relativeBadge}
            </span>

            {/* Bell Toggle (Shop Violet when active with tinted glow) */}
            <button
              onClick={handleToggleBell}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                isAlertActive
                  ? 'shop-violet-btn'
                  : 'shop-pill-white text-[#787574] hover:text-black'
              }`}
              title={isAlertActive ? 'Notification active' : 'Set 10-minute alert'}
            >
              {isAlertActive ? (
                <Bell className="w-4 h-4 fill-white" />
              ) : (
                <BellOff className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Expandable Match Details */}
        {isExpanded && (
          <div className="mt-4 pt-3 border-t border-[#ebebeb] text-xs text-[#787574] flex flex-wrap items-center justify-between gap-3 animate-in fade-in-50">
            <div className="flex items-center space-x-2">
              <MapPin className="w-3.5 h-3.5 text-[#5433eb]" />
              <span>Venue: <strong className="text-black font-medium">{match.venue}</strong></span>
            </div>
            <div className="flex items-center space-x-2">
              <Trophy className="w-3.5 h-3.5 text-[#5433eb]" />
              <span>Phase: <strong className="text-black font-medium">{match.matchday}</strong></span>
            </div>
            <div className="text-[#5433eb] font-medium">
              {isAlertActive ? 'Push notification active (10m + kickoff)' : 'Tap bell to receive 10-minute push alert'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
