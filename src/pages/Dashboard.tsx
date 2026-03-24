import { SummaryTicker } from "../components/Dashboard/SummaryTicker";
import { MatchList } from "../components/Dashboard/MatchList";
import { RosterSidebar } from "../components/Shared/RosterSidebar";
import styles from "./Dashboard.module.scss";
import appLayoutStyles from "../layouts/AppLayout.module.scss";

/**
 * Dashboard Page
 * Overview of current/upcoming/past matches
 * Summary stats ticker, match list, roster sidebar
 */

const Dashboard = () => {
  return (
    <>
      {/* Main Content + Right Sidebar */}
      <div className={appLayoutStyles.pageLayout}>
        {/* Match List (left) */}
        <div className={styles.mainColumn}>
          <MatchList />
        </div>

        {/* Right Sidebar - Roster Only */}
        <div className={appLayoutStyles.rightSidebar}>
          <RosterSidebar />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
