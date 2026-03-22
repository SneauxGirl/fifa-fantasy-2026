import { SummaryTicker } from "../components/Dashboard/SummaryTicker";
import { MatchList } from "../components/Dashboard/MatchList";
import { RosterSidebar } from "../components/Shared/RosterSidebar";
import styles from "./Dashboard.module.scss";

/**
 * Dashboard Page
 * Overview of current/upcoming/past matches
 * Summary stats ticker, match list, roster sidebar
 */

const Dashboard = () => {

  return (
    <div className={styles.dashboard}>
      {/* Summary Ticker - Full Width */}
      <SummaryTicker />

      {/* Main Content + Right Sidebar */}
      <div className={styles.content}>
        {/* Match List (left) */}
        <div className={styles.mainColumn}>
          <h1>Matches</h1>
          <MatchList />
        </div>

        {/* Right Sidebar - Roster Only */}
        <div className={styles.rightSidebars}>
          <RosterSidebar />
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
