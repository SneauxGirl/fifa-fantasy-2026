/**
 * API-Football Service
 * Handles all REST API calls to api-football.com
 * Normalizes responses to TypeScript interfaces defined in types/
 */

import axios, { AxiosError } from "axios";
import type { AxiosInstance } from "axios";
import type { Match, MatchEvent } from "../types/match";
import type { Player, PlayerMatchStats, Position } from "../types/player";
import type { Squad } from "../types/squad";
import { config } from "../config";

// ─── Configuration ───────────────────────────────────────────────────────
// Official API-Football documentation: https://www.api-football.com/documentation-v3
const API_BASE_URL = config.api.baseUrl;
const API_KEY = config.api.key;

// REQWORK ALL OF THIS for 2022 #TODO
// Tournament Configuration
// International competitions available in API-Football
// League IDs are configurable via .env (see config/index.ts)
// Verify actual IDs at https://www.api-football.com/documentation

export const TOURNAMENTS = {
  // Current preseason/qualifiers (March 2026)
  QUALIFIERS: {
    id: 679, // UEFA Nations League or similar (verify with API)
    season: 2026,
    name: "Qualifiers/Preseason",
  },
  FRIENDLIES: {
    id: 680, // Friendly matches competition ID (verify with API)
    season: 2026,
    name: "Friendly Matches",
  },
  // World Cup 2026 (June 2026) - configured via .env
  WORLD_CUP: {
    id: config.api.leagueId,
    season: config.api.season,
    name: "FIFA World Cup 2026",
  },
};

// Default tournament to use (can be changed at runtime)
let activeTournament = TOURNAMENTS.QUALIFIERS;

// ─── Axios Instance ───────────────────────────────────────────────────────

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "x-apisports-key": API_KEY,
  },
});

// Error handling interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 429) {
      console.warn("API rate limit exceeded. Consider implementing backoff.");
    }
    return Promise.reject(error);
  }
);

// ─── Type Helpers ───────────────────────────────────────────────────────

/**
 * Convert API position code to standardized Position type
 * API uses: "G" (GK), "D" (DEF), "M" (MID), "F" (FWD), etc.
 */
function normalizePosition(apiPosition: string): Position {
  const pos = apiPosition.toUpperCase()[0];
  switch (pos) {
    case "G":
      return "GK";
    case "D":
      return "DEF";
    case "M":
      return "MID";
    case "F":
      return "FWD";
    default:
      return "DEF"; // Default fallback
  }
}

/**
 * Parse player name into first/last for consistency
 * API often provides: "Firstname Lastname"
 */
function parsePlayerName(apiName: string): { firstName: string; lastName: string } {
  const parts = apiName.trim().split(/\s+/);
  if (parts.length === 0) {
    return { firstName: "Unknown", lastName: "Player" };
  }
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }
  // Simple heuristic: first word is first name, rest is last name
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

// ─── Match Normalization ───────────────────────────────────────────────────

/**
 * Normalize a single API-Football fixture to Match type
 */
export function normalizeMatch(apiFixture: any): Match {
  return {
    id: apiFixture.fixture.id,
    homeTeam: {
      id: apiFixture.teams.home.id,
      code: apiFixture.teams.home.code || "UNK",
      name: apiFixture.teams.home.name,
    },
    awayTeam: {
      id: apiFixture.teams.away.id,
      code: apiFixture.teams.away.code || "UNK",
      name: apiFixture.teams.away.name,
    },
    date: apiFixture.fixture.date,
    status: {
      short: apiFixture.fixture.status.short,
      long: apiFixture.fixture.status.long,
      elapsed: apiFixture.fixture.status.elapsed,
    },
    score: {
      halftime: {
        home: apiFixture.score.halftime?.home ?? null,
        away: apiFixture.score.halftime?.away ?? null,
      },
      fulltime: {
        home: apiFixture.score.fulltime?.home ?? null,
        away: apiFixture.score.fulltime?.away ?? null,
      },
      extratime: {
        home: apiFixture.score.extratime?.home ?? null,
        away: apiFixture.score.extratime?.away ?? null,
      },
      penalty: {
        home: apiFixture.score.penalty?.home ?? null,
        away: apiFixture.score.penalty?.away ?? null,
      },
    },
    venue: apiFixture.fixture.venue ? {
      id: apiFixture.fixture.venue.id,
      name: apiFixture.fixture.venue.name,
      city: apiFixture.fixture.venue.city,
    } : undefined,
    stage: apiFixture.league?.season ? {
      id: apiFixture.league.season,
      name: apiFixture.league.name,
    } : undefined,
    events: normalizeMatchEvents(apiFixture.events || []),
  };
}

