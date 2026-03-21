/**
 * Roster Service
 * Handles roster validation and business logic operations.
 */

import type { RosterPlayer } from "../types/match";
import type { RootState } from "../store";

/**
 * Validation Rules through Round 16:
 * - Must have 11+ players signed to unlock starters/bench drag
 * - Must have 4 squads signed
 * - One dedicated goalie slot required in starters
 *
 * After Round 16:
 * - Roster locks (no new additions)
 * - Can still replace eliminated players
 */

interface RosterValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate roster against rules
 */
export const validateRoster = (state: RootState): RosterValidation => {
  const errors: string[] = [];
  const warnings: string[] = [];

  const signedPlayerCount = state.roster.players.signed.length;
  const starterCount = state.roster.players.starters.length;
  const signedSquadCount = state.roster.squads.signed.length;
  const goaliesInStarters = state.roster.players.starters.filter(
    (p) => p.position === "GK"
  ).length;

  // Through Round 16 validation
  if (!state.roster.validation.roundLocked) {
    // Check minimum players
    if (signedPlayerCount < 11) {
      errors.push(`Need ${11 - signedPlayerCount} more signed players`);
    }

    // Check minimum squads
    if (signedSquadCount < 4) {
      errors.push(`Need ${4 - signedSquadCount} more squads`);
    }

    // Check goalie slot in starters (only if 11 starters selected)
    if (starterCount === 11 && goaliesInStarters === 0) {
      errors.push("Must have 1 goalie in starters");
    }

    // Warning if goalies exceed limit
    const totalGoalies = state.roster.players.signed.filter(
      (p) => p.position === "GK"
    ).length;
    if (totalGoalies > 3) {
      warnings.push("Maximum 3 goalies allowed on roster");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Check if starters/bench drag is unlocked
 * Requires 11+ signed players
 */
export const isStartersDragUnlocked = (state: RootState): boolean => {
  return state.roster.players.signed.length >= 11;
};

/**
 * Check if a player can be added to starters
 * - Must be signed
 * - Position validation (only 1 GK)
 * - Max 11 starters
 */
export const canAddToStarters = (
  state: RootState,
  player: RosterPlayer
): boolean => {
  if (player.status !== "signed") return false;
  if (state.roster.players.starters.length >= 11) return false;

  // Special check for goalies (max 1 in starters)
  if (player.position === "GK") {
    const goaliesInStarters = state.roster.players.starters.filter(
      (p) => p.position === "GK"
    ).length;
    return goaliesInStarters < 1;
  }

  return true;
};

/**
 * Check if roster is full
 * Max 18 signed players
 */
export const isRosterFull = (state: RootState): boolean => {
  return state.roster.players.signed.length >= 18;
};

/**
 * Check if all required squads are signed
 */
export const hasRequiredSquads = (state: RootState): boolean => {
  return state.roster.squads.signed.length >= 4;
};

/**
 * Get available players by position
 */
export const getAvailablePlayersByPosition = (
  state: RootState,
  position: "FWD" | "MID" | "DEF" | "GK"
): RosterPlayer[] => {
  return state.roster.players.available.filter((p) => p.position === position);
};

/**
 * Get all unsigned players (in roster but not locked)
 */
export const getUnsignedPlayers = (state: RootState): RosterPlayer[] => {
  return state.roster.players.unsigned;
};

/**
 * Get all signed players
 */
export const getSignedPlayers = (state: RootState): RosterPlayer[] => {
  return state.roster.players.signed;
};

/**
 * Get all starters
 */
export const getStarters = (state: RootState): RosterPlayer[] => {
  return state.roster.players.starters;
};

/**
 * Get all bench players
 */
export const getBenchPlayers = (state: RootState): RosterPlayer[] => {
  return state.roster.players.bench;
};

/**
 * Get eliminated players
 */
export const getEliminatedPlayers = (state: RootState): RosterPlayer[] => {
  return state.roster.players.eliminated;
};

/**
 * Count players by position
 */
export const countPlayersByPosition = (
  state: RootState
): Record<string, number> => {
  const signed = state.roster.players.signed;
  return {
    FWD: signed.filter((p) => p.position === "FWD").length,
    MID: signed.filter((p) => p.position === "MID").length,
    DEF: signed.filter((p) => p.position === "DEF").length,
    GK: signed.filter((p) => p.position === "GK").length,
  };
};

/**
 * Get total points from starters only
 */
export const calculateActivePoints = (state: RootState): number => {
  return state.roster.players.starters.reduce((sum, player) => {
    const matchPoints = Object.values(player.matchPoints).reduce(
      (total, points) => total + points,
      0
    );
    return sum + matchPoints;
  }, 0);
};

/**
 * Get total points from all signed players (including bench)
 */
export const calculateTotalPoints = (state: RootState): number => {
  return state.roster.players.signed.reduce((sum, player) => {
    const matchPoints = Object.values(player.matchPoints).reduce(
      (total, points) => total + points,
      0
    );
    return sum + matchPoints;
  }, 0);
};

/**
 * Check if a player can be replaced
 * Can only replace unsigned players (not signed)
 */
export const canRemovePlayer = (player: RosterPlayer): boolean => {
  return player.status === "unsigned";
};

/**
 * Check if roster is eligible for Round 16 lock
 */
export const isEligibleForRound16Lock = (state: RootState): boolean => {
  const validation = validateRoster(state);
  return validation.isValid && state.roster.players.signed.length >= 11;
};
