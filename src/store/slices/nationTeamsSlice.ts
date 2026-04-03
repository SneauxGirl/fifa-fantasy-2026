import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RosterSquad } from "../../types/match";

//CONFIRM this filters to both Players and Squads. Keep. #TODO

/**
 * National Teams Slice
 *
 * Stores the authoritative data about national teams in the tournament
 * (as it comes from the API or mock data).
 *
 * This is the source of truth for:
 * - Which teams are in the tournament
 * - Which teams are eliminated
 * - Team rosters (available players)
 *
 * The roster system compares against this data to determine what
 * needs to be updated when a team's tournament status changes.
 */

export interface NationTeamsState {
  squads: RosterSquad[];
}

const initialState: NationTeamsState = {
  squads: [],
};

const nationTeamsSlice = createSlice({
  name: "nationTeams",
  initialState,
  reducers: {
    /**
     * Initialize national teams data from tournament data
     * Called on app startup with data from API or mock JSON
     */
    initializeNationTeams: (state, action: PayloadAction<RosterSquad[]>) => {
      state.squads = action.payload;
    },

    /**
     * Update a team's elimination status (simulates API update)
     * Called when the tournament announces a team is eliminated
     */
    updateTeamElimination: (
      state,
      action: PayloadAction<{ teamId: number; isEliminated: boolean }>
    ) => {
      const { teamId, isEliminated } = action.payload;
      const squad = state.squads.find((s) => s.teamId === teamId);
      if (squad) {
        squad.isEliminated = isEliminated;
      }
    },
  },
});

export const { initializeNationTeams, updateTeamElimination } =
  nationTeamsSlice.actions;

export default nationTeamsSlice.reducer;
