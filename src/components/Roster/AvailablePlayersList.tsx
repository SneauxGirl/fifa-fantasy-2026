import React from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { openPlayerModal } from "../../store/slices/uiSlice";
import { movePlayerToUnsigned } from "../../store/slices/rosterSlice";
import type { RosterPlayer } from "../../types/match";
import styles from "./AvailablePlayersList.module.scss";

type PositionType = "GK" | "DEF" | "MID" | "FWD" | "ALL";

interface AvailablePlayersListProps {
  selectedPosition: PositionType;
}

/**
 * AvailablePlayersList Component
 * Displays available players, filtered by position.
 * Click to view player details or drag to roster.
 *
 * Note: For full display data (firstName, lastName, stats), pass enrichedPlayers.
 * Falls back to RosterPlayer properties if enrichment data not provided.
 */
export const AvailablePlayersList: React.FC<AvailablePlayersListProps> = ({
  selectedPosition,
}) => {
  const dispatch = useAppDispatch();
  const availablePlayers = useAppSelector((state) => state.roster.players.available);

  // Filter by position
  const filteredPlayers = availablePlayers.filter((player) => {
    if (selectedPosition === "ALL") return true;
    return player.position === selectedPosition;
  });

  const handlePlayerClick = (player: RosterPlayer) => {
    dispatch(openPlayerModal(player));
  };

  const handleAddPlayer = (player: RosterPlayer) => {
    dispatch(movePlayerToUnsigned(player));
  };

  if (filteredPlayers.length === 0) {
    return (
      <div className={styles.availablePlayersList}>
        <div className={styles.emptyState}>
          <p>
            {availablePlayers.length === 0
              ? "All players have been selected."
              : `No ${selectedPosition} players available.`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.availablePlayersList}>
      <div className={styles.header}>
        <p className={styles.count}>
          {filteredPlayers.length} player{filteredPlayers.length !== 1 ? "s" : ""} available
        </p>
      </div>

      <div className={styles.playersList}>
        {filteredPlayers.map((player) => (
          <PlayerListItem
            key={player.id}
            player={player}
            onClick={() => handlePlayerClick(player)}
            onAdd={() => handleAddPlayer(player)}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * PlayerListItem Component
 * Single player row with name, position, national team, club.
 *
 * Accepts both RosterPlayer and DisplayPlayer (enriched with stats).
 * Falls back gracefully if enrichment data not available.
 */
interface PlayerListItemProps {
  player: RosterPlayer;
  onClick: () => void;
  onAdd: () => void;
}

const PlayerListItem: React.FC<PlayerListItemProps> = ({
  player,
  onClick,
  onAdd,
}) => {
  const isEliminated = player.status === "eliminated";

  return (
    <button
      className={`${styles.playerCard} ${isEliminated ? styles.eliminated : ""}`}
      onClick={onClick}
      disabled={isEliminated}
      title={isEliminated ? `${player.name} - Eliminated from tournament` : `${player.name} - Click for details or use the + button to add`}
      aria-label={isEliminated ? `${player.name} - Eliminated from tournament` : `${player.name} - ${player.position}`}
    >
      <div className={styles.flag}>{player.flag}</div>

      <div className={styles.cardHeader}>
        <div className={styles.number}>{player.number || "—"}</div>
      </div>

      <div className={styles.cardContent}>
        <div className={styles.playerName}>{player.name}</div>
        <div className={styles.playerPosition}>{player.position}</div>
        <div className={styles.playerCode}>{player.code}</div>
      </div>

      {!isEliminated && (
        <div
          className={styles.addPlayerButton}
          onClick={(e) => {
            e.stopPropagation();
            onAdd();
          }}
          role="button"
          tabIndex={0}
          title="Add to Bench"
          aria-label={`Add ${player.name} to bench`}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.stopPropagation();
              onAdd();
            }
          }}
        >
          +
        </div>
      )}
    </button>
  );
};
