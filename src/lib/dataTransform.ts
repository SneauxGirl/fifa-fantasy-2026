/**
 * Data Normalization & Transformation Layer
 *
 * Transforms API-aligned data structures into component-friendly formats.
 * Decouples component display logic from API data structure.
 *
 * Phase 3 Integration: When real API is added, modifications here will
 * handle the transformation without touching component code.
 */

import type { Match, RosterPlayer, RosterSquad } from "../types/match";
import type { Player } from "../types/player";

/**
 * Flattened Match structure for easier component consumption
 * Converts nested score structure into flat home/away values
 */
export interface DisplayMatch extends Omit<Match, 'score'> {
  score: {
    home: number;
    away: number;
  };
}

/**
 * Enriched RosterPlayer with display-friendly Player data
 */
export interface DisplayPlayer extends Omit<RosterPlayer, 'injury' | 'eliminatedReason'> {
  firstName: string;
  lastName: string;
  club: string;
  isMvp?: boolean;
  recentPerformance: Array<{
    minutesPlayed: number;
    goals: number;
    assists: number;
  }>;
  nationalityCode: string;
  injury?: RosterPlayer['injury'];
  eliminatedReason?: RosterPlayer['eliminatedReason'];
}

/**
 * Transform Match from API format to display format
 * Flattens nested score structure and adds venue/stage info
 */
export function transformMatch(match: Match): DisplayMatch {
  // Get the most recent score (fulltime > extratime > halftime)
  const score = match.score.fulltime.home !== null
    ? { home: match.score.fulltime.home, away: match.score.fulltime.away }
    : match.score.extratime.home !== null
    ? { home: match.score.extratime.home, away: match.score.extratime.away }
    : match.score.halftime.home !== null
    ? { home: match.score.halftime.home, away: match.score.halftime.away }
    : { home: 0, away: 0 };

  return {
    ...match,
    score: {
      home: score.home ?? 0,
      away: score.away ?? 0,
    },
    // Add stage and venue as optional properties
    // These will be populated from enrichment data or API in Phase 3
    stage: undefined,
    venue: undefined,
  };
}

/**
 * Enrich RosterPlayer with Player display data
 * Combines roster player data with player stats/info
 */
export function enrichPlayerForDisplay(
  rosterPlayer: RosterPlayer,
  playerStats: Player
): DisplayPlayer {
  return {
    ...rosterPlayer,
    firstName: playerStats.firstName,
    lastName: playerStats.lastName,
    club: playerStats.club,
    isMvp: playerStats.isMvp,
    recentPerformance: playerStats.recentPerformance,
    nationalityCode: playerStats.nationalityCode,
  };
}

/**
 * Batch enrich multiple roster players
 * Useful for lists where we need display data for all players
 */
export function enrichPlayersForDisplay(
  rosterPlayers: RosterPlayer[],
  playerStatsMap: Map<number | string | null, Player>
): DisplayPlayer[] {
  return rosterPlayers
    .map((rosterPlayer) => {
      const playerStats = playerStatsMap.get(rosterPlayer.playerId);
      if (!playerStats) {
        // Fallback: create minimal display player if stats not found
        return {
          ...rosterPlayer,
          firstName: "",
          lastName: "",
          club: "",
          isMvp: false,
          recentPerformance: [],
          nationalityCode: rosterPlayer.code,
        } as DisplayPlayer;
      }
      return enrichPlayerForDisplay(rosterPlayer, playerStats);
    });
}

/**
 * Extract squad display name with country code
 * Handles both RosterSquad and general squad data
 */
export function getSquadDisplayName(squad: RosterSquad): string {
  return `${squad.name} (${squad.code})`;
}

/**
 * Get player full name
 */
export function getPlayerFullName(
  player: DisplayPlayer | RosterPlayer
): string {
  if ("firstName" in player && "lastName" in player) {
    return `${player.firstName} ${player.lastName}`;
  }
  return player.name || "";
}

/**
 * Get match display string (e.g., "ARG vs BRA" or "ARG 2-1 BRA")
 */
export function getMatchDisplayString(match: DisplayMatch): string {
  const home = match.homeTeam.code;
  const away = match.awayTeam.code;

  if (match.status.short === "NS") {
    return `${home} vs ${away}`;
  }

  const homeScore = match.score.home;
  const awayScore = match.score.away;
  return `${home} ${homeScore} - ${awayScore} ${away}`;
}

/**
 * Get match stage name with fallback
 * In Phase 3, this will come from API stage property
 */
export function getMatchStageName(match: DisplayMatch): string {
  if (match.stage?.name) {
    return match.stage.name;
  }

  // Fallback: infer from homeTeam/awayTeam or match context
  // Phase 3: Replace with actual API stage property
  return "Group Stage"; // TODO: Determine from match data
}

/**
 * Format match date for display
 */
export function formatMatchDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format match time for display
 */
export function formatMatchTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}
