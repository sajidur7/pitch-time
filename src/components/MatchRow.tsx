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
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="absolute top-2 right-4 z-20 bg-black/90 text-white px-3.5 py-1.5 text-xs font-medium rounded-[8px] flex items-center space-x-2 animate-in fade-in slide-in-from-top-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#e6f3fe]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Notion White Card (12px radius, pure white, 1px hairline border, no shadows) */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="notion-card p-4 sm:p-5 cursor-pointer mb-2.5 bg-white"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Kickoff Date & Time */}
          <div className="flex items-center space-x-3 min-w-[170px]">
            <div className="space-y-0.5">
              <div className="text-[11px] font-medium text-black/60 uppercase tracking-wide">
                {kickoff.dateStr}
              </div>
              <div className="text-xl sm:text-2xl font-semibold tracking-tight text-black">
                {kickoff.timeStr}
              </div>
            </div>
            {kickoff.isToday && (
              <span className="px-2.5 py-0.5 text-[10px] font-semibold rounded-full bg-[#ffb110]/20 text-[#000000]">
                Today
              </span>
            )}
          </div>

          {/* Teams Matchup (Typographic Monograms - NO image dependencies) */}
          <div className="flex-1 flex items-center justify-start md:justify-center">
            <div className="flex items-center space-x-3 sm:space-x-5 w-full max-w-lg justify-between sm:justify-center">
              {/* Home Team */}
              <div className="flex items-center space-x-2 text-right flex-1 justify-end min-w-0">
                <span className="text-sm sm:text-base font-medium tracking-tight text-black truncate">
                  {match.homeTeam.name}
                </span>
                <span className="px-2 py-0.5 text-xs font-bold rounded-[6px] bg-black/5 text-black/80 shrink-0">
                  {match.homeTeam.code}
                </span>
              </div>

              {/* VS Divider */}
              <span className="text-xs font-normal text-black/40 shrink-0">
                vs
              </span>

              {/* Away Team */}
              <div className="flex items-center space-x-2 text-left flex-1 justify-start min-w-0">
                <span className="px-2 py-0.5 text-xs font-bold rounded-[6px] bg-black/5 text-black/80 shrink-0">
                  {match.awayTeam.code}
                </span>
                <span className="text-sm sm:text-base font-medium tracking-tight text-black truncate">
                  {match.awayTeam.name}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Competition, Countdown, Action Button */}
          <div className="flex items-center justify-between md:justify-end space-x-3 min-w-[220px]">
            {/* Competition Badge */}
            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-black/5 text-black/70 shrink-0">
              {match.competition}
            </span>

            {/* Countdown Badge */}
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                kickoff.relativeBadge === 'LIVE'
                  ? 'bg-[#ffb110] text-black font-semibold'
                  : kickoff.isImminent
                  ? 'bg-[#e6f3fe] text-[#0075de] font-semibold'
                  : 'text-black/60 bg-black/5'
              }`}
            >
              {kickoff.relativeBadge}
            </span>

            {/* Notion 8px Alert Toggle Button */}
            <button
              onClick={handleToggleBell}
              className={`px-3 py-1.5 rounded-[8px] text-xs font-medium flex items-center space-x-1.5 transition-colors ${
                isAlertActive
                  ? 'bg-[#0075de] text-white'
                  : 'bg-black/5 hover:bg-black/10 text-black/70'
              }`}
              title={isAlertActive ? 'Notification active' : 'Set 10-minute alert'}
            >
              <Bell className={`w-3.5 h-3.5 ${isAlertActive ? 'fill-white' : ''}`} />
              <span className="text-[11px]">{isAlertActive ? 'On' : 'Alert'}</span>
            </button>
          </div>
        </div>

        {/* Expandable Match Details */}
        {isExpanded && (
          <div className="mt-4 pt-3 border-t border-black/8 text-xs text-black/70 flex flex-wrap items-center justify-between gap-3 animate-in fade-in-50">
            <div className="flex items-center space-x-2">
              <MapPin className="w-3.5 h-3.5 text-[#0075de]" />
              <span>Venue: <strong className="text-black">{match.venue}</strong></span>
            </div>
            <div className="flex items-center space-x-2">
              <Trophy className="w-3.5 h-3.5 text-[#0075de]" />
              <span>Phase: <strong className="text-black">{match.matchday}</strong></span>
            </div>
            <div className="text-[#0075de] font-medium">
              {isAlertActive ? '10-minute push alert active' : 'Click alert to enable 10-minute kickoff ping'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
