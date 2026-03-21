import { useAppDispatch, useAppSelector } from "../store";
import { setSidebarOpen } from "../store/slices/uiSlice";
import { BracketView } from "../components/FutureMatches/BracketView";
import { BracketDropdown } from "../components/FutureMatches/BracketDropdown";
import { InsightsPanel } from "../components/FutureMatches/InsightsPanel";
import { RosterSidebar } from "../components/Dashboard/RosterSidebar";
import { Sidebar } from "../components/Navigation";
import type { Match } from "../types/match";
import styles from "./FutureMatches.module.scss";

/**
 * Future Matches Page
 * Tournament brackets and insights
 * Groups, knockout stages, team strategy recommendations
 */

const FutureMatches = () => {
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector((state) => state.ui.sidebar.open);
  const modal = useAppSelector((state) => state.ui.modal);
  const selectedMatch = modal.type === "match" ? (modal.selectedCard as Match) : null;

  const handleNavigation = () => {
    if (sidebarOpen) {
      dispatch(setSidebarOpen(false));
    }
  };

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

      {/* Desktop Bracket + Insights + Nav + Roster */}
      <div className={styles.content}>
        {/* Bracket View (Desktop) */}
        <div className={styles.bracketSection}>
          <BracketView />
        </div>

        {/* Insights Panel (Sidebar on desktop, below on mobile) */}
        <aside className={styles.insightsSection}>
          <InsightsPanel match={selectedMatch} />
        </aside>

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

export default FutureMatches;
