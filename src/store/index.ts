// ==============================
// Redux Store
// ==============================

import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";

import rosterReducer from "./slices/rosterSlice";
import matchesReducer from "./slices/matchesSlice";
import uiReducer from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    roster: rosterReducer,
    matches: matchesReducer,
    ui: uiReducer,
  },
});

// ─── Typed helpers ────────────────────────────────────────────────────────────
// Use these throughout the app instead of the plain useDispatch / useSelector hooks.

export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch               = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
