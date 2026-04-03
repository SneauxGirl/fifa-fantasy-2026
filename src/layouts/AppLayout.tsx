import { Outlet, useLocation } from "react-router-dom";
import { TopNav, MidNav, BottomNav, DataSourceToggle } from "../components/Navigation";
import { Header } from "../components/Shared/Header";
import { SummaryTicker } from "../components/Dashboard/SummaryTicker";
import { MatchCardModal, PlayerCardModal, SquadCardModal, SquadSigningModal, PlayerSigningModal } from "../components/Modals";
import styles from "./AppLayout.module.scss";

/**
 * Main application layout wrapper
 * TopNav (FIFA links, always) + MidNav (app nav, all pages) + Page Content + Bottom Nav
 */
const AppLayout = () => {
  const location = useLocation();
  const isDashboard = location.pathname === "/" || location.pathname === "/dashboard";

  return (
    <div className={styles.appLayout}>
      {/* Data Source Indicator (Phase 3) */}
      <div style={{ padding: "8px 16px", borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
        <DataSourceToggle />
      </div>

      {/* FIFA Links Navigation (always visible) */}
      <TopNav />

      {/* App Navigation (all pages) */}
      <MidNav />

      {/* Page Header (with optional ticker on Dashboard) */}
      <Header ticker={isDashboard ? <SummaryTicker /> : undefined} />

      {/* Main Content Area */}
      <main>
        <Outlet />
      </main>

      {/* Bottom Navigation (mobile only) */}
      <BottomNav />

      {/* Modal Dialogs */}
      <MatchCardModal />
      <PlayerCardModal />
      <SquadCardModal />
      <SquadSigningModal />
      <PlayerSigningModal />
    </div>
  );
};

export default AppLayout;
