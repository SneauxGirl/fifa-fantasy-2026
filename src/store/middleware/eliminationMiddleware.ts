import type { Middleware, AnyAction } from "@reduxjs/toolkit";
import type { RootState } from "../types";
import { movePlayerToEliminated, markPlayerAsEliminated, moveSquadToEliminated } from "../slices/rosterSlice";
import { setEliminationNotification } from "../slices/uiSlice";
import type { RosterPlayer, RosterSquad } from "../../types/match";

//MODERNIZE ANY ACTION, set to run onClick for turn and pop notifications

/**
 * Elimination Middleware
 *
 * Watches for changes to national teams data (elimination status from API).
 * When a team becomes eliminated:
 * 1. Find all roster members from that team (squad + players)
 * 2. Mark squad as eliminated
 * 3. Mark all squad's players as eliminated (cascade)
 * 4. Move both to eliminated pool
 * 5. Show notification listing all affected members
 *
 * National teams data is the source of truth for elimination status.
 * The roster system reacts to changes in that data.
 */

const ROSTER_ACTIONS = [
  "roster/movePlayerToStarter",
  "roster/movePlayerToBench",
  "roster/movePlayerToUnsigned",
  "roster/movePlayerToSigned",
  "roster/moveSquadToUnsigned",
  "roster/moveSquadToSigned",
  "roster/updateGameComplete",
  "roster/setTournamentRound",
  "nationTeams/updateTeamElimination", // Also check when national teams data updates
];

// Track which teams we've already notified about
const notifiedTeamIds = new Set<number>();

export const eliminationMiddleware: Middleware<{}, RootState> =
  (store) => (next) => (action: AnyAction) => {
    // Execute the action
    const result = next(action);

    // Only run elimination check after relevant actions
    if (!ROSTER_ACTIONS.includes(action.type)) {
      return result;
    }

    console.log("🔍 Elimination check running for action:", action.type);

    // Get updated state after action
    const state = store.getState();
    const { players, squads } = state.roster;
    const { squads: nationTeamsSquads } = state.nationTeams;

    // Build a lookup of eliminated teams from national teams data
    const eliminatedTeamIds = new Set(
      nationTeamsSquads
        .filter((squad) => squad.isEliminated)
        .map((squad) => squad.teamId)
    );

    const newlyEliminated: {
      squads: RosterSquad[];
      players: RosterPlayer[];
    } = {
      squads: [],
      players: [],
    };

    // Check all squads (available, unsigned, signed)
    squads.forEach((squad) => {
      const isAvailableForProcessing = squad.pool === "available" || squad.pool === "signed" || squad.pool === "unsigned";
      if (!isAvailableForProcessing) return;

      const isEliminatedInNationTeams = eliminatedTeamIds.has(squad.teamId);
      const isNotInEliminatedPool = squad.pool !== "eliminated";
      const hasNotBeenNotified = !notifiedTeamIds.has(squad.teamId);

      // If squad is eliminated in national teams data but not yet processed
      if (isEliminatedInNationTeams && isNotInEliminatedPool && hasNotBeenNotified) {
        notifiedTeamIds.add(squad.teamId);

        // SCENARIO 2.1: Squad in available → move to eliminated, rosterElimination: resolved
        // SCENARIO 2.2: Squad in signed → move to eliminatedSigned, rosterElimination: new
        if (squad.pool === "signed") {
          newlyEliminated.squads.push(squad);
          store.dispatch(moveSquadToEliminated(squad)); // Sets rosterElimination: "new"
        } else if (squad.pool === "available" || squad.pool === "unsigned") {
          // Available/Unsigned squads move to eliminated but don't trigger notification
          store.dispatch(moveSquadToEliminated(squad)); // Sets rosterElimination: "resolved"
        }

        // CASCADE: Also eliminate all players from this team
        const teamPlayers = players.filter(
          (p) => p.teamId === squad.teamId && !p.isEliminated
        );
        teamPlayers.forEach((player) => {
          if (player.pool === "signed") {
            // SIGNED PLAYERS: Move to eliminatedSigned, rosterElimination: new → NOTIFY
            newlyEliminated.players.push(player);
            store.dispatch(
              movePlayerToEliminated({
                player,
                reason: `${squad.name} eliminated from tournament`,
              })
            );
          } else if (player.pool === "unsigned") {
            // UNSIGNED PLAYERS: Move to available, rosterElimination: resolved → NO NOTIFY
            store.dispatch(
              markPlayerAsEliminated({
                player,
                newPool: "available",
                reason: `${squad.name} eliminated from tournament`,
              })
            );
          } else if (player.pool === "available") {
            // AVAILABLE PLAYERS: Stay in available, rosterElimination: resolved → NO NOTIFY
            store.dispatch(
              markPlayerAsEliminated({
                player,
                newPool: "available",
                reason: `${squad.name} eliminated from tournament`,
              })
            );
          }
        });
      }
    });

    // Show notification only for newly eliminated roster members (rosterElimination: "new")
    if (newlyEliminated.squads.length > 0 || newlyEliminated.players.length > 0) {
      console.log(
        "⚠️ Eliminations detected:",
        newlyEliminated.squads.map((s) => s.name),
        newlyEliminated.players.map((p) => p.name)
      );
      store.dispatch(
        setEliminationNotification({
          isOpen: true,
          squads: newlyEliminated.squads,
          players: newlyEliminated.players,
        })
      );
    } else {
      console.log("✓ No new eliminations detected");
    }

    return result;
  };
