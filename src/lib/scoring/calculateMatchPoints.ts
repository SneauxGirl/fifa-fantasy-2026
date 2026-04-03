// ==============================
// Match-Level Point Helpers
// Rules ref: docs/rules/rules.md §5
// ==============================
// Atomic scoring constants and helper functions.
// These are the building blocks used by calculatePlayerScore
// and calculateSquadScore.
// All functions are pure — no side effects, no Redux imports.
// ==============================

import type { Position } from "../../types/player";

// ─── Scoring constants ────────────────────────────────────────────────────────

/** Goal points by registered position (most forward role applies). */
export const GOAL_POINTS: Record<Position, number> = {
  FWD: 3,
  MID: 4,
  DEF: 5,
  GK:  7,
};

/** Clean sheet bonus points by position. Requires ≥ 45 minutes played. */
export const CLEAN_SHEET_POINTS: Record<Position, number> = {
  GK:  7,
  DEF: 4,
  MID: 1,
  FWD: 0,  // FWD is never eligible; stored as 0 so cleanSheet: null handles the guard
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

// REMOVE #TODO
/** +1 per 5 minutes played, rounded up. Examples: 1→1, 5→1, 6→2, 45→9, 46→10. */
export function calcMinutesPoints(minutesPlayed: number): number {
  return Math.ceil(minutesPlayed / 5);
}

/** Goal points based on registered position. Includes on-field penalty goals. */
export function calcGoalPoints(position: Position, goals: number): number {
  return goals * GOAL_POINTS[position];
}

/**
 * Clean sheet points for a player.
 * Returns 0 for false or null.
 *   null = not eligible (FWD always; any position if played < 45 min or subbed before concede)
 */
export function calcCleanSheetPoints(
  position:   Position,
  cleanSheet: boolean | null
): number {
  if (!cleanSheet) return 0;
  return CLEAN_SHEET_POINTS[position];
}

/**
 * Hat trick bonus: +21 if the player scored ≥ 3 goals in one match.
 * `goals` in PlayerMatchStats includes on-field penalty goals, excludes shootout goals.
 * Awarded once per match.
 */
export function calcHatTrickBonus(goals: number): number {
  return goals >= 3 ? 21 : 0;
}
