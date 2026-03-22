import { Outlet, useLocation } from "react-router-dom";
import { TopNav, MidNav, BottomNav } from "../components/Navigation";
import { MatchCardModal, PlayerCardModal, SquadCardModal, SquadSigningModal, PlayerSigningModal } from "../components/Modals";
import styles from "./AppLayout.module.scss";

/**
 * Main application layout wrapper
 * TopNav (FIFA links, always) + MidNav (app nav, all pages) + Page Content + Bottom Nav
 */
const AppLayout = () => {
  const location = useLocation();
  const isDashboard = location.pathname === "/";

  return (
    <div className={styles.appLayout}>
      {/* FIFA Links Navigation (always visible) */}
      <TopNav />

      {/* App Navigation (all pages) */}
      <MidNav />

      {/* Main Content Area */}
      <main className={`${styles.pageContent} ${isDashboard ? styles.dashboardContent : ''}`}>
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
