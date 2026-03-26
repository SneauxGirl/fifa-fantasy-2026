import { Outlet, useLocation } from "react-router-dom";
import { TopNav, MidNav, BottomNav } from "../components/Navigation";
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
