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
import type { Match, RosterPlayer, RosterSquad } from "../../types/match";

// ─── Roster selectors ──────────────────────────────────────────────────────────

export const selectSignedSquads = (state: RootState) =>
  state.roster.squads.signed;

export const selectSignedPlayers = (state: RootState) =>
  state.roster.players.signed;

export const selectStarterPlayers = (state: RootState) =>
  state.roster.players.starters;

export const selectUnsignedPlayers = (state: RootState) =>
  state.roster.players.unsigned;

/** Signed squad team IDs. */
export const selectSignedSquadIds = createSelector(
  selectSignedSquads,
  (squads: RosterSquad[]) => squads.map((s) => s.teamId)
);

/** Signed player team IDs. */
export const selectSignedPlayerTeamIds = createSelector(
  selectSignedPlayers,
  (players: RosterPlayer[]) => players.map((p) => p.teamId)
);

/** Bench players (unsigned + signed, but not starters). */
export const selectBenchPlayers = createSelector(
  selectUnsignedPlayers,
  selectSignedPlayers,
  (unsigned: RosterPlayer[], signed: RosterPlayer[]) => [...unsigned, ...signed]
);

/** Starters grouped by position. */
export const selectStartersGroupedByPosition = createSelector(
  selectStarterPlayers,
  (starters: RosterPlayer[]) => ({
    gk: starters.filter((p) => p.position === "GK"),
    def: starters.filter((p) => p.position === "DEF"),
    mid: starters.filter((p) => p.position === "MID"),
    fwd: starters.filter((p) => p.position === "FWD"),
  })
);

/** Active (non-ELIMINATED) Squads only. */
export const selectActiveSquads = createSelector(
  selectSignedSquads,
  (squads: RosterSquad[]) => squads.filter((t) => t.status !== "eliminated")
);

/** Non-ELIMINATED Players on the ROSTER. */
export const selectActiveRosterPlayers = createSelector(
  selectSignedPlayers,
  (roster: RosterPlayer[]) => roster.filter((p) => p.status !== "eliminated")
);

/** Active STARTER Player IDs. */
export const selectActiveStarterIds = createSelector(
  selectStarterPlayers,
  selectActiveRosterPlayers,
  (starters: RosterPlayer[], activeRoster: RosterPlayer[]) => {
    const activeIds = new Set(activeRoster.map((p) => p.playerId));
    return starters.map((s) => s.playerId).filter((id) => activeIds.has(id));
  }
);

/** Roster object with signed squads and players for match card modal. */
export const selectMatchRoster = createSelector(
  selectSignedSquads,
  selectSignedPlayers,
  (squads: RosterSquad[], players: RosterPlayer[]) => ({
    squads,
    players,
  })
);

// ─── Match selectors ──────────────────────────────────────────────────────────

export const selectAllMatches = (state: RootState) =>
  state.matches.allMatches;

export const selectRosterMatches = (state: RootState) =>
  state.matches.rosterMatches;

export const selectLiveMatches = createSelector(
  selectAllMatches,
  (matches: Match[]): Match[] =>
    matches.filter((m: Match) =>
      ["1H", "HT", "2H", "ET", "BT", "P"].includes(m.status.short)
    )
);

export const selectUpcomingMatches = createSelector(
  selectAllMatches,
  (matches: Match[]): Match[] =>
    matches.filter((m: Match) => m.status.short === "NS")
);

export const selectFinishedMatches = createSelector(
  selectAllMatches,
  (matches: Match[]): Match[] =>
    matches.filter((m: Match) =>
      ["FT", "AET", "PEN"].includes(m.status.short)
    )
);

/**
 * All matches that contribute to scoring: finished + partial/abandoned.
 * Partial statuses (SUSP/ABD/INT) award goals-based points but no result points.
 * Used by score computation selectors in Phase 3+.
 */
export const selectScoredMatches = createSelector(
  selectAllMatches,
  (matches: Match[]): Match[] =>
    matches.filter((m: Match) =>
      ["FT", "AET", "PEN", "SUSP", "ABD", "INT"].includes(m.status.short)
    )
);

/** Matches grouped by tournament stage. */
export const selectMatchesByStage = createSelector(
  selectAllMatches,
  (matches: Match[]) => {
    const stages: Record<string, Match[]> = {
      "Group Stage": [],
      "Round of 32": [],
      "Round of 16": [],
      "Quarterfinals": [],
      "Semifinals": [],
      "Final": [],
      "Other": [],
    };

    matches.forEach((match) => {
      const stageName = match.stage?.name || "Other";
      if (stageName.includes("Group")) {
        stages["Group Stage"].push(match);
      } else if (stageName.includes("Round of 32")) {
        stages["Round of 32"].push(match);
      } else if (stageName.includes("Round of 16")) {
        stages["Round of 16"].push(match);
      } else if (stageName.includes("Quarter")) {
        stages["Quarterfinals"].push(match);
      } else if (stageName.includes("Semi")) {
        stages["Semifinals"].push(match);
      } else if (stageName.includes("Final")) {
        stages["Final"].push(match);
      } else {
        stages["Other"].push(match);
      }
    });

    return stages;
  }
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