/**
 * Normalize match events from API response
 */
function normalizeMatchEvents(apiEvents: any[]): MatchEvent[] {
  return (apiEvents || []).map((event) => ({
    time: {
      elapsed: event.time.elapsed || 0,
      extra: event.time.extra || null,
    },
    team: {
      id: event.team.id,
      code: event.team.code || "",
    },
    player: {
      id: event.player.playerId,
      name: event.player.name,
    },
    assist: {
      id: event.assist?.id || null,
      name: event.assist?.name || null,
    },
    type: event.type || "Goal",
    detail: event.detail || "",
    comments: event.comments || null,
  }));
}

// ─── Player Normalization ───────────────────────────────────────────────────

/**
 * Normalize a single API-Football player to Player type
 * Includes recent match performance stats
 */
export function normalizePlayer(
  apiPlayer: any,
  statistics?: any[]
): Player {
  const { firstName, lastName } = parsePlayerName(apiPlayer.player.name);
  const position = normalizePosition(apiPlayer.player.position || "D");

  return {
    id: apiPlayer.player.playerId,
    firstName,
    lastName,
    apiDisplayName: apiPlayer.player.name,
    position,
    positionFull: getPositionFull(position),
    nationality: apiPlayer.team.country || "Unknown",
    nationalityCode: apiPlayer.team.code || "UNK",
    nationalityLocal: apiPlayer.team.code || "UNK", // TODO: map via countryNames.ts
    club: apiPlayer.team.name,
    status: "bench", // TODO: determine from lineups/status
    photoUrl: apiPlayer.player.photo,
    recentPerformance: normalizePlayerStats(statistics || []),
    tournamentPerformance: [],
  };
}

/**
 * Normalize player match statistics
 */
function normalizePlayerStats(stats: any[]): PlayerMatchStats[] {
  return (stats || []).slice(0, 10).map((stat) => ({
  //REMOVE   minutesPlayed: stat.games?.minutes || 0, #TODO
    goals: stat.goals?.total || 0,
    assists: stat.goals?.assists || 0,
    saves: stat.goals?.saves ?? null,
  //REMOVE  penaltiesScored: stat.penalty?.scored || 0, #TODO
  //REMOVE  penaltiesMissed: stat.penalty?.missed ?? null, #TODO
  //REMOVE  penaltiesSaved: stat.penalty?.saved ?? null, #TODO
    yellowCards: (stat.cards?.yellow || 0) + (stat.cards?.yellowred || 0),
    redCards: stat.cards?.red || 0,
    ownGoals: 0, // TODO: derive from match events?
    cleanSheet: stat.games?.minutes >= 45 ? (stat.goals?.conceded === 0 || null) : null,
    shootoutGoals: null, // TODO: derive from match events
    shootoutSaves: null,
    shootoutMisses: null,
  }));
}

// Confirm this isn't backwards and maps correctly
function getPositionFull(position: Position): "Goalkeeper" | "Defender" | "Midfielder" | "Forward" {
  const positionMap = {
    GK: "Goalkeeper" as const,
    DEF: "Defender" as const,
    MID: "Midfielder" as const,
    FWD: "Forward" as const,
  };
  return positionMap[position];
}

// ─── Squad/Team Normalization ───────────────────────────────────────────────

/**
 * Normalize a single API-Football team to Squad type
 */
export function normalizeTeam(apiTeam: any, stats?: any): Squad {
  return {
    id: apiTeam.team.id,
    name: apiTeam.team.country || apiTeam.team.name,
    nameLocal: apiTeam.team.name, // API provides local name
    code: apiTeam.team.code || "UNK",
    flag: apiTeam.team.flag || "🚩",
    logoUrl: apiTeam.team.logo,
    // REMOVE? fifaRanking: stats?.position || undefined,  #todo
    historicalPerformance: [],
    squadPerformance: normalizeTournamentStats(stats?.matches),
  };
}

/**
 * Normalize tournament/squad statistics
 */
