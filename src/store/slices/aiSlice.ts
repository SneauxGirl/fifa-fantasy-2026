// ==============================
// AI Slice
// Manages: per-session AI insight cache for Players and Squads
// Phase 1: empty placeholder
// Phase 4: populated via aiService.ts (Claude / OpenAI)
// ==============================

import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { TournamentRound } from "../../types/fantasyScore";

// ─── State shape ─────────────────────────────────────────────────────────────

// ⚠️ TODO (Phase 4 — AI Integration): Review and finalize insight expiration strategy.
//
// Current approach: round-based expiration.
//   - `forRound` ties each insight to the tournament round it was generated in.
//   - Insights from a prior round return null via selectFreshPlayerInsight /
//     selectFreshSquadInsight — invisible to the UI without explicit deletion.
//   - `cachedAt` is retained for display ("insight from 2h ago") but is NOT
//     the expiration key.
//
// Open questions to revisit in Phase 4:
//   1. Should insights also expire when a new match involving that Player/Squad
//      completes? (finer-grained than round-level) yes
//   2. Should there be a manual "refresh insight" button per Player/Squad card? ... maybe? consider cost
//   3. Batch pre-fetch strategy: how many per session to minimise API calls? ... consider WHAT to include or it won't solve anything
//   4. Once auth is added (Phase 7), should insights be userId-scoped or
//      remain session-only? - cost comparison - probably user scoped and rotate through a set number of insights per squad and player, similar to "tips"
//   5. Consider moving selectors below into store/selectors/ if they grow
//      beyond a few lines in Phase 4.

export interface AIInsightEntry {
  text:     string;           // the generated insight text
  cachedAt: string;           // ISO 8601 — for display ("insight from 2h ago"), NOT expiration
  forRound: TournamentRound;  // expiration key — insight is stale if !== currentRound
}

type LoadStatus = "idle" | "loading" | "succeeded" | "failed";

export interface AIState {
  playerInsights: Record<number, AIInsightEntry>; // keyed by playerId
  squadInsights:  Record<number, AIInsightEntry>; // keyed by teamId
  status:         LoadStatus;
  error:          string | null;
}

// ─── Initial state ───────────────────────────────────────────────────────────

const initialState: AIState = {
  playerInsights: {},
  squadInsights:  {},
  status:         "idle",
  error:          null,
};

// ─── Slice ───────────────────────────────────────────────────────────────────

const aiSlice = createSlice({
  name: "ai",
  initialState,
  reducers: {
    // Phase 4: called after a successful AI API response for a Player
    setPlayerInsight(
      state,
      action: PayloadAction<{ playerId: number; text: string; forRound: TournamentRound }>
    ) {
      state.playerInsights[action.payload.playerId] = {
        text:     action.payload.text,
        cachedAt: new Date().toISOString(),
        forRound: action.payload.forRound,
      };
    },

    // Phase 4: called after a successful AI API response for a Squad
    setSquadInsight(
      state,
      action: PayloadAction<{ teamId: number; text: string; forRound: TournamentRound }>
    ) {
      state.squadInsights[action.payload.teamId] = {
        text:     action.payload.text,
        cachedAt: new Date().toISOString(),
        forRound: action.payload.forRound,
      };
    },

    // Clear all cached insights (e.g. session reset or manual refresh)
    clearInsights(state) {
      state.playerInsights = {};
      state.squadInsights  = {};
      state.status         = "idle";
      state.error          = null;
    },

    setStatus(state, action: PayloadAction<LoadStatus>) {
      state.status = action.payload;
    },

    setError(state, action: PayloadAction<string | null>) {
      state.error  = action.payload;
      state.status = "failed";
    },
  },
});

export const {
  setPlayerInsight,
  setSquadInsight,
  clearInsights,
  setStatus,
  setError,
} = aiSlice.actions;

export default aiSlice.reducer;

// ─── Selectors ────────────────────────────────────────────────────────────────
// Kept here (not store/selectors/) because they are tightly coupled to
// AIInsightEntry's shape. Relocate to selectors/ if they expand in Phase 4.

// ⚠️ These selectors are for Phase 4 (AI Integration) and require aiSlice and lineupSlice to be added to store/index.ts
// TODO: Uncomment these when aiSlice and lineupSlice are registered in the Redux store

/**
 * Returns Player insight text only if fresh (generated in the current round).
 * Returns null if missing or stale.
 */
// export const selectFreshPlayerInsight = (playerId: number) =>
//   createSelector(
//     (state: RootState) => state.ai.playerInsights[playerId],
//     (state: RootState) => state.lineup.currentRound,
//     (entry, currentRound): string | null =>
//       entry?.forRound === currentRound ? entry.text : null
//   );

/**
 * Returns Squad insight text only if fresh (generated in the current round).
 * Returns null if missing or stale.
 */
// export const selectFreshSquadInsight = (teamId: number) =>
//   createSelector(
//     (state: RootState) => state.ai.squadInsights[teamId],
//     (state: RootState) => state.lineup.currentRound,
//     (entry, currentRound): string | null =>
//       entry?.forRound === currentRound ? entry.text : null
//   );
