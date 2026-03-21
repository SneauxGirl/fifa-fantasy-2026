import React, { useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { moveSquadToUnsigned } from "../../store/slices/rosterSlice";
import type { RosterSquad } from "../../types/match";
import styles from "./AvailableSquadsList.module.scss";

/**
 * AvailableSquadsList Component
 * Shows available squads that can be selected to add to roster
 * Supports: click, keyboard navigation (arrow keys, Enter/Space), and HTML5 drag-and-drop
 * Accessible with aria-live announcements for screen readers
 */
export const AvailableSquadsList: React.FC = () => {
  const dispatch = useAppDispatch();
  const availableSquads = useAppSelector((state) => state.roster.squads.available);
  const unsignedSquads = useAppSelector((state) => state.roster.squads.unsigned);
  const signedSquads = useAppSelector((state) => state.roster.squads.signed);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const liveRegionRef = useRef<HTMLDivElement>(null);

  const announce = (message: string) => {
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = message;
    }
  };

  const totalSelected = unsignedSquads.length + signedSquads.length;
  const remainingSlots = 4 - totalSelected;

  const handleSignSquad = (squad: RosterSquad) => {
    if (remainingSlots > 0) {
      dispatch(moveSquadToUnsigned(squad));
      announce(`${squad.name} moved to pending. ${remainingSlots - 1} slots remaining.`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    const squad = availableSquads[index];

    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        if (index > 0) {
          setActiveIndex(index - 1);
          // Focus the previous element
          const prevButton = document.querySelector(
            `[data-squad-index="${index - 1}"]`
          ) as HTMLButtonElement;
          prevButton?.focus();
        }
        break;

      case "ArrowDown":
        e.preventDefault();
        if (index < availableSquads.length - 1) {
          setActiveIndex(index + 1);
          // Focus the next element
          const nextButton = document.querySelector(
            `[data-squad-index="${index + 1}"]`
          ) as HTMLButtonElement;
          nextButton?.focus();
        }
        break;

      case " ":
      case "Enter":
        e.preventDefault();
        if (remainingSlots > 0) {
          handleSignSquad(squad);
        } else {
          announce("Roster is full. Remove a squad to add another.");
        }
        break;
    }
  };

  const handleDragStart = (e: React.DragEvent, squad: RosterSquad) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("application/json", JSON.stringify({
      type: "squad",
      squad: squad,
    }));
  };

  return (
    <div className={styles.availableSquads}>
      {/* Screen reader announcements */}
      <div
        ref={liveRegionRef}
        aria-live="polite"
        aria-atomic="true"
        style={{ position: "absolute", left: "-9999px" }}
      />

      <h3>Available Squads ({remainingSlots} slots remaining)</h3>
      {availableSquads.length === 0 ? (
        <p className={styles.empty}>No squads available</p>
      ) : (
        <div className={styles.squadGrid}>
          {availableSquads.map((squad, index) => {
            const isEliminated = squad.status === "eliminated";
            return (
              <button
                key={squad.teamId}
                data-squad-index={index}
                className={`${styles.squadCard} ${isEliminated ? styles.eliminated : ""}`}
                onClick={() => handleSignSquad(squad)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onDragStart={(e) => handleDragStart(e, squad)}
                onFocus={() => setActiveIndex(index)}
                title={isEliminated ? `${squad.name} - Eliminated from tournament` : `Select ${squad.name}. Use arrow keys to navigate, Enter or Space to select.`}
                aria-label={isEliminated ? `${squad.name} - Eliminated from tournament` : `${squad.name}. Use arrow keys to navigate, Enter or Space to select for review.`}
                disabled={remainingSlots <= 0 || isEliminated}
                draggable
                tabIndex={activeIndex === index ? 0 : -1}
              >
                <div className={styles.flag}>{squad.flag}</div>
                <div className={styles.info}>
                  <div className={styles.name}>{squad.name}</div>
                  <div className={styles.code}>{squad.code}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
