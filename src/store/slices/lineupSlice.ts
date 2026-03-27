// ==============================
// Lineup Slice
// Manages: Squad selections, Player ROSTER, weekly STARTER picks
// Rules ref: docs/rules/rules.md §1 & §2
// ==============================

import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { TournamentRound } from "../../types/fantasyScore";
import type { Position } from "../../types/player";
import {
  validateRosterPlayerAdd,
  validateSquadAdd,
  validateStarterSelection,
} from "../../lib/scoring/rosterRules";

// ─── State shape ─────────────────────────────────────────────────────────────

export interface RosterSquadEntry {
  teamId:       number;
  isSubstitute: boolean; // true = added at R16; scores at 50%
  isEliminated: boolean; // true = knocked out; greyed out in UI
}

export interface RosterPlayerEntry {
  playerId:     number;
  isSubstitute: boolean; // true = added at R16; scores at 50%
  isEliminated: boolean; // true = knocked out; greyed out in UI
}

export interface LineupState {
  currentRound:   TournamentRound;
  squads:         RosterSquadEntry[];  // max 4 — auto-STARTER every week
  roster:         RosterPlayerEntry[]; // max 18
  weeklyStarters: number[];            // player IDs selected as STARTERs; max 11
}

// ─── Initial state ───────────────────────────────────────────────────────────

const initialState: LineupState = {
  currentRound:   "group",
  squads:         [],
  roster:         [],
  weeklyStarters: [],
};

// ─── Slice (raw reducers — internal primitives) ───────────────────────────────
// Do not dispatch these directly from UI. Use the validated thunks below instead.

const lineupSlice = createSlice({
  name: "lineup",
  initialState,
  reducers: {
    setCurrentRound(state, action: PayloadAction<TournamentRound>) {
      state.currentRound = action.payload;
    },

    // Internal primitive — use tryAddSquad() from UI
    _addSquad(state, action: PayloadAction<RosterSquadEntry>) {
      state.squads.push(action.payload);
    },

    eliminateSquad(state, action: PayloadAction<number>) {
      const entry = state.squads.find((t) => t.teamId === action.payload);
      if (entry) entry.isEliminated = true;
    },

    // Internal primitive — use tryAddRosterPlayer() from UI
    _addRosterPlayer(state, action: PayloadAction<RosterPlayerEntry>) {
      state.roster.push(action.payload);
    },

    eliminatePlayer(state, action: PayloadAction<number>) {
      const entry = state.roster.find((p) => p.playerId === action.payload);
      if (entry) entry.isEliminated = true;
    },

    // Internal primitive — use trySetWeeklyStarters() from UI
    _setWeeklyStarters(state, action: PayloadAction<number[]>) {
      state.weeklyStarters = action.payload;
    },

    resetLineup() {
      return initialState;
    },
  },
});

// Export only the primitives that are safe to call directly
export const {
  setCurrentRound,
  eliminateSquad,
  eliminatePlayer,
  resetLineup,
} = lineupSlice.actions;

const { _addSquad, _addRosterPlayer, _setWeeklyStarters } = lineupSlice.actions;

// ─── Validated thunks ────────────────────────────────────────────────────────
// All roster mutation from UI goes through these — not the raw reducers above.
// Validation logic lives in lib/scoring/rosterRules.ts (game engine, not Redux).
//
// Using local partial state type to avoid circular import with store/index.ts.
// TODO Phase 2: extract AppThunk into store/storeTypes.ts and use throughout.

type GetLineupState = () => { lineup: LineupState };
type DispatchFn     = (action: unknown) => void;

export interface ThunkResult {
  allowed:  boolean;
  reason?:  string;
}

/**
 * Validated Squad add.
 * Enforces round gating, max-4 cap, and duplicate guard.
 * Sets isSubstitute automatically from the current round.
 */
export function tryAddSquad(teamId: number) {
  return (dispatch: DispatchFn, getState: GetLineupState): ThunkResult => {
    const { lineup } = getState();
    const result = validateSquadAdd(lineup.squads, teamId, lineup.currentRound);
    if (!result.allowed) return { allowed: false, reason: result.reason };
    dispatch(_addSquad({ teamId, isSubstitute: result.isSubstitute, isEliminated: false }));
    return { allowed: true };
  };
}

/**
 * Validated roster Player add.
 * Enforces round gating, max-18 cap, duplicate guard, and GK cap (if position provided).
 * Sets isSubstitute automatically from the current round.
 *
 * @param position       Optional — used to enforce max-3 GK-in-ROSTER rule.
 * @param currentGkCount Optional — current number of GKs on the ROSTER.
 */
export function tryAddRosterPlayer(
  playerId:        number,
  position?:       Position,
  currentGkCount?: number
) {
  return (dispatch: DispatchFn, getState: GetLineupState): ThunkResult => {
    const { lineup } = getState();
    const result = validateRosterPlayerAdd(
      lineup.roster,
      playerId,
      lineup.currentRound,
      position,
      currentGkCount
    );
    if (!result.allowed) return { allowed: false, reason: result.reason };
    dispatch(_addRosterPlayer({ playerId, isSubstitute: result.isSubstitute, isEliminated: false }));
    return { allowed: true };
  };
}

/**
 * Validated weekly STARTER selection.
 * Rejects ELIMINATED Players, non-roster Players, and selections over 11.
 * Enforces max-1 GK STARTER rule when positionById is provided.
 * Dispatches only the valid subset — partial success is allowed.
 *
 * @param positionById  Optional — map of playerId → Position for GK cap enforcement.
 */
export function trySetWeeklyStarters(
  proposedIds:   number[],
  positionById?: Map<number, Position>
) {
  return (
    dispatch: DispatchFn,
    getState: GetLineupState
  ): ThunkResult & { rejected?: Array<{ id: number; reason: string }> } => {
    const { lineup } = getState();
    const rosterIds     = lineup.roster.map((p) => p.playerId);
    const eliminatedIds = new Set(
      lineup.roster.filter((p) => p.isEliminated).map((p) => p.playerId)
    );

    const { validIds, rejected } = validateStarterSelection(
      rosterIds,
      eliminatedIds,
      proposedIds,
      positionById
    );
    dispatch(_setWeeklyStarters(validIds));

    return rejected.length > 0
      ? { allowed: true, reason: `${rejected.length} selection(s) were rejected.`, rejected }
      : { allowed: true };
  };
}

export default lineupSlice.reducer;
