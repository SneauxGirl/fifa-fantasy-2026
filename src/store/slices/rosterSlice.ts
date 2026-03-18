// ==============================
// Roster Slice
// Manages: User's selected squads (4) and players (18 total: 11 starters + 7 inactive)
// Phase 2: Mock roster with test data
// Phase 6: Persist to database / sync with backend
// ==============================

import { createSlice, createSelector } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../index";
import type { RosterSquad, RosterPlayer, RosterMemberStatus } from "../../types/match";

// ─── State shape ──────────────────────────────────────────────────────────

interface RosterState {
  squads: RosterSquad[];  // 4 selected squads
  players: RosterPlayer[]; // 18 selected players (11 starters + 7 inactive)
}

// ─── Initial state ────────────────────────────────────────────────────────

const initialState: RosterState = {
  squads: [],
  players: [],
};

// ─── Slice ────────────────────────────────────────────────────────────────

const rosterSlice = createSlice({
  name: "roster",
  initialState,
  reducers: {
    // Add a squad to the roster (max 4)
    addSquad(state, action: PayloadAction<RosterSquad>) {
      if (state.squads.length < 4) {
        state.squads.push(action.payload);
      }
    },

    // Remove a squad from the roster
    removeSquad(state, action: PayloadAction<number>) {
      state.squads = state.squads.filter(s => s.id !== action.payload);
    },

    // Add a player to the roster (max 18)
    addPlayer(state, action: PayloadAction<RosterPlayer>) {
      if (state.players.length < 18) {
        state.players.push(action.payload);
      }
    },

    // Remove a player from the roster
    removePlayer(state, action: PayloadAction<number>) {
      state.players = state.players.filter(p => p.id !== action.payload);
    },

    // Update a squad's status (starter → inactive, etc.)
    updateSquadStatus(
      state,
      action: PayloadAction<{ squadId: number; status: RosterMemberStatus }>
    ) {
      const squad = state.squads.find(s => s.id === action.payload.squadId);
      if (squad) {
        squad.status = action.payload.status;
      }
    },

    // Update a player's status
    updatePlayerStatus(
      state,
      action: PayloadAction<{ playerId: number; status: RosterMemberStatus }>
    ) {
      const player = state.players.find(p => p.id === action.payload.playerId);
      if (player) {
        player.status = action.payload.status;
      }
    },

    // Record match points for a squad
    recordSquadMatchPoints(
      state,
      action: PayloadAction<{ squadId: number; matchId: string; points: number }>
    ) {
      const squad = state.squads.find(s => s.id === action.payload.squadId);
      if (squad) {
        squad.matchPoints[action.payload.matchId] = action.payload.points;
      }
    },

    // Record match points for a player
    recordPlayerMatchPoints(
      state,
      action: PayloadAction<{ playerId: number; matchId: string; points: number }>
    ) {
      const player = state.players.find(p => p.id === action.payload.playerId);
      if (player) {
        player.matchPoints[action.payload.matchId] = action.payload.points;
      }
    },

    // Initialize roster with test data (Phase 2)
    initializeRosterWithTestData(state, action: PayloadAction<RosterState>) {
      state.squads = action.payload.squads;
      state.players = action.payload.players;
    },
  },
});

export const {
  addSquad,
  removeSquad,
  addPlayer,
  removePlayer,
  updateSquadStatus,
  updatePlayerStatus,
  recordSquadMatchPoints,
  recordPlayerMatchPoints,
  initializeRosterWithTestData,
} = rosterSlice.actions;

export default rosterSlice.reducer;

// ─── Selectors ────────────────────────────────────────────────────────────

export const selectAllSquads = (state: RootState) => state.roster.squads;
export const selectAllPlayers = (state: RootState) => state.roster.players;

export const selectStarterPlayers = createSelector(
  selectAllPlayers,
  players => players.filter(p => p.status === "starter")
);

export const selectInactivePlayers = createSelector(
  selectAllPlayers,
  players => players.filter(p => p.status === "inactive")
);

export const selectEliminatedPlayers = createSelector(
  selectAllPlayers,
  players => players.filter(p => p.status === "eliminated")
);

export const selectStarterSquads = createSelector(
  selectAllSquads,
  squads => squads.filter(s => s.status === "starter")
);

/**
 * Calculate total active points (starters only).
 * Inactive and eliminated members excluded from tally.
 */
export const selectActiveTotalPoints = createSelector(
  [selectStarterSquads, selectStarterPlayers],
  (squads, players) => {
    const squadPoints = squads.reduce((sum, s) => sum + Object.values(s.matchPoints).reduce((a, b) => a + b, 0), 0);
    const playerPoints = players.reduce((sum, p) => sum + Object.values(p.matchPoints).reduce((a, b) => a + b, 0), 0);
    return squadPoints + playerPoints;
  }
);

/**
 * Get roster member by ID (could be squad or player).
 * Returns null if not found.
 */
export const selectRosterMemberById = (id: number, type: "squad" | "player") =>
  createSelector(
    (state: RootState) => state.roster,
    roster => {
      if (type === "squad") {
        return roster.squads.find(s => s.id === id) || null;
      } else {
        return roster.players.find(p => p.id === id) || null;
      }
    }
  );
