/**
 * useDataSource Hook
 * Access and control the data source (mock vs live API)
 * Persists preference to localStorage via Redux
 */

import { useAppDispatch, useAppSelector } from "../store";
import { toggleDataSource, setDataSource } from "../store/slices/dataSourceSlice";
import type { DataSource } from "../store/slices/dataSourceSlice";

export function useDataSource() {
  const dispatch = useAppDispatch();
  const { mode, apiAvailable } = useAppSelector((state) => state.dataSource);

  return {
    /** Current data source mode: 'mock' or 'live' */
    mode,
    /** Whether API key is configured */
    apiAvailable,
    /** Toggle between mock and live (only if API available) */
    toggle: () => dispatch(toggleDataSource()),
    /** Set specific data source */
    setSource: (source: DataSource) => dispatch(setDataSource(source)),
    /** Human-readable label */
    label: mode === "live" ? "Live API" : "Mock Data",
  };
}
