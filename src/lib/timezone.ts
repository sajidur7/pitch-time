import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { differenceInMinutes, differenceInHours, differenceInDays, isToday, isTomorrow, parseISO } from 'date-fns';
import { TimezoneOption } from './types';

export const COMMON_TIMEZONES: TimezoneOption[] = [
  { value: 'Europe/London', label: 'London (GMT / BST)', offset: 'UTC+0 / +1', city: 'London' },
  { value: 'Europe/Madrid', label: 'Madrid / Paris / Berlin (CET / CEST)', offset: 'UTC+1 / +2', city: 'Madrid' },
  { value: 'America/New_York', label: 'New York (EDT / EST)', offset: 'UTC-4 / -5', city: 'New York' },
  { value: 'America/Chicago', label: 'Chicago (CDT / CST)', offset: 'UTC-5 / -6', city: 'Chicago' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PDT / PST)', offset: 'UTC-7 / -8', city: 'Los Angeles' },
  { value: 'America/Sao_Paulo', label: 'São Paulo (BRT)', offset: 'UTC-3', city: 'São Paulo' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)', offset: 'UTC+4', city: 'Dubai' },
  { value: 'Asia/Kolkata', label: 'India / New Delhi (IST)', offset: 'UTC+5:30', city: 'New Delhi' },
  { value: 'Asia/Dhaka', label: 'Dhaka (BST)', offset: 'UTC+6', city: 'Dhaka' },
  { value: 'Asia/Bangkok', label: 'Bangkok / Jakarta (ICT)', offset: 'UTC+7', city: 'Bangkok' },
  { value: 'Asia/Singapore', label: 'Singapore / Hong Kong (SGT / HKT)', offset: 'UTC+8', city: 'Singapore' },
  { value: 'Asia/Tokyo', label: 'Tokyo / Seoul (JST / KST)', offset: 'UTC+9', city: 'Tokyo' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST / AEDT)', offset: 'UTC+10 / +11', city: 'Sydney' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZST / NZDT)', offset: 'UTC+12 / +13', city: 'Auckland' },
  { value: 'UTC', label: 'Coordinated Universal Time (UTC)', offset: 'UTC+0', city: 'UTC' },
];

/**
 * Detect browser's current timezone or fallback to UTC
 */
export function getDetectedTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) return tz;
  } catch {
    // ignore
  }
  return 'Europe/London';
}

/**
 * Format kickoff date and time converted to target timezone
 */
export function formatMatchKickoff(utcIso: string, timeZone: string): {
  dateStr: string;
  timeStr: string;
  fullStr: string;
  relativeBadge: string;
  isToday: boolean;
  isImminent: boolean;
} {
  try {
    const date = parseISO(utcIso);
    const zoned = toZonedTime(date, timeZone);
    const now = new Date();

    const timeStr = formatInTimeZone(date, timeZone, 'h:mm a');
    const today = isToday(zoned);
    const tomorrow = isTomorrow(zoned);

    let dateStr = formatInTimeZone(date, timeZone, 'EEE, MMM d');
    if (today) dateStr = 'Today';
    else if (tomorrow) dateStr = 'Tomorrow';

    const fullStr = `${dateStr} • ${timeStr}`;

    const diffMins = differenceInMinutes(date, now);
    const diffHours = differenceInHours(date, now);
    const diffDays = differenceInDays(date, now);

    let relativeBadge = '';
    let isImminent = false;

    if (diffMins <= 0 && diffMins > -115) {
      relativeBadge = 'LIVE';
      isImminent = true;
    } else if (diffMins > 0 && diffMins <= 15) {
      relativeBadge = `Kickoff in ${diffMins}m`;
      isImminent = true;
    } else if (diffMins > 15 && diffMins < 60) {
      relativeBadge = `Starts in ${diffMins}m`;
      isImminent = true;
    } else if (diffHours >= 1 && diffHours < 24) {
      const remainingMins = diffMins % 60;
      relativeBadge = remainingMins > 0 ? `Starts in ${diffHours}h ${remainingMins}m` : `Starts in ${diffHours}h`;
    } else if (diffDays === 1) {
      relativeBadge = `Tomorrow at ${timeStr}`;
    } else if (diffDays > 1) {
      relativeBadge = `In ${diffDays} days`;
    } else {
      relativeBadge = timeStr;
    }

    return {
      dateStr,
      timeStr,
      fullStr,
      relativeBadge,
      isToday: today,
      isImminent,
    };
  } catch {
    return {
      dateStr: 'Upcoming',
      timeStr: 'TBD',
      fullStr: 'Upcoming Fixture',
      relativeBadge: 'Upcoming',
      isToday: false,
      isImminent: false,
    };
  }
}

export function getCurrentTimeInZone(timeZone: string): string {
  try {
    return formatInTimeZone(new Date(), timeZone, 'EEE, MMM d • h:mm:ss a');
  } catch {
    return '';
  }
}
