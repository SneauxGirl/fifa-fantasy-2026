/**
 * Poll Service
 * Manages polling intervals based on match status.
 *
 * Polling Strategy:
 * - Non-roster matches: Download scores at HT (~45min), FT (~105min), ET, penalties
 *   Poll every 2 min until final score recorded
 * - Roster matches: REST API every 60 seconds (structure for WebSocket upgrade later)
 */

import type { MatchStatusShort } from "../types/match";
import { pollMatchScore } from "./matchService";
import { store } from "../store";
import { updateScore, updateMatchStatus, setPollMetadata } from "../store/slices/matchesSlice";

interface PollConfig {
  matchId: number;
  isRosterMatch: boolean;
  matchStartTime: number; // Unix timestamp of match start
}

const activePolls = new Map<number, ReturnType<typeof setTimeout>>();

/**
 * Calculate next poll interval based on match status and elapsed time
 * Returns interval in milliseconds
 */
export const calculateNextPollInterval = (
  matchStatus: MatchStatusShort,
  elapsedMinutes: number | null
): number => {
  // For roster matches: always 60 seconds
  // For non-roster matches: strategic timing

  const TWO_MIN = 2 * 60 * 1000;
  const SIXTY_SEC = 60 * 1000;

  if (!elapsedMinutes) {
    return SIXTY_SEC; // Default to 60 seconds if no elapsed time
  }

  switch (matchStatus) {
    case "NS": // Not Started - poll every 5 min
      return 5 * 60 * 1000;

    case "1H":
    case "2H":
    case "ET":
    case "P": // Live match - poll every 60 seconds (for roster) or 2 min (for non-roster)
      return SIXTY_SEC;

    case "HT": // Half Time - poll in 2 min to check for resumption
      return TWO_MIN;

    case "BT": // Break Time in ET - poll in 2 min
      return TWO_MIN;

    case "FT": // Full Time - poll in 2 min (might go to ET)
      return TWO_MIN;

    case "AET": // After Extra Time - poll in 2 min (might go to penalties)
      return TWO_MIN;

    case "PEN": // Penalty Shootout - poll every 60 seconds
      return SIXTY_SEC;

    case "SUSP":
    case "INT":
    case "PST": // Suspended/Interrupted/Postponed - poll every 5 min
      return 5 * 60 * 1000;

    case "CANC":
    case "ABD":
    case "TBD": // Cancelled/Abandoned/TBD - don't poll
      return Infinity;

    default:
      return SIXTY_SEC;
  }
};

/**
 * Start polling a match for score updates
 * Determines polling frequency based on match status and whether it's a roster match
 */
export const startPollingMatch = async (config: PollConfig): Promise<void> => {
  const { matchId, isRosterMatch } = config;

  // Clear any existing poll for this match
  if (activePolls.has(matchId)) {
    clearTimeout(activePolls.get(matchId)!);
  }

  const poll = async () => {
    try {
      const match = await pollMatchScore(matchId);

      // Update Redux store
      store.dispatch(
        updateScore({
          matchId,
          halftime: match.score.halftime as any,
          fulltime: match.score.fulltime as any,
          extratime: match.score.extratime as any,
          penalty: match.score.penalty as any,
        })
      );

      store.dispatch(
        updateMatchStatus({
          matchId,
          status: match.status,
        })
      );

      // Calculate next poll interval
      const nextInterval = isRosterMatch
        ? 60 * 1000 // Roster matches: 60 seconds
        : calculateNextPollInterval(match.status.short, match.status.elapsed);

      // Stop polling if match is finished
      const isFinal =
        match.status.short === "FT" ||
        match.status.short === "AET" ||
        match.status.short === "PEN" ||
        match.status.short === "CANC" ||
        match.status.short === "ABD";

      if (
        isFinal &&
        match.score.fulltime.home !== null &&
        match.score.fulltime.away !== null
      ) {
        console.log(`Match ${matchId} finished, stopping poll`);
        activePolls.delete(matchId);
        return;
      }

      // Set metadata for next poll
      const nextFetchAt = Date.now() + nextInterval;
      store.dispatch(
        setPollMetadata({
          matchId,
          lastFetched: Date.now(),
          nextFetchAt,
          pollInterval: nextInterval,
        })
      );

      // Schedule next poll
      const timeout = setTimeout(poll, nextInterval);
      activePolls.set(matchId, timeout);
    } catch (error) {
      console.error(`Error polling match ${matchId}:`, error);
      // Retry in 5 minutes on error
      const timeout = setTimeout(poll, 5 * 60 * 1000);
      activePolls.set(matchId, timeout);
    }
  };

  // Start initial poll immediately
  await poll();
};

/**
 * Stop polling a specific match
 */
export const stopPollingMatch = (matchId: number): void => {
  if (activePolls.has(matchId)) {
    clearTimeout(activePolls.get(matchId)!);
    activePolls.delete(matchId);
  }
};

/**
 * Stop all active polls
 */
export const stopAllPolls = (): void => {
  activePolls.forEach((timeout) => clearTimeout(timeout));
  activePolls.clear();
};

/**
 * Get all currently active poll match IDs
 */
export const getActivePolls = (): number[] => {
  return Array.from(activePolls.keys());
};
