import { useState } from "react";
import { AvailableSquadsList } from "../components/Roster/AvailableSquadsList";
import { SquadsSection } from "../components/Roster/SquadsSection";
import { PositionFilter } from "../components/Roster/PositionFilter";
import { AvailablePlayersList } from "../components/Roster/AvailablePlayersList";
import { RosterDragZone } from "../components/Roster/RosterDragZone";
import { StartersLineup } from "../components/Roster/StartersLineup";
import { RosterSidebar } from "../components/Roster/RosterSidebar";
import styles from "./Roster.module.scss";
import appLayoutStyles from "../layouts/AppLayout.module.scss";

type PositionType = "GK" | "DEF" | "MID" | "FWD" | "ALL";
type TabType = "roster" | "starters";

/**
 * Roster Page
 * Player/squad selection and management
 * Position filters, drag & drop starters/bench, validation rules
 * Tablet/mobile: tab-based interface for Select Roster vs Select Starters
 * Desktop: no tabs, traditional layout
 */

const Roster = () => {
  const [selectedPosition, setSelectedPosition] = useState<PositionType>("ALL");
  const [activeTab, setActiveTab] = useState<TabType>("roster");

  return (
    <>
      {/* Tabs (tablet/mobile only) */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "roster" ? styles.active : ""}`}
          onClick={() => setActiveTab("roster")}
        >
          Select Roster
        </button>
        <button
          className={`${styles.tab} ${activeTab === "starters" ? styles.active : ""}`}
          onClick={() => setActiveTab("starters")}
        >
          Select Starters
        </button>
      </div>

      {/* Content + Sidebars */}
      <div className={appLayoutStyles.pageLayout}>
        {/* Main Content - Squad/Player Selection */}
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

        {/* Right Sidebars */}
        <div className={appLayoutStyles.rightSidebar} data-active-tab={activeTab}>
          {/* StartersLineup */}
          <div className={styles.startersColumn}>
            <StartersLineup />
          </div>

          {/* RosterSidebar */}
          <div className={styles.rosterColumn}>
            <RosterSidebar />
          </div>
        </div>
      </div>
    </>
  );
};

export default Roster;
