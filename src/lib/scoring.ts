// ==============================
// Fantasy Scoring Logic
// All rules sourced from docs/rules/rules.md
// ==============================

import type { Player, PlayerMatchStats, Position } from "../types/player";
import type { Team } from "../types/team";
import type { Match } from "../types/match";
import type {
  PlayerScore,
  PlayerScoreBreakdown,
  TeamScore,
  TeamScoreBreakdown,
  WeeklyScore,
} from "../types/fantasyScore";

// ─── Constants ───────────────────────────────────────────────────────────────

const GOAL_POINTS: Record<Position, number> = {
  FWD: 3,
  MID: 4,
  DEF: 5,
  GK:  7,
};

const CLEAN_SHEET_POINTS: Record<Position, number> = {
  GK:  7,
  DEF: 4,
  MID: 1,
  FWD: 0,
};

// ─── Player helpers ───────────────────────────────────────────────────────────

/** +1 per 5 minutes played, rounded up. 1 min → 1, 5 min → 1, 6 min → 2. */
export function calcMinutesPoints(minutesPlayed: number): number {
  return Math.ceil(minutesPlayed / 5);
}

/** Points for goals scored, based on registered position. */
export function calcGoalPoints(position: Position, goals: number): number {
  return goals * GOAL_POINTS[position];
}

/**
 * Clean sheet points for a player.
 * Returns 0 if cleanSheet is false or null (null = not eligible: FWD always, or played < 45 min).
 */
export function calcCleanSheetPoints(
  position: Position,
  cleanSheet: boolean | null
): number {
  if (!cleanSheet) return 0;
  return CLEAN_SHEET_POINTS[position];
}

/**
 * Hat trick bonus: +21 if the player scored ≥ 3 goals in a single match.
 * Uses the `goals` field (inclusive of on-field penalty goals, exclusive of shootout goals).
 */
export function calcHatTrickBonus(goals: number): number {
  return goals >= 3 ? 21 : 0;
}

// ─── Per-match player score ───────────────────────────────────────────────────

/**
 * Calculate a player's fantasy score for a single match.
 *
 * Assumptions baked into the data contract (enforced by null semantics in PlayerMatchStats):
 *   - `goals` already includes on-field penalty goals (no separate addition for penaltiesScored)
 *   - `saves`, `penaltiesSaved`, `shootoutSaves` are null for outfield players
 *   - `penaltiesMissed` is null for GK (rule excludes GK)
 *   - `shootout*` fields are null when the match did not reach a penalty shootout
 *
 * @param isSubstitute  true = player was added as a SUBSTITUTE at R16; score is halved
 */
export function calcPlayerMatchScore(
  player: Player,
  stats: PlayerMatchStats,
  isSubstitute = false,
  matchId?: number
): PlayerScore {
  const { position } = player;

  const minutesPoints    = calcMinutesPoints(stats.minutesPlayed);
  const goalPoints       = calcGoalPoints(position, stats.goals);
  const assistPoints     = stats.assists * 2;
  const cleanSheetPoints = calcCleanSheetPoints(position, stats.cleanSheet);

  // GK only — null for outfield players
  const savePoints        = (stats.saves ?? 0) * 1;
  const penaltySavePoints = (stats.penaltiesSaved ?? 0) * 5;

  // non-GK only — null for GK
  const penaltyMissPoints = (stats.penaltiesMissed ?? 0) * -2;

  // Hat trick uses goals count (includes on-field penalties, excludes shootout)
  const hatTrickBonus = calcHatTrickBonus(stats.goals);

  // -3 per yellow; -7 per red (direct or second yellow); yellow-red = -10 total
  const yellowCardPoints = stats.yellowCards * -3;
  const redCardPoints    = stats.redCards    * -7;

  const ownGoalPoints = stats.ownGoals * -3;

  // Shootout fields are null when no shootout occurred — treat null as 0
  const shootoutGoalPoints = (stats.shootoutGoals  ?? 0) *  1;
  const shootoutSavePoints = (stats.shootoutSaves  ?? 0) *  2;
  const shootoutMissPoints = (stats.shootoutMisses ?? 0) * -2;

  const breakdown: PlayerScoreBreakdown = {
    minutesPoints,
    goalPoints,
    assistPoints,
    cleanSheetPoints,
    savePoints,
    penaltySavePoints,
    penaltyMissPoints,
    hatTrickBonus,
    yellowCardPoints,
    redCardPoints,
    ownGoalPoints,
    shootoutGoalPoints,
    shootoutSavePoints,
    shootoutMissPoints,
  };

  const rawTotal =
    minutesPoints    +
    goalPoints       +
    assistPoints     +
    cleanSheetPoints +
    savePoints       +
    penaltySavePoints +
    penaltyMissPoints +
    hatTrickBonus    +
    yellowCardPoints +
    redCardPoints    +
    ownGoalPoints    +
    shootoutGoalPoints +
    shootoutSavePoints +
    shootoutMissPoints;

  // SUBSTITUTE players added at R16 receive 50% of all points for remainder of tournament
  const totalPoints = isSubstitute ? Math.round(rawTotal * 0.5) : rawTotal;

  return { playerId: player.id, matchId, totalPoints, isSubstitute, breakdown };
}

