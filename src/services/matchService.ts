/**
 * Match Service
 * Handles REST API calls for match data.
 * Currently uses mock data; will integrate with API-Football in Phase 3.
 */

import type { Match } from "../types/match";
import mockMatches from "../data/matches.json";

/**
 * Fetch all matches from API or mock data
 * In production: calls API-Football /fixtures endpoint
 */
export const fetchAllMatches = async (): Promise<Match[]> => {
  try {
    // TODO: Replace with API-Football call
    // const response = await fetch(`https://api-football-v1.p.rapidapi.com/v3/fixtures?league=1&season=2026`);
    // const data = await response.json();
    // return normalizeMatches(data.response);

    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockMatches as Match[]), 500);
    });
  } catch (error) {
    console.error("Error fetching matches:", error);
    throw error;
  }
};

/**
 * Fetch matches involving specific roster teams
 * Filters from allMatches by team IDs
 */
export const fetchRosterMatches = async (teamIds: number[]): Promise<Match[]> => {
  try {
    const allMatches = await fetchAllMatches();
    return allMatches.filter((match: Match) =>
        teamIds.includes(match.homeTeam.id) || teamIds.includes(match.awayTeam.id)
    );
  } catch (error) {
    console.error("Error fetching roster matches:", error);
    throw error;
  }
};

/**
 * Fetch match details and events
 * Used for expanded MatchCard view
 */
export const fetchMatchDetails = async (matchId: number): Promise<Match> => {
  try {
    // TODO: Replace with API-Football /fixtures endpoint with matchId
    // const response = await fetch(`https://api-football-v1.p.rapidapi.com/v3/fixtures?id=${matchId}`);
    // const data = await response.json();
    // return normalizeMatch(data.response[0]);

    const match = mockMatches.find((m) => m.id === matchId);
    if (!match) throw new Error(`Match ${matchId} not found`);

    return new Promise((resolve) => {
      setTimeout(() => resolve(match as Match), 300);
    });
  } catch (error) {
    console.error("Error fetching match details:", error);
    throw error;
  }
};

/**
 * Poll for match score updates
 * Called at specific intervals based on match status
 */
export const pollMatchScore = async (matchId: number): Promise<Match> => {
  try {
    return await fetchMatchDetails(matchId);
  } catch (error) {
    console.error("Error polling match score:", error);
    throw error;
  }
};

/**
 * Normalize API-Football response to Match type
 * TODO: Implement when integrating real API
 */
export const normalizeMatches = (apiMatches: any[]): Match[] => {
  return apiMatches.map((m) => ({
    id: m.fixture.id,
    homeTeam: {
      id: m.teams.home.id,
      code: m.teams.home.code || "",
      name: m.teams.home.name,
    },
    awayTeam: {
      id: m.teams.away.id,
      code: m.teams.away.code || "",
      name: m.teams.away.name,
    },
    date: m.fixture.date,
    status: {
      short: m.fixture.status.short,
      long: m.fixture.status.long,
      elapsed: m.fixture.status.elapsed,
    },
    score: {
      halftime: {
        home: m.score.halftime?.home,
        away: m.score.halftime?.away,
      },
      fulltime: {
        home: m.score.fulltime?.home,
        away: m.score.fulltime?.away,
      },
      extratime: {
        home: m.score.extratime?.home,
        away: m.score.extratime?.away,
      },
      penalty: {
        home: m.score.penalty?.home,
        away: m.score.penalty?.away,
      },
    },
    events: m.events || [],
  }));
};
