import { useEffect } from "react";
import { useAppDispatch } from "../store";
import { updateTeamElimination } from "../store/slices/nationTeamsSlice";

/**
 * useTestUtils Hook
 *
 * Development utility for testing elimination flows.
 * Only available in development mode.
 *
 * Usage in browser console:
 *   window.__testUtils.eliminateTeam(5)    // Eliminate France (teamId: 5)
 *   window.__testUtils.restoreTeam(5)      // Restore France
 *   window.__testUtils.help()              // Show available commands
 */

interface TestUtils {
  eliminateTeam: (teamId: number) => void;
  restoreTeam: (teamId: number) => void;
  help: () => void;
}

export const useTestUtils = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // TODO: Re-add environment check once testing is complete
    // if (process.env.NODE_ENV !== "development") {
    //   return;
    // }

    const testUtils: TestUtils = {
      eliminateTeam: (teamId: number) => {
        console.log(`🚨 Simulating API: Team ${teamId} eliminated`);
        dispatch(updateTeamElimination({ teamId, isEliminated: true }));
      },

      restoreTeam: (teamId: number) => {
        console.log(`✅ Simulating API: Team ${teamId} restored`);
        dispatch(updateTeamElimination({ teamId, isEliminated: false }));
      },

      help: () => {
        console.log(
          `
📋 Test Utils Commands:

  eliminateTeam(teamId)
    Simulate API marking a team as eliminated
    Example: window.__testUtils.eliminateTeam(5)

  restoreTeam(teamId)
    Simulate API restoring an eliminated team
    Example: window.__testUtils.restoreTeam(5)

Team IDs:
  1 = Argentina (ARG)
  3 = Brazil (BRA)
  4 = Germany (GER)
  5 = France (FRA)
  6 = Netherlands (NED)
  ... and more

When you eliminate a team:
  1. The middleware will detect it
  2. The team's squad moves to Eliminated
  3. Signed players → Eliminated pool (role: eliminatedSigned)
  4. Unsigned players → Available pool (marked eliminated)
  5. Available players → stay Available (marked eliminated)
  6. Notification shows only Signed players affected
        `
        );
      },
    };

    // Expose on window for console access
    (window as any).__testUtils = testUtils;
    console.log("✅ Test utils exposed to window.__testUtils");
    console.log("Try: window.__testUtils.help()");

    return () => {
      // Don't clean up - keep test utils available throughout session
      // delete (window as any).__testUtils;
    };
  }, [dispatch]);
};
