import { useAppDispatch, useAppSelector } from "../store";
import { setSidebarOpen } from "../store/slices/uiSlice";
import { SummaryTicker } from "../components/Dashboard/SummaryTicker";
import { MatchList } from "../components/Dashboard/MatchList";
import { RosterSidebar } from "../components/Dashboard/RosterSidebar";
import { Sidebar } from "../components/Navigation";
import styles from "./Dashboard.module.scss";

/**
 * Dashboard Page
 * Overview of current/upcoming/past matches
 * Summary stats ticker, match list, roster sidebar
 */

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector((state) => state.ui.sidebar.open);

  const handleNavigation = () => {
    if (sidebarOpen) {
      dispatch(setSidebarOpen(false));
    }
  };

  return (
    <div className={styles.dashboard}>
      {/* Summary Ticker - Full Width */}
      <SummaryTicker />

      {/* Main Content + Sidebars */}
      <div className={styles.content}>
        {/* Match List (left) */}
        <div className={styles.mainColumn}>
          <h1>Matches</h1>
          <MatchList />
        </div>

        {/* Right Sidebar Stack (Nav + Roster) */}
        <div className={styles.rightSidebars}>
          {/* Navigation Sidebar */}
          <nav className={styles.navSidebar} aria-label="Main navigation">
            <Sidebar onNavigate={handleNavigation} />
          </nav>

          {/* Roster Sidebar */}
          <RosterSidebar />
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      {sidebarOpen && (
        <div
          className={styles.mobileNavOverlay}
          onClick={() => dispatch(setSidebarOpen(false))}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default Dashboard;
