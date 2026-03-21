import { Outlet } from "react-router-dom";
import { TopNav, BottomNav } from "../components/Navigation";
import { MatchCardModal, PlayerCardModal, SquadCardModal, SquadSigningModal, PlayerSigningModal } from "../components/Modals";
import styles from "./AppLayout.module.scss";

/**
 * Main application layout wrapper
 * TopNav + Page Content + Bottom Nav
 * Navigation and Roster sidebars are handled by individual pages
 */
const AppLayout = () => {
  return (
    <div className={styles.appLayout}>
      {/* Top Navigation */}
      <TopNav />

      {/* Main Content Area */}
      <main className={styles.pageContent}>
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
