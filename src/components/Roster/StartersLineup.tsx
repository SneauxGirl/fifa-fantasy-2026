import React from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { movePlayerToBench, movePlayerToStarter } from "../../store/slices/rosterSlice";
import {
  selectScoringPlayers,
  selectScoringPlayersGroupedByPosition,
  selectStarterSquads,
} from "../../store/selectors/rosterSelectors";
import type { RosterPlayer } from "../../types/match";
import styles from "./StartersLineup.module.scss";

/**
 * StartersLineup Component
 * Display 11-player formation (includes both Starter and UpNext players)
 * Players can be removed to bench via button click
 * UpNext players show with muted colors (locked until Thu 00:00)
 */
export const StartersLineup: React.FC = () => {
  const dispatch = useAppDispatch();
  const [isDragOver, setIsDragOver] = React.useState(false);

  // Show both Starter and UpNext players in formation
  const scoringPlayers = useAppSelector(selectScoringPlayers);
  const positionGroups = useAppSelector(
    selectScoringPlayersGroupedByPosition
  );
  const signedSquads = useAppSelector(selectStarterSquads);

  const handleRemoveStarter = (player: RosterPlayer) => {
    dispatch(movePlayerToBench(player));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const data = e.dataTransfer.getData("application/json");
      console.log("Drop received - raw data:", data);
      const parsed = JSON.parse(data);
      console.log("Drop parsed:", parsed);

      // Handle bench player drops
      if (parsed.type === "benchPlayer" && parsed.player) {
        console.log("Moving player to starter:", parsed.player.name);
        dispatch(movePlayerToStarter(parsed.player));
      } else {
        console.log("Drop data doesn't match benchPlayer type");
      }
    } catch (err) {
      console.log("Drop handler error:", err);
    }
  };

  return (
    <div className={styles.startersLineup}>
      <h3 className={styles.title}>STARTERS (4 Squads + {scoringPlayers.length}/11)</h3>

      {/* Signed Squads Section */}
      <div className={styles.squadsSection}>
        {signedSquads.map((squad) => (
          <div key={squad.teamId} className={styles.squadCard}>
            <span className={styles.squadFlag}>{squad.flag}</span>
            <span className={styles.squadName}>{squad.code}</span>
          </div>
        ))}
        {signedSquads.length < 4 &&
          Array(4 - signedSquads.length)
            .fill(null)
            .map((_, i) => (
              <div key={`empty-${i}`} className={styles.squadCardEmpty}>
                <span>—</span>
              </div>
            ))}
      </div>

      {scoringPlayers.length === 0 ? (
        <div
          className={styles.emptyState}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <p>No starters yet</p>
          <p className={styles.hint}>Sign players and drag them here</p>
        </div>
      ) : (
        <div
          className={styles.formation}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {/* Goalkeeper */}
          <div className={styles.positionRow}>
            <div className={styles.positionLabel}>GK</div>
            <div className={styles.positionPlayers}>
              {positionGroups.gk.map((player) => (
                <StarterPlayerCard
                  key={player.playerId}
                  player={player}
                  onRemove={() => handleRemoveStarter(player)}
                />
              ))}
              {positionGroups.gk.length === 0 && (
                <div className={styles.emptySlot}>—</div>
              )}
            </div>
          </div>

          {/* Defenders */}
          <div className={styles.positionRow}>
            <div className={styles.positionLabel}>DEF</div>
            <div className={styles.positionPlayers}>
              {positionGroups.def.map((player) => (
                <StarterPlayerCard
                  key={player.playerId}
                  player={player}
                  onRemove={() => handleRemoveStarter(player)}
                />
              ))}
              {positionGroups.def.length === 0 && (
                <div className={styles.emptySlot}>—</div>
              )}
            </div>
          </div>

          {/* Midfielders */}
          <div className={styles.positionRow}>
            <div className={styles.positionLabel}>MID</div>
            <div className={styles.positionPlayers}>
              {positionGroups.mid.map((player) => (
                <StarterPlayerCard
                  key={player.playerId}
                  player={player}
                  onRemove={() => handleRemoveStarter(player)}
                />
              ))}
              {positionGroups.mid.length === 0 && (
                <div className={styles.emptySlot}>—</div>
              )}
            </div>
          </div>

          {/* Forwards */}
          <div className={styles.positionRow}>
            <div className={styles.positionLabel}>FWD</div>
            <div className={styles.positionPlayers}>
              {positionGroups.fwd.map((player) => (
                <StarterPlayerCard
                  key={player.playerId}
                  player={player}
                  onRemove={() => handleRemoveStarter(player)}
                />
              ))}
              {positionGroups.fwd.length === 0 && (
                <div className={styles.emptySlot}>—</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * StarterPlayerCard Component
 * Draggable player card in the starters lineup
 */
interface StarterPlayerCardProps {
  player: RosterPlayer;
  onRemove: () => void;
}

const StarterPlayerCard: React.FC<StarterPlayerCardProps> = ({ player, onRemove }) => {
  const initials = player.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return (
    <div className={styles.starterCard} title={player.name}>
      <div className={styles.cardContent}>
        <span className={styles.number}>{player.number}</span>
        <span className={styles.initials}>{initials}</span>
      </div>
      <button
        className={styles.removeBtn}
        onClick={onRemove}
        title="Move to bench"
        type="button"
      >
        ✕
      </button>
    </div>
  );
};
