// ==============================
// Scoring Selectors
// Derived / computed state — bridges raw Redux data and the scoring engine.
// ==============================
// Architecture rule: scoring functions are NEVER called inside reducers.
// Raw data lives in slices. Computed scores live here, derived on read.
//
// Phase 1: lineup + match selectors only (no score computation yet —
//          player data is not in Redux; it comes from mock JSON directly).
// Phase 3: replace TODO stubs below once players are loaded from the API
//          into a playerSlice or passed as arguments.
// ==============================

import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../index";
import type { Match } from "../../types/match";

// ─── Lineup selectors ─────────────────────────────────────────────────────────

export const selectCurrentRound = (state: RootState) =>
  state.lineup.currentRound;

export const selectSquads = (state: RootState) =>
  state.lineup.squads;

export const selectRoster = (state: RootState) =>
  state.lineup.roster;

export const selectWeeklyStarters = (state: RootState) =>
  state.lineup.weeklyStarters;

/** Active (non-ELIMINATED) Squads only. */
export const selectActiveSquads = createSelector(
  selectSquads,
  (squads) => squads.filter((t) => !t.isEliminated)
);

/** Non-ELIMINATED Players on the ROSTER. */
export const selectActiveRosterPlayers = createSelector(
  selectRoster,
  (roster) => roster.filter((p) => !p.isEliminated)
);

/** Active ROSTER Player IDs that are currently selected as weekly STARTERS. */
export const selectActiveStarterIds = createSelector(
  selectWeeklyStarters,
  selectActiveRosterPlayers,
  (starterIds, activeRoster) => {
    const activeIds = new Set(activeRoster.map((p) => p.playerId));
    return starterIds.filter((id) => activeIds.has(id));
  }
);

/** SUBSTITUTE-flagged Players — used by the 50% multiplier. */
export const selectSubstitutePlayerIds = createSelector(
  selectRoster,
  (roster) => new Set(roster.filter((p) => p.isSubstitute).map((p) => p.playerId))
);

/** SUBSTITUTE-flagged Squads — used by the 50% multiplier. */
export const selectSubstituteSquadIds = createSelector(
  selectSquads,
  (squads) => new Set(squads.filter((t) => t.isSubstitute).map((t) => t.teamId))
);

// ─── Match selectors ──────────────────────────────────────────────────────────

export const selectMatches = (state: RootState) =>
  state.matches.matches;

export const selectMatchStatus = (state: RootState) =>
  state.matches.status;

export const selectLiveMatches = createSelector(
  selectMatches,
  (matches): Match[] =>
    matches.filter((m) =>
      ["1H", "HT", "2H", "ET", "BT", "P"].includes(m.status.short)
    )
);

export const selectUpcomingMatches = createSelector(
  selectMatches,
  (matches): Match[] =>
    matches.filter((m) => m.status.short === "NS")
);

export const selectFinishedMatches = createSelector(
  selectMatches,
  (matches): Match[] =>
    matches.filter((m) =>
      ["FT", "AET", "PEN"].includes(m.status.short)
    )
);

/**
 * All matches that contribute to scoring: finished + partial/abandoned.
 * Partial statuses (SUSP/ABD/INT) award goals-based points but no result points.
 * Used by score computation selectors in Phase 3+.
 */
export const selectScoredMatches = createSelector(
  selectMatches,
  (matches): Match[] =>
    matches.filter((m) =>
      ["FT", "AET", "PEN", "SUSP", "ABD", "INT"].includes(m.status.short)
    )
);

// ─── Score selectors (Phase 3+) ───────────────────────────────────────────────
// TODO Phase 3: Implement once player data is loaded into Redux (playerSlice).
//
// Intended shape:
//
//   export const selectPlayerScores = createSelector(
//     selectActiveStarterIds,
//     selectSubstitutePlayerIds,
//     selectScoredMatches,
//     (state: RootState) => state.players.byId,   // ← needs playerSlice
//     (starterIds, substituteIds, matches, playersById) =>
//       starterIds.map((id) => {
//         const player = playersById[id];
//         const stats  = derivePlayerStats(player, matches); // from apiFootball normalizer
//         return calculatePlayerScore(player, stats, substituteIds.has(id));
//       })
//   );
//
//   export const selectSquadScores = createSelector( ... );
//   export const selectWeeklyScore = createSelector( ... );
//   export const selectCumulativeTournamentScore = createSelector( ... );
