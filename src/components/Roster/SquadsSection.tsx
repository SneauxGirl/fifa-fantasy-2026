import React from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { openPlayerModal, openSquadSigningModal } from "../../store/slices/uiSlice";
import { moveSquadToUnsigned, moveSquadToAvailable } from "../../store/slices/rosterSlice";
import type { RosterPlayer, RosterSquad } from "../../types/match";
import type { DisplayPlayer } from "../../lib/dataTransform";
import { nationalColors } from "../../lib/nationalColors";
import styles from "./SquadsSection.module.scss";

/**
 * SquadsSection Component
 * Displays signed squads with coaches and full rosters.
 * Click players to open PlayerCard modal.
 * Supports HTML5 drag-and-drop of squads from AvailableSquadsList.
 */
export const SquadsSection: React.FC = () => {
  const dispatch = useAppDispatch();
  const unsignedSquads = useAppSelector((state) => state.roster.squads.unsigned);
  const signedSquads = useAppSelector((state) => state.roster.squads.signed);
  const allSignedPlayers = useAppSelector((state) => state.roster.players.signed);
  const [dragOver, setDragOver] = React.useState(false);

  // Combine unsigned and signed for display
  const allSquads = [...unsignedSquads, ...signedSquads];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    try {
      const data = e.dataTransfer.getData("application/json");
      const payload = JSON.parse(data);

      if (payload.type === "squad" && payload.squad && signedSquads.length < 4) {
        dispatch(moveSquadToUnsigned(payload.squad));
      }
    } catch (error) {
      // Silently ignore invalid drops
    }
  };

  if (allSquads.length === 0) {
    return (
      <div
        className={styles.squadsSection}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <h2>Squads ({signedSquads.length}/4 confirmed)</h2>
        <div className={`${styles.emptyState} ${dragOver ? styles.dragOver : ""}`}>
          <p>No squads selected. Add squads in the selection area above, or drag them here.</p>
        </div>
      </div>
    );
  }

  const handlePlayerClick = (player: RosterPlayer) => {
    dispatch(openPlayerModal(player));
  };

  const handleRemoveSquad = (squad: RosterSquad) => {
    dispatch(moveSquadToAvailable(squad));
  };

  const handleSignUnsignedSquad = (squad: RosterSquad) => {
    dispatch(openSquadSigningModal(squad));
  };

  return (
    <div
      className={styles.squadsSection}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <h2>Squads ({signedSquads.length}/4 confirmed)</h2>

      <div className={`${styles.squadsList} ${dragOver ? styles.dragOver : ""}`}>
        {allSquads.map((squad) => {
          const isUnsigned = squad.status === "unsigned";
          const isEliminated = squad.status === "eliminated";
          const colors = nationalColors[squad.code] ?? ["#888", "#ccc", "#888"];
          const [primary] = colors;

          // Get players from this squad
          const squadPlayers = allSignedPlayers.filter(
            (p) => p.teamId === squad.teamId
          );
          const starters = squadPlayers.filter((p) => p.status === "starter");
          const bench = squadPlayers.filter((p) => p.status === "bench");

          return (
            <div
              key={squad.teamId}
              className={`${styles.squadCard} ${isUnsigned ? styles.unsigned : ""} ${isEliminated ? styles.eliminated : ""}`}
              style={{
                borderLeftColor: isEliminated ? "#999" : isUnsigned ? "#ffa500" : primary,
              }}
            >
              {/* Squad Header */}
              <div className={styles.squadHeader}>
                <div className={styles.squadInfo}>
                  <span className={styles.flag}>{squad.flag}</span>
                  <div className={styles.nameBlock}>
                    <h3 className={styles.squadName}>{squad.name}</h3>
                    {squad.coaches && squad.coaches.length > 0 && (
                      <p className={styles.coach}>
                        {squad.coaches.map((c) => c.name).join(", ")}
                      </p>
                    )}
                  </div>
                </div>
                <div className={styles.playerCount}>
                  <span className={styles.countLabel}>Players</span>
                  <span className={styles.countValue}>{squadPlayers.length}</span>
                </div>
                {isEliminated ? (
                  <div className={styles.eliminatedIcon} title="Squad eliminated from tournament">
                    ✕
                  </div>
                ) : isUnsigned ? (
                  <div className={styles.buttonGroup}>
                    <button
                      className={`${styles.actionButton} ${styles.remove}`}
                      onClick={() => handleRemoveSquad(squad)}
                      title={`Remove ${squad.name}`}
                      aria-label={`Remove ${squad.name} from selection`}
                    >
                      ✕
                    </button>
                    <button
                      className={`${styles.actionButton} ${styles.sign}`}
                      onClick={() => handleSignUnsignedSquad(squad)}
                      title={`Sign ${squad.name} to lock in`}
                      aria-label={`Sign ${squad.name} to lock in for tournament`}
                    >
                      ✓ Sign
                    </button>
                  </div>
                ) : (
                  <div className={styles.lockedIcon} title="Squad locked for tournament">
                    🔒
                  </div>
                )}
              </div>

              {/* Starting XI */}
              {starters.length > 0 && (
                <div className={styles.startingXI}>
                  <h4 className={styles.subsectionTitle}>
                    Starting XI ({starters.length})
                  </h4>
                  <div className={styles.playerGrid}>
                    {starters.map((player) => (
                      <PlayerBadge
                        key={player.id}
                        player={player}
                        onClick={() => handlePlayerClick(player)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Bench */}
              {bench.length > 0 && (
                <div className={styles.bench}>
                  <h4 className={styles.subsectionTitle}>
                    Bench ({bench.length})
                  </h4>
                  <div className={styles.playerGrid}>
                    {bench.map((player) => (
                      <PlayerBadge
                        key={player.id}
                        player={player}
                        onClick={() => handlePlayerClick(player)}
                        isBench
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * PlayerBadge Component
 * Small badge showing player info, clickable to open modal.
 * Accepts enriched player data with fallback to RosterPlayer properties.
 */
interface PlayerBadgeProps {
  player: RosterPlayer;
  enrichedData?: DisplayPlayer;
  onClick: () => void;
  isBench?: boolean;
}

const PlayerBadge: React.FC<PlayerBadgeProps> = ({
  player,
  enrichedData,
  onClick,
  isBench,
}) => {
  const isEliminated = player.status === "eliminated";
  const firstName = enrichedData?.firstName ?? "";
  const lastName = enrichedData?.lastName ?? "";

  // Create initials from enriched data or fallback to player name
  const getInitials = (): string => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`;
    }
    if (player.name) {
      const parts = player.name.split(" ");
      return parts.map((p) => p[0]).join("").slice(0, 2);
    }
    return "??";
  };

  const displayName = firstName && lastName ? `${firstName} ${lastName}` : player.name;

  return (
    <button
      className={`${styles.playerBadge} ${isBench ? styles.benchBadge : ""} ${
        isEliminated ? styles.eliminated : ""
      }`}
      onClick={onClick}
      title={displayName}
      aria-label={`${displayName} - ${player.position}`}
    >
      <span className={styles.number}>{player.number}</span>
      <span className={styles.initials}>{getInitials()}</span>
      <span className={styles.position}>{player.position}</span>
      {player.injury?.status && (
        <span className={styles.injuryIcon} title="Injured">
          🤕
        </span>
      )}
      {isEliminated && (
        <span className={styles.eliminatedIcon} title="Eliminated">
          ✕
        </span>
      )}
    </button>
  );
};
