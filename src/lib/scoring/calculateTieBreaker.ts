// ==============================
// Tiebreaker — "In-House Shootout"
// Rules ref: docs/rules/rules.md §4 (Tie-Breaker)
// ==============================

import type { PlayerScore } from "../../types/fantasyScore";

/**
 * "In-House Shootout" tiebreaker formula.
 *
 * Formula: sum of goals by the top-5 scoring STARTER Players
 *          minus goals conceded by the user's STARTER GK.
 *
 * Rules:
 *   - Squads are excluded — only Player goals count
 *   - Only non-shootout goals count (shootoutGoals excluded)
 *   - Top 5 ranked by fantasy points, not by goals (better statistical variation in winner)
 *   - Higher result wins
 *
 * @param starterScores     All STARTER PlayerScores for the comparison period
 * @param starterGoals      Map of playerId → cumulative non-shootout goals
 * @param gkGoalsConceded   Goals conceded by the user's STARTER GK over the same period
 */
export function calculateTieBreaker(
  starterScores:    PlayerScore[],
  starterGoals:     Map<number, number>,
  gkGoalsConceded:  number
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
