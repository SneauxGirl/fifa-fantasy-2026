// ==============================
// Redux Store
// ==============================

import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";

import lineupReducer from "./slices/lineupSlice";
import matchReducer  from "./slices/matchSlice";
import aiReducer     from "./slices/aiSlice";
import rosterReducer from "./slices/rosterSlice";

export const store = configureStore({
  reducer: {
    lineup:  lineupReducer,
    matches: matchReducer,
    ai:      aiReducer,
    roster:  rosterReducer,
  },
});

// ─── Typed helpers ────────────────────────────────────────────────────────────
// Use these throughout the app instead of the plain useDispatch / useSelector hooks.

export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch               = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
