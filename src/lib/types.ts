export type CompetitionCode = 'UCL' | 'EPL' | 'La Liga';

export type LeagueId = 'premier-league' | 'la-liga' | 'champions-league';

export interface Team {
  id: string;
  name: string;
  shortName: string;
  code: string;
  leagueId: LeagueId;
  leagueName: string;
  stadium: string;
  city: string;
  country: string;
  crest: string; // SVG icon or URL
  monogram: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export type MatchStatus = 'SCHEDULED' | 'TIMED' | 'IN_PLAY' | 'FINISHED';

export interface Match {
  id: string;
  competition: CompetitionCode;
  competitionName: string;
  matchday: string;
  homeTeam: Team;
  awayTeam: Team;
  utcKickoff: string; // ISO 8601 string in UTC (e.g. 2026-09-11T19:45:00Z)
  venue: string;
  status: MatchStatus;
  minute?: number;
  homeScore?: number;
  awayScore?: number;
}

export interface UserPreferences {
  id: string;
  email: string;
  name: string;
  avatar: string;
  onboarding_completed: boolean;
  timezone: string;
  favoriteTeamIds: string[];
  notification10Min: boolean;
  notificationKickoff: boolean;
  matchAlerts: Record<string, boolean>; // matchId -> alertEnabled
  pushSubscription?: any;
}

export interface TimezoneOption {
  value: string;
  label: string;
  offset: string;
  city: string;
}
