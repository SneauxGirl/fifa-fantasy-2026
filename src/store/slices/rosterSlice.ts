import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RosterPlayer, RosterSquad } from "../../types/match";

/**
 * Roster state shape:
 * - available: players not in roster (filterable by position)
 * - unsigned: players dragged to roster but not locked
 * - signed: locked to roster (11-18 players)
 * - starters: 11 active players (subset of signed)
 * - bench: 7 backup players (subset of signed)
 * - eliminated: was signed, now ineligible
 *
 * Squads follow similar pattern (max 4 signed at a time)
 */

interface RosterState {
  players: {
    available: RosterPlayer[];
    unsigned: RosterPlayer[];
    signed: RosterPlayer[];
    starters: RosterPlayer[];
    bench: RosterPlayer[];
    eliminated: RosterPlayer[];
  };
  squads: {
    available: RosterSquad[];
    unsigned: RosterSquad[];
    signed: RosterSquad[];
    eliminated: RosterSquad[];
  };
  validation: {
    roundLocked: boolean;
    minSignedCount: number;
    minSquadCount: number;
  };
}

const initialState: RosterState = {
  players: {
    available: [],
    unsigned: [],
    signed: [],
    starters: [],
    bench: [],
    eliminated: [],
  },
  squads: {
    available: [],
    unsigned: [],
    signed: [],
    eliminated: [],
  },
  validation: {
    roundLocked: false,
    minSignedCount: 11,
    minSquadCount: 4,
  },
};

