'use client';

import React, { useState } from 'react';
import { Match } from '@/lib/types';
import { useUser } from '@/context/UserContext';
import { formatMatchKickoff } from '@/lib/timezone';
import { Bell, BellOff, MapPin, Calendar, CheckCircle2 } from 'lucide-react';
import { sendTestNotification } from '@/lib/push-notifications';

interface MatchRowProps {
  match: Match;
  indexNumber: string;
}

export function MatchRow({ match, indexNumber }: MatchRowProps) {
  const { user, toggleMatchAlert } = useUser();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const timezone = user?.timezone || 'Europe/London';
  const kickoff = formatMatchKickoff(match.utcKickoff, timezone);
  const isAlertActive = user?.matchAlerts?.[match.id] ?? false;

  const handleToggleBell = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = toggleMatchAlert(match.id);
    const msg = newState
      ? `Alert enabled for ${match.homeTeam.shortName} vs ${match.awayTeam.shortName}`
      : `Alert removed for ${match.homeTeam.shortName} vs ${match.awayTeam.shortName}`;
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);

    // If enabling alert and notifications are granted, confirm with soft prompt
    if (newState && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  };

  return (
    <div className="relative group">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="absolute top-2 right-4 z-20 bg-black text-white px-3 py-1.5 text-xs font-mono hairline-all shadow-md flex items-center space-x-2 animate-in fade-in slide-in-from-top-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Row */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="hairline-b py-4 sm:py-5 px-3 sm:px-6 hover:bg-neutral-50/80 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        {/* Left: Index & Kickoff Time Column */}
        <div className="flex items-center space-x-4 min-w-[200px] lg:min-w-[240px]">
          <span className="font-mono text-xs text-neutral-400 w-8">{indexNumber}</span>
          <div className="space-y-0.5">
            <div className="text-xs font-mono text-neutral-500 uppercase flex items-center space-x-2">
              <span>{kickoff.dateStr}</span>
              {kickoff.isToday && (
                <span className="px-1.5 py-0.2 bg-black text-white text-[9px] uppercase font-mono">
                  TODAY
                </span>
              )}
            </div>
            <div className="text-xl sm:text-2xl font-light tracking-[-0.03em] font-mono text-black">
              {kickoff.timeStr}
            </div>
          </div>
        </div>

        {/* Center: Teams Matchup */}
        <div className="flex-1 flex items-center justify-start md:justify-center">
          <div className="flex items-center space-x-3 sm:space-x-6 w-full max-w-lg justify-between sm:justify-center">
            {/* Home Team */}
            <div className="flex items-center space-x-3 text-right flex-1 justify-end min-w-0">
              <span className="text-sm sm:text-base font-normal tracking-tight text-black truncate">
                {match.homeTeam.name}
              </span>
              <div className="w-7 h-7 rounded-full bg-white hairline-all p-0.5 flex items-center justify-center shrink-0 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={match.homeTeam.crest}
                  alt={match.homeTeam.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <span className="text-[9px] font-mono font-bold text-black uppercase">
                  {match.homeTeam.code}
                </span>
              </div>
            </div>

            {/* VS Divider */}
            <div className="px-2 py-0.5 font-mono text-xs text-neutral-400 shrink-0 uppercase tracking-widest">
              VS
            </div>

            {/* Away Team */}
            <div className="flex items-center space-x-3 text-left flex-1 justify-start min-w-0">
              <div className="w-7 h-7 rounded-full bg-white hairline-all p-0.5 flex items-center justify-center shrink-0 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={match.awayTeam.crest}
                  alt={match.awayTeam.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <span className="text-[9px] font-mono font-bold text-black uppercase">
                  {match.awayTeam.code}
                </span>
              </div>
              <span className="text-sm sm:text-base font-normal tracking-tight text-black truncate">
                {match.awayTeam.name}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Competition, Countdown, Bell Action */}
        <div className="flex items-center justify-between md:justify-end space-x-4 min-w-[220px]">
          {/* Competition Badge */}
          <span className="px-2 py-0.5 text-[11px] font-mono uppercase bg-white hairline-all text-neutral-800 shrink-0">
            {match.competition}
          </span>

          {/* Dynamic Countdown */}
          <div className="text-right">
            <span
              className={`inline-flex items-center space-x-1.5 px-2.5 py-1 text-xs font-mono hairline-all ${
                kickoff.relativeBadge === 'LIVE'
                  ? 'bg-black text-white font-bold'
                  : kickoff.isImminent
                  ? 'bg-neutral-100 text-black font-medium'
                  : 'bg-white text-neutral-600'
              }`}
            >
              {kickoff.relativeBadge === 'LIVE' && (
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              )}
              <span>{kickoff.relativeBadge}</span>
            </span>
          </div>

          {/* Quick Notification Bell Toggle */}
          <button
            onClick={handleToggleBell}
            className={`p-2.5 hairline-all transition-colors ${
              isAlertActive
                ? 'bg-black text-white hover:bg-neutral-800'
                : 'bg-white text-neutral-400 hover:text-black hover:bg-neutral-100'
            }`}
            title={isAlertActive ? 'Disable notification for this fixture' : 'Enable 10-min notification for this match'}
          >
            {isAlertActive ? (
              <Bell className="w-4 h-4 fill-white" />
            ) : (
              <BellOff className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Match Details (Editorial Drawer) */}
      {isExpanded && (
        <div className="bg-neutral-50 px-6 sm:px-12 py-4 hairline-b text-xs font-mono space-y-3 animate-in fade-in-50 duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2 text-neutral-600">
              <MapPin className="w-4 h-4 text-black shrink-0" />
              <span>Venue: <strong className="text-black">{match.venue}</strong></span>
            </div>
            <div className="flex items-center space-x-2 text-neutral-600">
              <Calendar className="w-4 h-4 text-black shrink-0" />
              <span>Phase: <strong className="text-black">{match.matchday}</strong></span>
            </div>
            <div className="flex items-center space-x-2 text-neutral-600">
              <Bell className="w-4 h-4 text-black shrink-0" />
              <span>
                Alert Status:{' '}
                <strong className={isAlertActive ? 'text-black' : 'text-neutral-400'}>
                  {isAlertActive ? 'Scheduled (10m + Kickoff)' : 'Disabled'}
                </strong>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
