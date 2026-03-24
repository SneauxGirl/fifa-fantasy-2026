import { useAppSelector } from "../store";
import { BracketView } from "../components/FutureMatches/BracketView";
import { BracketDropdown } from "../components/FutureMatches/BracketDropdown";
import { InsightsPanel } from "../components/FutureMatches/InsightsPanel";
import { RosterSidebar } from "../components/Shared/RosterSidebar";
import type { Match } from "../types/match";
import styles from "./FutureMatches.module.scss";
import appLayoutStyles from "../layouts/AppLayout.module.scss";

/**
 * Future Matches Page
 * Tournament brackets and insights
 * Groups, knockout stages, team strategy recommendations
 */

const FutureMatches = () => {
  const modal = useAppSelector((state) => state.ui.modal);
  const selectedMatch = modal.type === "match" ? (modal.selectedCard as Match) : null;

  return (
    <>
      {/* Mobile Dropdown (visible only on small screens) */}
      <div className={styles.mobileDropdown}>
        <BracketDropdown />
      </div>

      {/* Bracket + Insights + Roster */}
      <div className={appLayoutStyles.pageLayout}>
        {/* Bracket View */}
        <div className={styles.bracketSection}>
          <BracketView />
        </div>

        {/* Insights Panel */}
        <aside className={styles.insightsSection}>
          <InsightsPanel match={selectedMatch} />
        </aside>

        {/* Right Sidebar (Roster) */}
        <div className={appLayoutStyles.rightSidebar}>
          {/* Roster Sidebar */}
          <RosterSidebar />
        </div>
      </div>
    </>
  );
};

export default FutureMatches;
