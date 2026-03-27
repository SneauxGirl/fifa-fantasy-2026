import React, { useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { openSquadSigningModal } from "../../store/slices/uiSlice";
import { moveSquadToAvailable } from "../../store/slices/rosterSlice";
import {
  selectUnsignedSquads,
  selectSignedSquads,
} from "../../store/selectors/rosterSelectors";
import type { RosterSquad } from "../../types/match";
import styles from "./UnsignedSquadsList.module.scss";

/**
 * UnsignedSquadsList Component
 * Shows unsigned squads (staging) - squads selected but not yet locked in
 * Allows signing (with confirmation modal) or removing back to available
 */
export const UnsignedSquadsList: React.FC = () => {
  const dispatch = useAppDispatch();
  const unsignedSquads = useAppSelector(selectUnsignedSquads);
  const signedSquads = useAppSelector(selectSignedSquads);
  const liveRegionRef = useRef<HTMLDivElement>(null);

  const announce = (message: string) => {
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = message;
    }
  };

  const handleSignSquad = (squad: RosterSquad) => {
    dispatch(openSquadSigningModal(squad));
    announce(`Opening confirmation dialog for ${squad.name}`);
  };

  const handleRemoveSquad = (squad: RosterSquad) => {
    dispatch(moveSquadToAvailable(squad));
    announce(`${squad.name} removed and returned to available squads`);
  };

  if (unsignedSquads.length === 0) {
    return null;
  }

  return (
    <div className={styles.unsignedSquads}>
      {/* Screen reader announcements */}
      <div
        ref={liveRegionRef}
        aria-live="polite"
        aria-atomic="true"
        style={{ position: "absolute", left: "-9999px" }}
      />

      <h3>Pending Squads ({unsignedSquads.length}/{4 - signedSquads.length} to confirm)</h3>
      <div className={styles.squadList}>
        {unsignedSquads.map((squad) => (
          <div key={squad.teamId} className={styles.squadItem}>
            <div className={styles.squadHeader}>
              <div className={styles.squadInfo}>
                <span className={styles.flag}>{squad.flag}</span>
                <div className={styles.nameBlock}>
                  <div className={styles.name}>{squad.name}</div>
                  <div className={styles.code}>{squad.code}</div>
                </div>
              </div>
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                className={`${styles.button} ${styles.remove}`}
                onClick={() => handleRemoveSquad(squad)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleRemoveSquad(squad);
                  }
                }}
                title={`Remove ${squad.name}`}
                aria-label={`Remove ${squad.name} from selection`}
              >
                ✕ Remove
              </button>
              <button
                type="button"
                className={`${styles.button} ${styles.sign}`}
                onClick={() => handleSignSquad(squad)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSignSquad(squad);
                  }
                }}
                title={`Sign ${squad.name} to roster`}
                aria-label={`Sign ${squad.name} to roster`}
              >
                ✓ Sign
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
