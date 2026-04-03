/**
 * Data Source Slice
 * Manages whether to use mock data or live API
 * Persisted to localStorage for cross-session consistency
 */

import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type DataSource = "mock" | "live";

export interface DataSourceState {
  mode: DataSource;
  apiAvailable: boolean; // Whether API key is configured
}

const initialState: DataSourceState = {
  mode: (localStorage.getItem("ff26_dataSource") as DataSource) || "mock",
  apiAvailable: !!import.meta.env.VITE_API_FOOTBALL_KEY,
};

export const dataSourceSlice = createSlice({
  name: "dataSource",
  initialState,
  reducers: {
    setDataSource: (state, action: PayloadAction<DataSource>) => {
      // Only allow live if API is available
      if (action.payload === "live" && !state.apiAvailable) {
        console.warn("API not available. Staying in mock mode.");
        return;
      }
      state.mode = action.payload;
      localStorage.setItem("ff26_dataSource", action.payload);
    },
    toggleDataSource: (state) => {
      // Only allow switching to live if API is available
      if (state.mode === "mock" && state.apiAvailable) {
        state.mode = "live";
        localStorage.setItem("ff26_dataSource", "live");
      } else {
        state.mode = "mock";
        localStorage.setItem("ff26_dataSource", "mock");
      }
    },
  },
});

export const { setDataSource, toggleDataSource } = dataSourceSlice.actions;
export default dataSourceSlice.reducer;