// ─── Per-match team score ─────────────────────────────────────────────────────

/**
 * Calculate a Champion team's fantasy score for a single match.
 *
 * Notes:
 *   - goalsFor / goalsAgainst include extra-time goals for AET / PEN matches,
 *     but never penalty shootout goals (shootout goals are not official goals in football).
 *   - For PEN matches, teams are level after FT + ET; the shootout determines the winner.
 *   - Advancement bonuses are NOT calculated here — they are awarded at end-of-week
 *     by the Redux store once round advancement is confirmed.
 *   - SUBSTITUTE teams (added at R16) have their total halved.
 *
 * @param isSubstitute  true = team was added as a SUBSTITUTE at R16; score is halved
 */
export function calcTeamMatchScore(
  team: Team,
  match: Match,
  isSubstitute: boolean,
  advancementBonus = 0
): TeamScore {
  const isHome = match.homeTeam.code === team.code;
  const status = match.status.short;

  // Fulltime goals (all match types)
  const ftGoalsFor     = (isHome ? match.score.fulltime.home  : match.score.fulltime.away)  ?? 0;
  const ftGoalsAgainst = (isHome ? match.score.fulltime.away  : match.score.fulltime.home)  ?? 0;

  // Add extra-time goals for AET / PEN — shootout goals are NOT added (not official goals)
  const etGoalsFor     = (status === "AET" || status === "PEN")
    ? (isHome ? match.score.extratime.home : match.score.extratime.away) ?? 0
    : 0;
  const etGoalsAgainst = (status === "AET" || status === "PEN")
    ? (isHome ? match.score.extratime.away : match.score.extratime.home) ?? 0
    : 0;

  const goalsFor     = ftGoalsFor     + etGoalsFor;
  const goalsAgainst = ftGoalsAgainst + etGoalsAgainst;

  // Win / draw / loss determination
  let won: boolean;
  let drew: boolean;

  if (status === "PEN") {
    // Teams are level on goals after FT + ET; shootout decides the winner
    const penFor     = (isHome ? match.score.penalty.home : match.score.penalty.away) ?? 0;
    const penAgainst = (isHome ? match.score.penalty.away : match.score.penalty.home) ?? 0;
    won  = penFor > penAgainst;
    drew = false; // shootout always produces a winner
  } else {
    won  = goalsFor > goalsAgainst;
    drew = goalsFor === goalsAgainst;
  }

  const matchResultPoints  = won ? 10 : drew ? 5 : 0;
  const goalsForPoints     = goalsFor     *  2;
  const goalsConcededPoints = goalsAgainst * -1;
  const cleanSheetBonus    = goalsAgainst === 0 ? 5 : 0;

  const breakdown: TeamScoreBreakdown = {
    matchResultPoints,
    goalsForPoints,
    goalsConcededPoints,
    cleanSheetBonus,
    advancementBonus,
  };

  const rawTotal =
    matchResultPoints  +
    goalsForPoints     +
    goalsConcededPoints +
    cleanSheetBonus    +
    advancementBonus;

  // SUBSTITUTE teams added at R16 receive 50% of all points for remainder of tournament
  const totalPoints = isSubstitute ? Math.round(rawTotal * 0.5) : rawTotal;

  return { teamId: team.id, matchId: match.id, totalPoints, isSubstitute, breakdown };
}

// ─── Weekly aggregate ─────────────────────────────────────────────────────────

/**
 * Aggregate player and team scores into a weekly total.
 * All scores passed in should already be filtered to STARTERS only.
 * The 50% SUBSTITUTE multiplier is already baked into each individual score.
 */
export function calcWeeklyScore(
  week: number,
  starterPlayerScores: PlayerScore[],
  championTeamScores: TeamScore[]
): WeeklyScore {
  const playerPoints = starterPlayerScores.reduce((sum, s) => sum + s.totalPoints, 0);
  const teamPoints   = championTeamScores.reduce((sum, s) => sum + s.totalPoints, 0);

  const mvp = starterPlayerScores.reduce<PlayerScore | null>(
    (best, s) => (!best || s.totalPoints > best.totalPoints ? s : best),
    null
  );

  return {
    week,
    playerPoints,
    teamPoints,
    totalPoints: playerPoints + teamPoints,
    mvpPlayerId: mvp?.playerId,
  };
}

// ─── Tiebreaker ───────────────────────────────────────────────────────────────

/**
 * "In-House Shootout" tiebreaker.
 * Formula: sum of goals by top-5 scoring STARTER players (ranked by fantasy points)
 *          minus goals conceded by the user's STARTER GK.
 *
 * Champion teams are excluded. Only non-shootout player goals count.
 *
 * @param starterScores    All STARTER PlayerScores for the period being compared
 * @param starterGoals     Map of playerId → total (non-shootout) goals scored
 * @param gkGoalsConceded  Total goals conceded by the user's STARTER GK over the same period
 */
export function calcTiebreaker(
  starterScores: PlayerScore[],
  starterGoals: Map<number, number>,
  gkGoalsConceded: number
): number {
  const top5 = [...starterScores]
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 5);

  const top5Goals = top5.reduce(
    (sum, s) => sum + (starterGoals.get(s.playerId) ?? 0),
    0
  );

  return top5Goals - gkGoalsConceded;
}
