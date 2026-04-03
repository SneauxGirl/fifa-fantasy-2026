import React from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { openPlayerModal } from "../../store/slices/uiSlice";
import { movePlayerToUnsigned } from "../../store/slices/rosterSlice";
import {
  selectActiveAvailablePlayers,
  selectEliminatedAvailablePlayers,
} from "../../store/selectors/rosterSelectors";
import { positionToFifa } from "../../lib/formatMapping";
import type { RosterPlayer } from "../../types/match";
import styles from "./AvailablePlayersList.module.scss";

type PositionType = "GK" | "DEF" | "MID" | "FWD" | "ALL";

interface AvailablePlayersListProps {
  selectedPosition: PositionType;
  searchQuery?: string;
}

// Helper: Normalize accents for matching (e.g., "André" → "ANDRE")
const normalizeAccents = (str: string): string => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
};

// Helper: Check if letters appear in order in text (e.g., "CS" in "CHRISTIAN SILVA")
const matchesInOrder = (text: string, query: string): boolean => {
  const normalizedText = normalizeAccents(text);
  const normalizedQuery = normalizeAccents(query);

  let queryIndex = 0;
  for (let i = 0; i < normalizedText.length && queryIndex < normalizedQuery.length; i++) {
    if (normalizedText[i] === normalizedQuery[queryIndex]) {
      queryIndex++;
    }
  }
  return queryIndex === normalizedQuery.length;
};

// Helper: Check if player matches search query
// Each space-separated parameter must match within a single field
// e.g., "MJ S" → "MJ" in name, "S" in name/code/number
// e.g., "MJS" → all three in same field (doesn't match Majid + IRN)
const playerMatchesSearch = (player: RosterPlayer, searchQuery: string): boolean => {
  if (!searchQuery) return true;

  const trimmedQuery = searchQuery.trim();
  if (!trimmedQuery) return true;

  // Split query by spaces into individual search parameters
  const searchParams = trimmedQuery.split(/\s+/).filter(p => p.length > 0);

  // Prepare player fields for matching
  const playerName = normalizeAccents(player.name);
  const playerCode = player.code.toUpperCase();
  const playerNumber = String(player.number || "").padStart(2, "0");
  const fields = [playerName, playerCode, playerNumber];

  // Each search parameter must match in at least one field
  return searchParams.every(param => {
    return fields.some(field => matchesInOrder(field, param));
  });
};

/**
 * AvailablePlayersList Component
 * Displays available players (active first, eliminated at bottom), filtered by position and search.
 * Click to view player details or add to roster.
 * Eliminated players are greyed out and disabled.
 *
 * Note: For full display data (firstName, lastName, stats), pass enrichedPlayers.
 * Falls back to RosterPlayer properties if enrichment data not provided.
 */
export const AvailablePlayersList: React.FC<AvailablePlayersListProps> = ({
  selectedPosition,
  searchQuery = "",
}) => {
  const dispatch = useAppDispatch();
  const activeAvailablePlayers = useAppSelector(selectActiveAvailablePlayers);
  const eliminatedAvailablePlayers = useAppSelector(selectEliminatedAvailablePlayers);
  const allAvailablePlayers = [...activeAvailablePlayers, ...eliminatedAvailablePlayers];

  // Filter by position and search
  const filteredPlayers = allAvailablePlayers
    .filter((player) => {
      // Apply position filter
      if (selectedPosition !== "ALL") {
        if (positionToFifa(player.position) !== selectedPosition) return false;
      }

      // Apply search filter
      if (!playerMatchesSearch(player, searchQuery)) return false;

      return true;
    })
    .sort((a, b) => {
      // Sort by country code first
      if (a.code !== b.code) {
        return a.code.localeCompare(b.code);
      }
      // Then sort by jersey number
      return (a.number || 0) - (b.number || 0);
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
            {allAvailablePlayers.length === 0
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
            key={player.playerId}
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
  const isEliminated = player.isEliminated;

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only open modal if clicking on the card itself, not the button
    if ((e.target as HTMLElement).closest(`.${styles.addPlayerButton}`)) {
      return;
    }
    if (!isEliminated) {
      onClick();
    }
  };

  const handleCardKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.key === "Enter" || e.key === " ") && !isEliminated) {
      // Don't trigger if focus is on the + button
      if ((e.target as HTMLElement) === e.currentTarget) {
        e.preventDefault();
        onClick();
      }
    }
  };

  return (
    <div
      className={`${styles.playerCard} ${isEliminated ? styles.eliminated : ""}`}
      role="button"
      tabIndex={isEliminated ? -1 : 0}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      aria-label={`${player.name} - ${player.position}. Click to view details${!isEliminated ? ", or press Tab to add to bench" : ""}`}
      style={{ cursor: isEliminated ? "not-allowed" : "pointer" }}
    >
      <div className={styles.flag}>{player.flag}</div>

      <div className={styles.cardHeader}>
        <div className={styles.number}>{player.number || "—"}</div>
      </div>

      <div className={styles.cardContent}>
        <div className={styles.playerName}>{player.name}</div>
        <div className={styles.playerPosition}>{positionToFifa(player.position)}</div>
        <div className={styles.playerCode}>{player.code}</div>
      </div>

      {!isEliminated && (
        <button
          type="button"
          className={styles.addPlayerButton}
          onClick={(e) => {
            e.stopPropagation();
            onAdd();
          }}
          title="Add to Bench"
          aria-label={`Add ${player.name} to bench`}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.stopPropagation();
              e.preventDefault();
              onAdd();
            }
          }}
        >
          +
        </button>
      )}
    </div>
  );
};
