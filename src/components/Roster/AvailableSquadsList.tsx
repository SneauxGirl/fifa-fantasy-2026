import React, { useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { moveSquadToUnsigned } from "../../store/slices/rosterSlice";
import {
  selectActiveAvailableSquads,
  selectEliminatedAvailableSquads,
  selectUnsignedSquads,
  selectSignedSquads,
} from "../../store/selectors/rosterSelectors";
import type { RosterSquad } from "../../types/match";
import styles from "./AvailableSquadsList.module.scss";

/**
 * AvailableSquadsList Component
 * Shows available squads that can be selected to add to roster
 * Active squads at top, eliminated squads at bottom (greyed out, disabled)
 * Supports: click, keyboard navigation (arrow keys, Enter/Space), and HTML5 drag-and-drop
 * Accessible with aria-live announcements for screen readers
 */
export const AvailableSquadsList: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeAvailableSquads = useAppSelector(selectActiveAvailableSquads);
  const eliminatedAvailableSquads = useAppSelector(selectEliminatedAvailableSquads);
  const allAvailableSquads = [...activeAvailableSquads, ...eliminatedAvailableSquads];
  const unsignedSquads = useAppSelector(selectUnsignedSquads);
  const signedSquads = useAppSelector(selectSignedSquads);

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const liveRegionRef = useRef<HTMLDivElement>(null);

  const announce = (message: string) => {
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = message;
    }
  };

  // No cap on unsigned (staging) squads - only cap on signed
  // Cap check happens when signing from unsigned → signed
  const canAddToUnsigned = (squad: RosterSquad) => !squad.isEliminated;

  const handleSignSquad = (squad: RosterSquad) => {
    if (canAddToUnsigned(squad)) {
      dispatch(moveSquadToUnsigned(squad));
      announce(`${squad.name} moved to staging. ${signedSquads.length}/4 signed squads.`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    const squad = allAvailableSquads[index];

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
        if (index < allAvailableSquads.length - 1) {
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
        if (!squad.isEliminated) {
          handleSignSquad(squad);
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

      <h3>Available Squads ({signedSquads.length}/4 signed)</h3>
      {allAvailableSquads.length === 0 ? (
        <p className={styles.empty}>No squads available</p>
      ) : (
        <div className={styles.squadGrid}>
          {allAvailableSquads.map((squad, index) => {
            const isEliminated = squad.isEliminated;
            return (
              <button
                type="button"
                key={squad.teamId}
                data-squad-index={index}
                className={`${styles.squadCard} ${isEliminated ? styles.eliminated : ""}`}
                onClick={() => handleSignSquad(squad)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onDragStart={(e) => handleDragStart(e, squad)}
                onFocus={() => setActiveIndex(index)}
                title={isEliminated ? `${squad.name} - Eliminated from tournament` : `Select ${squad.name}. Use arrow keys to navigate, Enter or Space to select.`}
                aria-label={isEliminated ? `${squad.name} - Eliminated from tournament` : `${squad.name}. Use arrow keys to navigate, Enter or Space to select for review.`}
                disabled={isEliminated}
                draggable={!isEliminated}
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
