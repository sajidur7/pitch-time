'use client';

import React, { useState } from 'react';
import { Match } from '@/lib/types';
import { useUser } from '@/context/UserContext';
import { formatMatchKickoff } from '@/lib/timezone';
import { Bell, BellOff, MapPin, Trophy, CheckCircle2, ChevronDown } from 'lucide-react';
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
        <div className="absolute top-2 right-4 z-20 bg-[#163300] text-[#9fe870] px-4 py-2 text-xs font-semibold rounded-full shadow-lg flex items-center space-x-2 animate-in fade-in slide-in-from-top-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#9fe870]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Wise Match Card (10px radius, Fog background, clean typography) */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-[#e8ebe6] hover:bg-[#e2f6d5]/60 transition-all rounded-[10px] p-4 sm:p-5 cursor-pointer mb-3 border border-black/5"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Kickoff Date & Time */}
          <div className="flex items-center space-x-3 min-w-[160px]">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-[#6a6c6a] uppercase tracking-wide">
                {kickoff.dateStr}
              </div>
              <div className="text-xl sm:text-2xl font-black tracking-tight text-[#0e0f0c]">
                {kickoff.timeStr}
              </div>
            </div>
            {kickoff.isToday && (
              <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-[#163300] text-[#9fe870]">
                TODAY
              </span>
            )}
          </div>

          {/* Center: Teams (Typographic Monograms - NO image dependencies) */}
          <div className="flex-1 flex items-center justify-start md:justify-center">
            <div className="flex items-center space-x-3 sm:space-x-5 w-full max-w-lg justify-between sm:justify-center">
              {/* Home Club */}
              <div className="flex items-center space-x-2.5 text-right flex-1 justify-end min-w-0">
                <span className="text-sm sm:text-base font-bold text-[#0e0f0c] truncate">
                  {match.homeTeam.name}
                </span>
                <span className="px-2 py-0.5 text-xs font-black rounded-full bg-[#163300] text-[#9fe870] shrink-0">
                  {match.homeTeam.code}
                </span>
              </div>

              {/* VS Divider */}
              <span className="text-xs font-bold text-[#868685] shrink-0 uppercase tracking-wider">
                vs
              </span>

              {/* Away Club */}
              <div className="flex items-center space-x-2.5 text-left flex-1 justify-start min-w-0">
                <span className="px-2 py-0.5 text-xs font-black rounded-full bg-[#163300] text-[#9fe870] shrink-0">
                  {match.awayTeam.code}
                </span>
                <span className="text-sm sm:text-base font-bold text-[#0e0f0c] truncate">
                  {match.awayTeam.name}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Competition, Dynamic Countdown, Bell Toggle */}
          <div className="flex items-center justify-between md:justify-end space-x-3 min-w-[210px]">
            {/* Competition Badge */}
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-white text-[#163300] border border-[#868685]/20 shrink-0">
              {match.competition}
            </span>

            {/* Countdown Badge */}
            <span
              className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${
                kickoff.relativeBadge === 'LIVE'
                  ? 'bg-[#9fe870] text-[#163300] animate-pulse'
                  : kickoff.isImminent
                  ? 'bg-[#e2f6d5] text-[#163300]'
                  : 'bg-white text-[#454745]'
              }`}
            >
              {kickoff.relativeBadge}
            </span>

            {/* Bell Toggle Pill Button */}
            <button
              onClick={handleToggleBell}
              className={`p-2.5 rounded-full transition-all ${
                isAlertActive
                  ? 'bg-[#163300] text-[#9fe870] shadow-sm'
                  : 'bg-white hover:bg-neutral-100 text-[#868685] hover:text-[#163300]'
              }`}
              title={isAlertActive ? 'Alert scheduled' : 'Enable 10-minute alert'}
            >
              {isAlertActive ? (
                <Bell className="w-4 h-4 fill-[#9fe870]" />
              ) : (
                <BellOff className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Expandable Match Details */}
        {isExpanded && (
          <div className="mt-4 pt-3 border-t border-black/10 text-xs text-[#454745] flex flex-wrap items-center justify-between gap-3 animate-in fade-in-50">
            <div className="flex items-center space-x-2">
              <MapPin className="w-3.5 h-3.5 text-[#163300]" />
              <span>Venue: <strong className="text-[#0e0f0c]">{match.venue}</strong></span>
            </div>
            <div className="flex items-center space-x-2">
              <Trophy className="w-3.5 h-3.5 text-[#163300]" />
              <span>Phase: <strong className="text-[#0e0f0c]">{match.matchday}</strong></span>
            </div>
            <div className="text-[#163300] font-semibold">
              {isAlertActive ? '🔔 Push notification scheduled (10m + kickoff)' : 'Tap bell to set 10-minute kickoff alert'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
