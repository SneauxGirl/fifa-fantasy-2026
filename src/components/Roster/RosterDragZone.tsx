import React, { useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  movePlayerToAvailable,
} from "../../store/slices/rosterSlice";
import { openPlayerSigningModal } from "../../store/slices/uiSlice";
import { selectUnsignedPlayers } from "../../store/selectors/rosterSelectors";
import { positionToFifa } from "../../lib/formatMapping";
import type { RosterPlayer } from "../../types/match";
import styles from "./RosterDragZone.module.scss";

type Position = "GK" | "DEF" | "MID" | "FWD";

/**
 * RosterDragZone Component
 * Display pending (unsigned) contracts organized by position (GK | DEF | MID | FWD)
 * Unsigned players with Sign/Remove buttons
 */
export const RosterDragZone: React.FC = () => {
  const dispatch = useAppDispatch();

  // Get unsigned players (pending contracts)
  const unsignedPlayers = useAppSelector(selectUnsignedPlayers);

  // Organize unsigned players by position, sorted by country then number
  const positionGroups = useMemo(() => {
    const positions: Record<Position, RosterPlayer[]> = {
      GK: [],
      DEF: [],
      MID: [],
      FWD: [],
    };

    unsignedPlayers.forEach((player) => {
      const fifaPosition = positionToFifa(player.position) as Position;
      positions[fifaPosition].push(player);
    });

    // Sort each position group by country code, then by number
    Object.keys(positions).forEach((position) => {
      positions[position as Position].sort((a, b) => {
        if (a.code !== b.code) {
          return a.code.localeCompare(b.code);
        }
        return (a.number || 0) - (b.number || 0);
      });
    });

    return positions;
  }, [unsignedPlayers]);

  const handleSignPlayer = (player: RosterPlayer) => {
    dispatch(openPlayerSigningModal(player));
  };

  const handleRemovePlayer = (player: RosterPlayer) => {
    dispatch(movePlayerToAvailable(player));
  };

  return (
    <div className={styles.rosterDragZone}>
      {/* Bench by Position - Four Column Layout */}
      <div className={styles.benchByPosition}>
        {(['GK', 'DEF', 'MID', 'FWD'] as Position[]).map((position) => (
          <div key={position} className={styles.positionColumn}>
            <h4 className={styles.positionHeader}>
              {position}
              <span className={styles.positionCount}>
                {positionGroups[position].length}
              </span>
            </h4>

            <div className={styles.positionPlayers}>
              {positionGroups[position].length === 0 ? (
                <p className={styles.emptyPosition}>No {position}s</p>
              ) : (
                positionGroups[position].map((player) => (
                  <BenchPlayerCard
                    key={player.playerId}
                    player={player}
                    onSign={() => handleSignPlayer(player)}
                    onRemove={() => handleRemovePlayer(player)}
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * BenchPlayerCard Component
 * Player card in bench showing Sign/Remove for unsigned, or Signed badge for signed
 */
interface BenchPlayerCardProps {
  player: RosterPlayer;
  onSign: () => void;
  onRemove: () => void;
}

const BenchPlayerCard: React.FC<BenchPlayerCardProps> = ({ player, onSign, onRemove }) => {
  const initials = player.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return (
    <div className={styles.benchPlayerCard}>
      <div className={styles.playerInfo}>
        <span className={styles.playerNumber}>{player.number}</span>
        <div className={styles.playerName}>
          <span className={styles.initials}>{initials}</span>
          <span className={styles.name}>{player.name}</span>
        </div>
      </div>

      <div className={styles.playerActions}>
        <button
          className={`${styles.actionBtn} ${styles.signBtn}`}
          onClick={onSign}
          title="Sign player"
        >
          Sign
        </button>
        <button
          className={`${styles.actionBtn} ${styles.removeBtn}`}
          onClick={onRemove}
          title="Remove to available"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
