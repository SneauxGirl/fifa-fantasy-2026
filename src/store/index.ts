// ==============================
// Redux Store
// ==============================

//REMOVE AI logic and links throughout #TODO

import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";

import rosterReducer from "./slices/rosterSlice";
import matchesReducer from "./slices/matchesSlice";
import uiReducer from "./slices/uiSlice";
import nationTeamsReducer from "./slices/nationTeamsSlice";
import lineupReducer from "./slices/lineupSlice";
import aiReducer from "./slices/aiSlice";
import dataSourceReducer from "./slices/dataSourceSlice";
import { eliminationMiddleware } from "./middleware/eliminationMiddleware";
import type { RootState } from "./types";

export const store = configureStore({
  reducer: {
    roster: rosterReducer,
    matches: matchesReducer,
    ui: uiReducer,
    nationTeams: nationTeamsReducer,
    lineup: lineupReducer,
    ai: aiReducer,
    dataSource: dataSourceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(eliminationMiddleware),
});

// ─── Typed helpers ────────────────────────────────────────────────────────────
// Use these throughout the app instead of the plain useDispatch / useSelector hooks.

export type AppDispatch = typeof store.dispatch;

// Re-export RootState and related types from types.ts for convenience
export type { RootState, UseAppSelector } from "./types";

export const useAppDispatch: () => AppDispatch               = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
