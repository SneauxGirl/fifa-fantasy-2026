// ==============================
// Match Slice
// Manages: match list, loading state
// Phase 1: seeded from mock JSON
// Phase 6: updated via WebSocket live events
// ==============================

import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Match } from "../../types/match";

// ─── State shape ─────────────────────────────────────────────────────────────

type LoadStatus = "idle" | "loading" | "succeeded" | "failed";

interface MatchState {
  matches: Match[];
  status:  LoadStatus;
  error:   string | null;
}

// ─── Initial state ───────────────────────────────────────────────────────────

const initialState: MatchState = {
  matches: [],
  status:  "idle",
  error:   null,
};

// ─── Slice ───────────────────────────────────────────────────────────────────

const matchSlice = createSlice({
  name: "matches",
  initialState,
  reducers: {
    // Phase 1: seed all matches from mock JSON
    // Phase 3: replaced by async thunk using apiFootball.ts
    setMatches(state, action: PayloadAction<Match[]>) {
      state.matches = action.payload;
      state.status  = "succeeded";
      state.error   = null;
    },

    // Phase 6: update a single match in place (WebSocket event)
    updateMatch(state, action: PayloadAction<Match>) {
      const idx = state.matches.findIndex((m) => m.id === action.payload.id);
      if (idx !== -1) {
        state.matches[idx] = action.payload;
      }
    },

    // Manually set loading status (used by async thunks in Phase 3+)
    setStatus(state, action: PayloadAction<LoadStatus>) {
      state.status = action.payload;
    },

    setError(state, action: PayloadAction<string | null>) {
      state.error  = action.payload;
      state.status = "failed";
    },
  },
});

export const { setMatches, updateMatch, setStatus, setError } = matchSlice.actions;

export default matchSlice.reducer;
