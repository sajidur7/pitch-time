'use client';

import React, { useState } from 'react';
import { Match } from '@/lib/types';
import { useUser } from '@/context/UserContext';
import { formatMatchKickoff } from '@/lib/timezone';
import { Bell, BellOff, MapPin, Trophy, CheckCircle2 } from 'lucide-react';
import { requestNotificationPermission } from '@/lib/push-notifications';

interface MatchRowProps {
  match: Match;
  index: string;
}

export function MatchRow({ match, index }: MatchRowProps) {
  const { preferences, toggleMatchAlert } = useUser();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const kickoff = formatMatchKickoff(match.utcKickoff, preferences.timezone);
  const isAlertActive = preferences.matchAlerts?.[match.id] ?? false;

  const handleToggleBell = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = toggleMatchAlert(match.id);
    const msg = newState
      ? `10-min alert enabled for ${match.homeTeam.shortName} vs ${match.awayTeam.shortName}`
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
        <div className="absolute top-2 right-4 z-20 bg-black text-white px-3.5 py-1.5 text-xs font-mono rounded-[28.8px] flex items-center space-x-2 animate-in fade-in slide-in-from-top-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Structured Bone Card (9px radius, flat on Putty canvas, hairline vellum border) */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-[#e7e5e4] hover:bg-[#eae8e7] border border-[#dfdcd5] rounded-[9px] p-4 sm:p-5 cursor-pointer mb-2.5 transition-colors"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Kickoff Index & Local Time */}
          <div className="flex items-center space-x-3.5 min-w-[190px]">
            <span className="text-[11px] font-mono text-[#595855] w-6">
              {index}
            </span>
            <div className="space-y-0.5">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#595855]">
                {kickoff.dateStr}
              </div>
              <div className="text-xl sm:text-2xl font-normal font-serif-davinci text-black tracking-tight">
                {kickoff.timeStr}
              </div>
            </div>
            {kickoff.isToday && (
              <span className="px-2 py-0.5 text-[9px] font-mono uppercase bg-black text-white rounded-[2px]">
                TODAY
              </span>
            )}
          </div>

          {/* Teams Matchup (Pure Typography - No images) */}
          <div className="flex-1 flex items-center justify-start md:justify-center">
            <div className="flex items-center space-x-3 sm:space-x-5 w-full max-w-md justify-between sm:justify-center">
              {/* Home Team */}
              <div className="flex items-center space-x-2 text-right flex-1 justify-end min-w-0">
                <span className="text-sm sm:text-base font-medium tracking-tight text-black truncate">
                  {match.homeTeam.name}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-[2px] bg-[#dfdcd5] text-black shrink-0">
                  {match.homeTeam.code}
                </span>
              </div>

              {/* VS Divider */}
              <span className="text-xs font-mono text-[#595855] uppercase tracking-widest shrink-0">
                vs
              </span>

              {/* Away Team */}
              <div className="flex items-center space-x-2 text-left flex-1 justify-start min-w-0">
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-[2px] bg-[#dfdcd5] text-black shrink-0">
                  {match.awayTeam.code}
                </span>
                <span className="text-sm sm:text-base font-medium tracking-tight text-black truncate">
                  {match.awayTeam.name}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Competition, Countdown, Action Capsule Button */}
          <div className="flex items-center justify-between md:justify-end space-x-3 min-w-[220px]">
            {/* Competition Badge */}
            <span className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded-[2px] border border-[#dfdcd5] text-black shrink-0">
              {match.competition}
            </span>

            {/* Countdown Badge */}
            <span
              className={`px-3 py-1 text-xs font-mono rounded-[28.8px] transition-colors ${
                kickoff.relativeBadge === 'LIVE'
                  ? 'bg-black text-white font-bold'
                  : kickoff.isImminent
                  ? 'bg-[#dfdcd5] text-black font-semibold'
                  : 'text-[#595855]'
              }`}
            >
              {kickoff.relativeBadge}
            </span>

            {/* Bell Toggle Capsule */}
            <button
              onClick={handleToggleBell}
              className={`px-3 py-1.5 rounded-[28.8px] transition-colors flex items-center space-x-1.5 text-xs font-mono uppercase ${
                isAlertActive
                  ? 'bg-black text-white'
                  : 'border border-[#dfdcd5] text-[#595855] hover:text-black hover:border-black'
              }`}
              title={isAlertActive ? 'Notification active' : 'Set 10-minute alert'}
            >
              <Bell className={`w-3.5 h-3.5 ${isAlertActive ? 'fill-white' : ''}`} />
              <span className="text-[10px]">{isAlertActive ? 'ACTIVE' : 'ALERT'}</span>
            </button>
          </div>
        </div>

        {/* Expandable Match Details (Museum Wall Label style) */}
        {isExpanded && (
          <div className="mt-4 pt-3 border-t border-[#dfdcd5] text-xs font-mono text-[#595855] flex flex-wrap items-center justify-between gap-3 animate-in fade-in-50">
            <div className="flex items-center space-x-2">
              <MapPin className="w-3.5 h-3.5 text-black" />
              <span>VENUE: <strong className="text-black font-semibold">{match.venue}</strong></span>
            </div>
            <div className="flex items-center space-x-2">
              <Trophy className="w-3.5 h-3.5 text-black" />
              <span>COMPETITION: <strong className="text-black font-semibold">{match.matchday}</strong></span>
            </div>
            <div className="text-black font-medium">
              {isAlertActive ? 'PUSH NOTIFICATION SCHEDULED (10M + KICKOFF)' : 'CLICK ALERT BUTTON TO SUBSCRIBE'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
