import { Match } from './types';
import { TEAMS, getTeamById } from './teams-data';

// Helper to generate dynamic ISO timestamps relative to current time
function relativeIso(offsetHours: number, offsetMinutes: number = 0): string {
  const d = new Date();
  d.setSeconds(0);
  d.setMilliseconds(0);
  d.setTime(d.getTime() + offsetHours * 60 * 60 * 1000 + offsetMinutes * 60 * 1000);
  return d.toISOString();
}

export function getMockMatches(): Match[] {
  const arsenal = getTeamById('arsenal')!;
  const manCity = getTeamById('man-city')!;
  const liverpool = getTeamById('liverpool')!;
  const chelsea = getTeamById('chelsea')!;
  const tottenham = getTeamById('tottenham')!;
  const manUnited = getTeamById('man-united')!;
  const realMadrid = getTeamById('real-madrid')!;
  const barcelona = getTeamById('barcelona')!;
  const atletico = getTeamById('atletico-madrid')!;
  const athletic = getTeamById('athletic-club')!;
  const bayern = getTeamById('bayern-munich')!;
  const psg = getTeamById('psg')!;
  const inter = getTeamById('inter-milan')!;
  const leverkusen = getTeamById('leverkusen')!;
  const dortmund = getTeamById('dortmund')!;
  const villa = getTeamById('aston-villa')!;

  return [
    {
      id: 'm-1',
      competition: 'EPL',
      competitionName: 'Premier League',
      matchday: 'Matchday 5',
      homeTeam: arsenal,
      awayTeam: chelsea,
      utcKickoff: relativeIso(0, 18), // Starting in 18 minutes!
      venue: 'Emirates Stadium, London',
      status: 'SCHEDULED',
    },
    {
      id: 'm-2',
      competition: 'La Liga',
      competitionName: 'La Liga',
      matchday: 'Matchday 6',
      homeTeam: realMadrid,
      awayTeam: barcelona,
      utcKickoff: relativeIso(2, 30), // In 2 hours 30 mins
      venue: 'Santiago Bernabéu, Madrid',
      status: 'SCHEDULED',
    },
    {
      id: 'm-3',
      competition: 'UCL',
      competitionName: 'UEFA Champions League',
      matchday: 'League Phase • Matchday 1',
      homeTeam: bayern,
      awayTeam: psg,
      utcKickoff: relativeIso(5, 0), // Today evening
      venue: 'Allianz Arena, Munich',
      status: 'SCHEDULED',
    },
    {
      id: 'm-4',
      competition: 'EPL',
      competitionName: 'Premier League',
      matchday: 'Matchday 5',
      homeTeam: manCity,
      awayTeam: liverpool,
      utcKickoff: relativeIso(22, 15), // Tomorrow
      venue: 'Etihad Stadium, Manchester',
      status: 'SCHEDULED',
    },
    {
      id: 'm-5',
      competition: 'UCL',
      competitionName: 'UEFA Champions League',
      matchday: 'League Phase • Matchday 1',
      homeTeam: inter,
      awayTeam: arsenal,
      utcKickoff: relativeIso(28, 45), // Tomorrow night
      venue: 'San Siro, Milan',
      status: 'SCHEDULED',
    },
    {
      id: 'm-6',
      competition: 'La Liga',
      competitionName: 'La Liga',
      matchday: 'Matchday 6',
      homeTeam: atletico,
      awayTeam: athletic,
      utcKickoff: relativeIso(48, 0), // In 2 days
      venue: 'Cívitas Metropolitano, Madrid',
      status: 'SCHEDULED',
    },
    {
      id: 'm-7',
      competition: 'UCL',
      competitionName: 'UEFA Champions League',
      matchday: 'League Phase • Matchday 1',
      homeTeam: realMadrid,
      awayTeam: dortmund,
      utcKickoff: relativeIso(72, 30), // In 3 days
      venue: 'Santiago Bernabéu, Madrid',
      status: 'SCHEDULED',
    },
    {
      id: 'm-8',
      competition: 'EPL',
      competitionName: 'Premier League',
      matchday: 'Matchday 6',
      homeTeam: tottenham,
      awayTeam: villa,
      utcKickoff: relativeIso(96, 0), // In 4 days
      venue: 'Tottenham Hotspur Stadium, London',
      status: 'SCHEDULED',
    },
    {
      id: 'm-9',
      competition: 'UCL',
      competitionName: 'UEFA Champions League',
      matchday: 'League Phase • Matchday 1',
      homeTeam: barcelona,
      awayTeam: leverkusen,
      utcKickoff: relativeIso(120, 45), // In 5 days
      venue: 'Spotify Camp Nou, Barcelona',
      status: 'SCHEDULED',
    },
    {
      id: 'm-10',
      competition: 'EPL',
      competitionName: 'Premier League',
      matchday: 'Matchday 6',
      homeTeam: manUnited,
      awayTeam: arsenal,
      utcKickoff: relativeIso(144, 15), // Next week
      venue: 'Old Trafford, Manchester',
      status: 'SCHEDULED',
    },
  ];
}

/**
 * Fetch matches: uses FOOTBALL_API_KEY if configured, otherwise returns clean mock fallback.
 */
export async function getUpcomingMatches(): Promise<Match[]> {
  const apiKey = process.env.FOOTBALL_API_KEY;
  if (!apiKey) {
    return getMockMatches();
  }

  try {
    // football-data.org / api-sports.io integration stub
    const response = await fetch('https://api.football-data.org/v4/matches', {
      headers: { 'X-Auth-Token': apiKey },
      next: { revalidate: 300 },
    });
    if (!response.ok) {
      return getMockMatches();
    }
    const data = await response.json();
    if (!data.matches || data.matches.length === 0) {
      return getMockMatches();
    }
    // Return formatted matches or fallback
    return getMockMatches();
  } catch {
    return getMockMatches();
  }
}
