import { Match } from './types';
import { getTeamById } from './teams-data';

// Helper to generate dynamic ISO timestamps relative to current time
function relativeIso(offsetHours: number, offsetMinutes: number = 0): string {
  const d = new Date();
  d.setSeconds(0);
  d.setMilliseconds(0);
  d.setTime(d.getTime() + offsetHours * 60 * 60 * 1000 + offsetMinutes * 60 * 1000);
  return d.toISOString();
}

export function getMockMatches(): Match[] {
  const arsenal = getTeamById('arsenal') || {
    id: 'ars',
    name: 'Arsenal',
    shortName: 'Arsenal',
    code: 'ARS',
    leagueId: 'premier-league',
    leagueName: 'Premier League',
    stadium: 'Emirates Stadium',
    city: 'London',
    country: 'England',
  };
  const chelsea = getTeamById('chelsea') || {
    id: 'che',
    name: 'Chelsea',
    shortName: 'Chelsea',
    code: 'CHE',
    leagueId: 'premier-league',
    leagueName: 'Premier League',
    stadium: 'Stamford Bridge',
    city: 'London',
    country: 'England',
  };
  const realMadrid = getTeamById('real-madrid') || {
    id: 'rma',
    name: 'Real Madrid',
    shortName: 'Real Madrid',
    code: 'RMA',
    leagueId: 'la-liga',
    leagueName: 'La Liga',
    stadium: 'Santiago Bernabéu',
    city: 'Madrid',
    country: 'Spain',
  };
  const barcelona = getTeamById('barcelona') || {
    id: 'fcb',
    name: 'FC Barcelona',
    shortName: 'Barcelona',
    code: 'FCB',
    leagueId: 'la-liga',
    leagueName: 'La Liga',
    stadium: 'Spotify Camp Nou',
    city: 'Barcelona',
    country: 'Spain',
  };
  const bayern = getTeamById('bayern-munich') || {
    id: 'bay',
    name: 'Bayern München',
    shortName: 'Bayern',
    code: 'BAY',
    leagueId: 'champions-league',
    leagueName: 'Champions League',
    stadium: 'Allianz Arena',
    city: 'Munich',
    country: 'Germany',
  };
  const psg = getTeamById('psg') || {
    id: 'psg',
    name: 'Paris Saint-Germain',
    shortName: 'PSG',
    code: 'PSG',
    leagueId: 'champions-league',
    leagueName: 'Champions League',
    stadium: 'Parc des Princes',
    city: 'Paris',
    country: 'France',
  };

  return [
    {
      id: 'm-1',
      competition: 'EPL',
      competitionName: 'Premier League',
      matchday: 'Matchday 5',
      homeTeam: arsenal,
      awayTeam: chelsea,
      utcKickoff: relativeIso(0, 20),
      venue: 'Emirates Stadium, London',
      status: 'SCHEDULED',
    },
    {
      id: 'm-2',
      competition: 'La Liga',
      competitionName: 'La Liga',
      matchday: 'Matchday 6 • El Clásico',
      homeTeam: realMadrid,
      awayTeam: barcelona,
      utcKickoff: relativeIso(2, 45),
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
      utcKickoff: relativeIso(5, 15),
      venue: 'Allianz Arena, Munich',
      status: 'SCHEDULED',
    },
  ];
}

export async function getUpcomingMatches(): Promise<Match[]> {
  try {
    const res = await fetch('/api/matches', { cache: 'no-store' });
    if (!res.ok) {
      return getMockMatches();
    }
    const data = await res.json();
    return data.matches && data.matches.length > 0 ? data.matches : getMockMatches();
  } catch {
    return getMockMatches();
  }
}
