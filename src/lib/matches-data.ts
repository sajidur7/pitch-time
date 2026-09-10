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
  const arsenal = getTeamById('arsenal')!;
  const chelsea = getTeamById('chelsea')!;
  const realMadrid = getTeamById('real-madrid')!;
  const barcelona = getTeamById('barcelona')!;
  const bayern = getTeamById('bayern-munich')!;
  const psg = getTeamById('psg')!;
  const manCity = getTeamById('man-city')!;
  const liverpool = getTeamById('liverpool')!;
  const inter = getTeamById('inter-milan')!;
  const atletico = getTeamById('atletico-madrid')!;
  const athletic = getTeamById('athletic-club')!;
  const dortmund = getTeamById('dortmund')!;
  const tottenham = getTeamById('tottenham')!;
  const villa = getTeamById('aston-villa')!;
  const leverkusen = getTeamById('leverkusen')!;
  const manUnited = getTeamById('man-united')!;
  const newcastle = getTeamById('newcastle')!;
  const juventus = getTeamById('juventus')!;
  const girona = getTeamById('girona')!;

  return [
    {
      id: 'm-1',
      competition: 'EPL',
      competitionName: 'Premier League',
      matchday: 'Matchday 5',
      homeTeam: arsenal,
      awayTeam: chelsea,
      utcKickoff: relativeIso(0, 20), // Starts in 20 minutes (testable alert!)
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
      utcKickoff: relativeIso(2, 45), // Tonight in 2h 45m
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
      utcKickoff: relativeIso(5, 15), // Tonight
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
      utcKickoff: relativeIso(21, 30), // Tomorrow
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
      utcKickoff: relativeIso(26, 45), // Tomorrow evening
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
      utcKickoff: relativeIso(47, 0), // In 2 days
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
      utcKickoff: relativeIso(70, 0), // In 3 days
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
      utcKickoff: relativeIso(94, 30), // In 4 days
      venue: 'Tottenham Hotspur Stadium, London',
      status: 'SCHEDULED',
    },
    {
      id: 'm-9',
      competition: 'UCL',
      competitionName: 'UEFA Champions League',
      matchday: 'League Phase • Matchday 2',
      homeTeam: barcelona,
      awayTeam: bayern,
      utcKickoff: relativeIso(118, 45), // In 5 days
      venue: 'Spotify Camp Nou, Barcelona',
      status: 'SCHEDULED',
    },
    {
      id: 'm-10',
      competition: 'UCL',
      competitionName: 'UEFA Champions League',
      matchday: 'League Phase • Matchday 2',
      homeTeam: liverpool,
      awayTeam: leverkusen,
      utcKickoff: relativeIso(142, 0), // In 6 days
      venue: 'Anfield, Liverpool',
      status: 'SCHEDULED',
    },
    {
      id: 'm-11',
      competition: 'EPL',
      competitionName: 'Premier League',
      matchday: 'Matchday 6',
      homeTeam: manUnited,
      awayTeam: newcastle,
      utcKickoff: relativeIso(166, 15), // Next week
      venue: 'Old Trafford, Manchester',
      status: 'SCHEDULED',
    },
    {
      id: 'm-12',
      competition: 'UCL',
      competitionName: 'UEFA Champions League',
      matchday: 'League Phase • Matchday 2',
      homeTeam: juventus,
      awayTeam: manCity,
      utcKickoff: relativeIso(190, 45), // Next week
      venue: 'Allianz Stadium, Turin',
      status: 'SCHEDULED',
    },
    {
      id: 'm-13',
      competition: 'La Liga',
      competitionName: 'La Liga',
      matchday: 'Matchday 7',
      homeTeam: girona,
      awayTeam: realMadrid,
      utcKickoff: relativeIso(214, 0),
      venue: 'Estadi Montilivi, Girona',
      status: 'SCHEDULED',
    },
    {
      id: 'm-14',
      competition: 'UCL',
      competitionName: 'UEFA Champions League',
      matchday: 'League Phase • Matchday 2',
      homeTeam: psg,
      awayTeam: atletico,
      utcKickoff: relativeIso(238, 0),
      venue: 'Parc des Princes, Paris',
      status: 'SCHEDULED',
    },
  ];
}

export async function getUpcomingMatches(): Promise<Match[]> {
  return getMockMatches();
}
