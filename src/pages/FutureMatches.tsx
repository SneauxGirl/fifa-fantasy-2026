import { useAppSelector } from "../store";
import { BracketView } from "../components/FutureMatches/BracketView";
import { BracketDropdown } from "../components/FutureMatches/BracketDropdown";
import { InsightsPanel } from "../components/FutureMatches/InsightsPanel";
import { RosterSidebar } from "../components/Shared/RosterSidebar";
import type { Match } from "../types/match";
import styles from "./FutureMatches.module.scss";

/**
 * Future Matches Page
 * Tournament brackets and insights
 * Groups, knockout stages, team strategy recommendations
 */

const FutureMatches = () => {
  const modal = useAppSelector((state) => state.ui.modal);
  const selectedMatch = modal.type === "match" ? (modal.selectedCard as Match) : null;

  return (
    <div className={styles.futureMatches}>
      <header className={styles.header}>
        <h1>Tournament Brackets</h1>
        <p>View upcoming matches and strategic insights</p>
      </header>

      {/* Mobile Dropdown (visible only on small screens) */}
      <div className={styles.mobileDropdown}>
        <BracketDropdown />
      </div>

      {/* Bracket + Insights + Roster */}
      <div className={styles.content}>
        {/* Bracket View */}
        <div className={styles.bracketSection}>
          <BracketView />
        </div>

        {/* Insights Panel */}
        <aside className={styles.insightsSection}>
          <InsightsPanel match={selectedMatch} />
        </aside>

        {/* Right Sidebar (Roster) */}
        <div className={styles.rightSidebars}>
          {/* Roster Sidebar */}
          <RosterSidebar />
        </div>
      </div>
    </div>
  );
};

export default FutureMatches;
