import React from "react";
import { useAppSelector } from "../../store";
import styles from "./RosterSidebar.module.scss";

/**
 * RosterSidebar Component
 * Display signed players (non-starters) and eliminated players
 * Located in right sidebar below starters
 */
export const RosterSidebar: React.FC = () => {
  const signedPlayers = useAppSelector((state) => state.roster.players.signed);
  const starterPlayers = useAppSelector((state) => state.roster.players.starters);
  const eliminatedPlayers = useAppSelector((state) => state.roster.players.eliminated);

  // Non-starter signed players
  const nonStarterSigned = signedPlayers.filter(
    (p) => !starterPlayers.some((s) => s.id === p.id)
  );

  return (
    <div className={styles.rosterSidebar}>
      <h3 className={styles.title}>ROSTER</h3>

      {/* Signed Players (Non-Starters) */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>
          Signed Players ({nonStarterSigned.length})
        </h4>
        {nonStarterSigned.length === 0 ? (
          <p className={styles.empty}>No signed players on bench</p>
        ) : (
          <div className={styles.playersList}>
            {nonStarterSigned.map((player) => (
              <div key={player.id} className={styles.playerItem}>
                <span className={styles.playerName}>{player.name}</span>
                <span className={styles.playerPosition}>{player.position}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Eliminated Players */}
      {eliminatedPlayers.length > 0 && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>
            Eliminated ({eliminatedPlayers.length})
          </h4>
          <div className={styles.playersList}>
            {eliminatedPlayers.map((player) => (
              <div key={player.id} className={`${styles.playerItem} ${styles.eliminated}`}>
                <span className={styles.playerName}>{player.name}</span>
                <span className={styles.playerPosition}>{player.position}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
