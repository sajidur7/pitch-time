import { NextResponse } from 'next/server';
import { Match, CompetitionCode, LeagueId } from '@/lib/types';
import { getMockMatches } from '@/lib/matches-data';

export const revalidate = 120; // Revalidate every 2 minutes

interface LeagueConfig {
  slug: string;
  comp: CompetitionCode;
  name: string;
  leagueId: LeagueId;
  country: string;
}

const LEAGUES: LeagueConfig[] = [
  {
    slug: 'eng.1',
    comp: 'EPL',
    name: 'Premier League',
    leagueId: 'premier-league',
    country: 'England',
  },
  {
    slug: 'esp.1',
    comp: 'La Liga',
    name: 'La Liga',
    leagueId: 'la-liga',
    country: 'Spain',
  },
  {
    slug: 'uefa.champions',
    comp: 'UCL',
    name: 'UEFA Champions League',
    leagueId: 'champions-league',
    country: 'Europe',
  },
];

// Helper to format date range (e.g. today to +40 days in YYYYMMDD)
function getDateRange(): string {
  const now = new Date();
  const future = new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000);

  const format = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}${m}${day}`;
  };

  return `${format(now)}-${format(future)}`;
}

export async function GET() {
  const dateRange = getDateRange();
  const allMatches: Match[] = [];

  try {
    const results = await Promise.allSettled(
      LEAGUES.map(async (league) => {
        const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${league.slug}/scoreboard?dates=${dateRange}`;
        const res = await fetch(url, {
          next: { revalidate: 120 },
          headers: { 'User-Agent': 'PitchTime/2.0' },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch ${league.name}`);
        }

        const data = await res.json();
        const events = data.events || [];

        return events.map((ev: any): Match => {
          const comp = ev.competitions?.[0] || {};
          const competitors = comp.competitors || [];
          const home = competitors.find((c: any) => c.homeAway === 'home') || competitors[0] || {};
          const away = competitors.find((c: any) => c.homeAway === 'away') || competitors[1] || {};

          const venueName = comp.venue?.fullName || 'Stadium';
          const venueCity = comp.venue?.address?.city ? `, ${comp.venue.address.city}` : '';

          const statusName = ev.status?.type?.name;
          const status =
            statusName === 'STATUS_IN_PROGRESS' || statusName === 'STATUS_HALFTIME'
              ? 'IN_PLAY'
              : statusName === 'STATUS_FINAL'
              ? 'FINISHED'
              : 'SCHEDULED';

          const homeTeamCode = (home.team?.abbreviation || home.team?.name?.substring(0, 3) || 'HOM').toUpperCase();
          const awayTeamCode = (away.team?.abbreviation || away.team?.name?.substring(0, 3) || 'AWY').toUpperCase();

          return {
            id: String(ev.id),
            competition: league.comp,
            competitionName: league.name,
            matchday: ev.status?.type?.detail || `${league.name} Fixture`,
            utcKickoff: ev.date,
            venue: `${venueName}${venueCity}`,
            status,
            homeTeam: {
              id: homeTeamCode.toLowerCase(),
              name: home.team?.displayName || 'Home Team',
              shortName: home.team?.shortDisplayName || home.team?.displayName || 'Home',
              code: homeTeamCode,
              leagueId: league.leagueId,
              leagueName: league.name,
              stadium: venueName,
              city: comp.venue?.address?.city || '',
              country: league.country,
              monogram: homeTeamCode,
            },
            awayTeam: {
              id: awayTeamCode.toLowerCase(),
              name: away.team?.displayName || 'Away Team',
              shortName: away.team?.shortDisplayName || away.team?.displayName || 'Away',
              code: awayTeamCode,
              leagueId: league.leagueId,
              leagueName: league.name,
              stadium: '',
              city: '',
              country: league.country,
              monogram: awayTeamCode,
            },
          };
        });
      })
    );

    for (const res of results) {
      if (res.status === 'fulfilled' && Array.isArray(res.value)) {
        allMatches.push(...res.value);
      }
    }

    if (allMatches.length === 0) {
      return NextResponse.json({ matches: getMockMatches(), source: 'fallback' });
    }

    // Sort all matches chronologically by kickoff time
    allMatches.sort((a, b) => new Date(a.utcKickoff).getTime() - new Date(b.utcKickoff).getTime());

    return NextResponse.json({
      matches: allMatches,
      count: allMatches.length,
      source: 'live-espn',
      updatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error fetching live matches:', error);
    return NextResponse.json({ matches: getMockMatches(), source: 'fallback-error' });
  }
}