const rosterSlice = createSlice({
  name: "roster",
  initialState,
  reducers: {
    // Player operations
    movePlayerToUnsigned: (state, action: PayloadAction<RosterPlayer>) => {
      const player = action.payload;
      // Remove from available and all other states (prevent duplicates)
      state.players.available = state.players.available.filter(p => p.id !== player.id);
      state.players.unsigned = state.players.unsigned.filter(p => p.id !== player.id);
      state.players.signed = state.players.signed.filter(p => p.id !== player.id);
      state.players.starters = state.players.starters.filter(p => p.id !== player.id);
      state.players.bench = state.players.bench.filter(p => p.id !== player.id);
      // Add to unsigned only if not already there
      if (!state.players.unsigned.some(p => p.id === player.id)) {
        state.players.unsigned.push({ ...player, status: "unsigned" });
      }
    },

    movePlayerToAvailable: (state, action: PayloadAction<RosterPlayer>) => {
      const player = action.payload;
      // Remove from whatever state they're currently in, add to available
      state.players.unsigned = state.players.unsigned.filter(p => p.id !== player.id);
      state.players.signed = state.players.signed.filter(p => p.id !== player.id);
      state.players.starters = state.players.starters.filter(p => p.id !== player.id);
      state.players.bench = state.players.bench.filter(p => p.id !== player.id);
      state.players.available.push({ ...player, status: "available" });
    },

    signPlayer: (state, action: PayloadAction<RosterPlayer>) => {
      const player = action.payload;
      // Only allowed if unsigned
      if (player.status === "unsigned") {
        state.players.unsigned = state.players.unsigned.filter(p => p.id !== player.id);
        state.players.signed.push({ ...player, status: "signed" });
      }
    },

    movePlayerToStarters: (state, action: PayloadAction<RosterPlayer>) => {
      const player = action.payload;
      // Can only move signed players to starters, and only if 11 total aren't already starters
      if (player.status === "signed" && state.players.starters.length < 11) {
        state.players.signed = state.players.signed.filter(p => p.id !== player.id);
        state.players.starters.push({ ...player, status: "starter" });
      }
    },

    movePlayerToBench: (state, action: PayloadAction<RosterPlayer>) => {
      const player = action.payload;
      // Move from starters to bench
      if (player.status === "starter") {
        state.players.starters = state.players.starters.filter(p => p.id !== player.id);
        state.players.bench.push({ ...player, status: "bench" });
      }
    },

    movePlayerToStartersFromBench: (state, action: PayloadAction<RosterPlayer>) => {
      const player = action.payload;
      // Move from bench to starters (swap in active lineup)
      if (player.status === "bench" && state.players.starters.length < 11) {
        state.players.bench = state.players.bench.filter(p => p.id !== player.id);
        state.players.starters.push({ ...player, status: "starter" });
      }
    },

    movePlayerToEliminated: (state, action: PayloadAction<{ player: RosterPlayer; reason: string }>) => {
      const { player, reason } = action.payload;
      // Only signed players can be eliminated
      if (player.status === "signed") {
        state.players.signed = state.players.signed.filter(p => p.id !== player.id);
        state.players.eliminated.push({
          ...player,
          status: "eliminated",
          eliminatedReason: reason as any,
        });
      }
    },

    // Squad operations
    moveSquadToUnsigned: (state, action: PayloadAction<RosterSquad>) => {
      const squad = action.payload;
      state.squads.available = state.squads.available.filter(s => s.id !== squad.id);
      // Only add if not already there
      if (!state.squads.unsigned.some(s => s.id === squad.id)) {
        state.squads.unsigned.push({ ...squad, status: "unsigned" });
      }
    },

    moveSquadToAvailable: (state, action: PayloadAction<RosterSquad>) => {
      const squad = action.payload;
      // Remove from any state and add to available
      state.squads.unsigned = state.squads.unsigned.filter(s => s.id !== squad.id);
      state.squads.signed = state.squads.signed.filter(s => s.id !== squad.id);
      // Only add if not already there
      if (!state.squads.available.some(s => s.id === squad.id)) {
        state.squads.available.push({ ...squad, status: "available" });
      }
    },

    signSquad: (state, action: PayloadAction<RosterSquad>) => {
      const squad = action.payload;
      // Allow signing from available or unsigned, max 4 signed
      if (state.squads.signed.length < 4) {
        if (squad.status === "available") {
          state.squads.available = state.squads.available.filter(s => s.id !== squad.id);
          state.squads.signed.push({ ...squad, status: "signed" });
        } else if (squad.status === "unsigned") {
          state.squads.unsigned = state.squads.unsigned.filter(s => s.id !== squad.id);
          state.squads.signed.push({ ...squad, status: "signed" });
        }
      }
    },

    moveSquadToEliminated: (state, action: PayloadAction<RosterSquad>) => {
      const squad = action.payload;
      // Move entire squad to eliminated (and all its players)
      if (squad.status === "signed") {
        state.squads.signed = state.squads.signed.filter(s => s.id !== squad.id);
        state.squads.eliminated.push({ ...squad, status: "eliminated" });

        // Also eliminate all players from this squad
        const playersFromSquad = [
          ...state.players.starters.filter(p => p.teamId === squad.teamId),
          ...state.players.bench.filter(p => p.teamId === squad.teamId),
          ...state.players.signed.filter(p => p.teamId === squad.teamId),
        ];

        playersFromSquad.forEach(player => {
          state.players.starters = state.players.starters.filter(p => p.id !== player.id);
          state.players.bench = state.players.bench.filter(p => p.id !== player.id);
          state.players.signed = state.players.signed.filter(p => p.id !== player.id);
          state.players.eliminated.push({ ...player, status: "eliminated", eliminatedReason: "teamEliminated" });
        });
      }
    },

    // Initialization
    initializeRoster: (state, action: PayloadAction<{ players: RosterPlayer[]; squads: RosterSquad[] }>) => {
      // Keep all squads in available, but preserve their status (available or eliminated)
      state.players.available = action.payload.players.map(p => p);
      state.squads.available = action.payload.squads.map(s => s);
    },

    // Validation
    setRoundLocked: (state, action: PayloadAction<boolean>) => {
      state.validation.roundLocked = action.payload;
    },
  },
});

export const {
  movePlayerToUnsigned,
  movePlayerToAvailable,
  signPlayer,
  movePlayerToStarters,
  movePlayerToBench,
  movePlayerToStartersFromBench,
  movePlayerToEliminated,
  moveSquadToUnsigned,
  moveSquadToAvailable,
  signSquad,
  moveSquadToEliminated,
  initializeRoster,
  setRoundLocked,
} = rosterSlice.actions;

export default rosterSlice.reducer;
