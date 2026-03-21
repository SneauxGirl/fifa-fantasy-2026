import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../store";
import { setSidebarOpen } from "../store/slices/uiSlice";
import { AvailableSquadsList } from "../components/Roster/AvailableSquadsList";
import { SquadsSection } from "../components/Roster/SquadsSection";
import { PositionFilter } from "../components/Roster/PositionFilter";
import { AvailablePlayersList } from "../components/Roster/AvailablePlayersList";
import { RosterDragZone } from "../components/Roster/RosterDragZone";
import { StartersLineup } from "../components/Roster/StartersLineup";
import { RosterSidebar } from "../components/Roster/RosterSidebar";
import { Sidebar } from "../components/Navigation";
import styles from "./Roster.module.scss";

type PositionType = "GK" | "DEF" | "MID" | "FWD" | "ALL";

/**
 * Roster Page
 * Player/squad selection and management
 * Position filters, drag & drop starters/bench, validation rules
 */

const Roster = () => {
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector((state) => state.ui.sidebar.open);
  const [selectedPosition, setSelectedPosition] = useState<PositionType>("ALL");

  const handleNavigation = () => {
    if (sidebarOpen) {
      dispatch(setSidebarOpen(false));
    }
  };

  return (
    <div className={styles.roster}>
      <header className={styles.header}>
        <h1>Roster Management</h1>
        <p>Build your fantasy roster: select 4 squads and 18 players (minimum 11 starters)</p>
      </header>

      {/* Content + Sidebars */}
      <div className={styles.content}>
        {/* Main Content (left) */}
        <div className={styles.mainContent}>
          {/* Select Squads Section */}
          <section className={styles.section}>
            <h2>Select Squads</h2>
            <AvailableSquadsList />
          </section>

          {/* Squads Section */}
          <section className={styles.section}>
            <SquadsSection />
          </section>

          {/* Player Selection Section */}
          <section className={styles.section}>
            <h2>Add Players</h2>
            <div className={styles.filterRow}>
              <PositionFilter
                selectedPosition={selectedPosition}
                onPositionChange={setSelectedPosition}
              />
            </div>
            <AvailablePlayersList selectedPosition={selectedPosition} />
          </section>

          {/* Pending Contracts Section */}
          <section className={styles.section}>
            <h2>Pending Contracts</h2>
            <RosterDragZone />
          </section>
        </div>

        {/* Right Sidebar Stack (Nav + Starters + Roster) */}
        <div className={styles.rightSidebars}>
          {/* Navigation Sidebar */}
          <nav className={styles.navSidebar} aria-label="Main navigation">
            <Sidebar onNavigate={handleNavigation} />
          </nav>

          {/* Starters Lineup */}
          <StartersLineup />

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

export default Roster;