function normalizeTournamentStats(matches: any[]): any {
  if (!matches || matches.length === 0) {
    return {
      goalsFor: 0,
      goalsAgainst: 0,
      yellowCards: 0,
      redCards: 0,
//REMOVE      penaltiesScored: 0, #TODO
//REMOVE      penaltiesMissed: 0, #TODO
      cleanSheets: 0,
      shootoutGoals: 0,
      shootoutMisses: 0,
    };
  }

  let goalsFor = 0,
    goalsAgainst = 0,
    yellowCards = 0,
    redCards = 0,
    cleanSheets = 0;

  matches.forEach((m: any) => {
    goalsFor += m.goals?.for || 0;
    goalsAgainst += m.goals?.against || 0;
    yellowCards += m.cards?.yellow || 0;
    redCards += m.cards?.red || 0;
    if ((m.goals?.against || 0) === 0) cleanSheets++;
  });

  return {
    goalsFor,
    goalsAgainst,
    yellowCards,
    redCards,
//REMOVE     penaltiesScored: 0, #TODO
//REMOVE     penaltiesMissed: 0, #TODO
    shootoutGoals: 0,
    shootoutMisses: 0,
  };
}

// ─── Tournament Selection ───────────────────────────────────────────────────

/**
 * Switch active tournament
 * Call this to change between Qualifiers → Friendlies → World Cup
 */
export function setActiveTournament(tournament: typeof TOURNAMENTS.QUALIFIERS): void {
  activeTournament = tournament;
  console.log(`Switched to tournament: ${tournament.name}`);
}

/**
 * Get currently active tournament
 */
export function getActiveTournament(): typeof TOURNAMENTS.QUALIFIERS {
  return activeTournament;
}

// ─── Public API Methods ───────────────────────────────────────────────────

/**
 * Fetch matches from active tournament
 * Optionally filter by team
 */
async function fetchTournamentMatches(filters?: {
  teamId?: number;
  round?: string;
}): Promise<Match[]> {
  try {
    const params: any = {
      league: activeTournament.id,
      season: activeTournament.season,
    };

    if (filters?.teamId) {
      params.team = filters.teamId;
    }
    if (filters?.round) {
      params.round = filters.round;
    }

    const response = await apiClient.get("/fixtures", { params });

    if (!response.data?.response) {
      console.warn(`No fixtures found for ${activeTournament.name}`);
      return [];
    }

    return response.data.response.map(normalizeMatch);
  } catch (error) {
    console.error(`Error fetching ${activeTournament.name} matches:`, error);
    throw error;
  }
}

/**
 * Fetch qualifier/preseason matches (current)
 */
export async function fetchQualifierMatches(filters?: {
  teamId?: number;
}): Promise<Match[]> {
  const previous = activeTournament;
  try {
    setActiveTournament(TOURNAMENTS.QUALIFIERS);
    return await fetchTournamentMatches(filters);
  } finally {
    setActiveTournament(previous);
  }
}

/**
 * Fetch friendly international matches
 */
export async function fetchFriendlyMatches(filters?: {
  teamId?: number;
}): Promise<Match[]> {
  const previous = activeTournament;
  try {
    setActiveTournament(TOURNAMENTS.FRIENDLIES);
    return await fetchTournamentMatches(filters);
  } finally {
    setActiveTournament(previous);
  }
}

/**
 * Fetch World Cup 2026 matches (June 2026+)
 */
export async function fetchWorldCupMatches(filters?: {
  teamId?: number;
  round?: string;
}): Promise<Match[]> {
  const previous = activeTournament;
  try {
    setActiveTournament(TOURNAMENTS.WORLD_CUP);
    return await fetchTournamentMatches(filters);
  } finally {
    setActiveTournament(previous);
  }
}

/**
 * Fetch a specific match with details and events
 */
export async function fetchMatchDetails(matchId: number): Promise<Match> {
  try {
    const response = await apiClient.get("/fixtures", {
      params: { id: matchId },
    });

    if (!response.data?.response?.[0]) {
      throw new Error(`Match ${matchId} not found`);
    }

    return normalizeMatch(response.data.response[0]);
  } catch (error) {
    console.error(`Error fetching match ${matchId}:`, error);
    throw error;
  }
}

/**
 * Fetch squads/teams from active tournament
 */
async function fetchTournamentSquads(): Promise<Squad[]> {
  try {
    const response = await apiClient.get("/teams", {
      params: {
        league: activeTournament.id,
        season: activeTournament.season,
      },
    });

    if (!response.data?.response) {
      console.warn(`No teams found for ${activeTournament.name}`);
      return [];
    }

    return response.data.response.map((teamData: any) =>
      normalizeTeam(teamData)
    );
  } catch (error) {
    console.error(`Error fetching ${activeTournament.name} squads:`, error);
    throw error;
  }
}

/**
 * Fetch squads from current tournament
 */
export async function fetchSquads(): Promise<Squad[]> {
  return await fetchTournamentSquads();
}

/**
 * Fetch players for a specific squad/team
 */
export async function fetchSquadRoster(teamId: number): Promise<Player[]> {
  try {
    const response = await apiClient.get("/players", {
      params: {
        team: teamId,
        league: activeTournament.id,
        season: activeTournament.season,
      },
    });

    if (!response.data?.response) {
      console.warn(`No players found for team ${teamId}`);
      return [];
    }

    return response.data.response.map((playerData: any) =>
      normalizePlayer(playerData, playerData.statistics)
    );
  } catch (error) {
    console.error(`Error fetching squad roster for team ${teamId}:`, error);
    throw error;
  }
}

/**
 * Fetch all players in active tournament
 * Note: This may require pagination due to API limits
 */
export async function fetchAllPlayers(): Promise<Player[]> {
  try {
    const response = await apiClient.get("/players", {
      params: {
        league: activeTournament.id,
        season: activeTournament.season,
      },
    });

    if (!response.data?.response) {
      console.warn(`No players found for ${activeTournament.name}`);
      return [];
    }

    return response.data.response.map((playerData: any) =>
      normalizePlayer(playerData, playerData.statistics)
    );
  } catch (error) {
    console.error(`Error fetching all players for ${activeTournament.name}:`, error);
    throw error;
  }
}

/**
 * Fetch player statistics/recent performance
 * Used for updating historical cache
 */
export async function fetchPlayerStats(
  playerId: number,
  limit = 10
): Promise<PlayerMatchStats[]> {
  try {
    const response = await apiClient.get("/players", {
      params: {
        id: playerId,
        league: activeTournament.id,
        season: activeTournament.season,
      },
    });

    if (!response.data?.response?.[0]?.statistics) {
      return [];
    }

    return normalizePlayerStats(
      response.data.response[0].statistics.slice(0, limit)
    );
  } catch (error) {
    console.error(`Error fetching stats for player ${playerId}:`, error);
    return [];
  }
}

/**
 * Health check: verify API connectivity
 */
export async function checkAPIHealth(): Promise<boolean> {
  try {
    const response = await apiClient.get("/status");
    return response.status === 200;
  } catch (error) {
    console.error("API health check failed:", error);
    return false;
  }
}

// ─── Historical Caching ───────────────────────────────────────────────────

/**
 * In-memory cache for recent API calls
 * Structure: { matchId: { lastFetched, nextFetchAt, pollInterval } }
 */
const pollMetadataCache: Record<
  number,
  { lastFetched: number; nextFetchAt: number; pollInterval: number }
> = {};

/**
 * Get or create poll metadata for a match
 * Used by polling service to manage refresh intervals
 */
export function getPollMetadata(
  matchId: number
): { lastFetched: number; nextFetchAt: number; pollInterval: number } {
  if (!pollMetadataCache[matchId]) {
    const now = Date.now();
    pollMetadataCache[matchId] = {
      lastFetched: now,
      nextFetchAt: now + 30000, // Default 30 seconds
      pollInterval: 30000,
    };
  }
  return pollMetadataCache[matchId];
}

/**
 * Update poll metadata after a successful fetch
 */
export function updatePollMetadata(
  matchId: number,
  interval: number
): void {
  const now = Date.now();
  if (pollMetadataCache[matchId]) {
    pollMetadataCache[matchId] = {
      lastFetched: now,
      nextFetchAt: now + interval,
      pollInterval: interval,
    };
  }
}

/**
 * Clear old cache entries (older than 1 hour)
 */
export function cleanupPollCache(): void {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  Object.keys(pollMetadataCache).forEach((key) => {
    if (pollMetadataCache[Number(key)].lastFetched < oneHourAgo) {
      delete pollMetadataCache[Number(key)];
    }
  });
}
