import React from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { movePlayerToBench } from "../../store/slices/rosterSlice";
import {
  selectStarterPlayers,
  selectStartersGroupedByPosition,
} from "../../store/selectors/scoringSelectors";
import type { RosterPlayer } from "../../types/match";
import styles from "./StartersLineup.module.scss";

/**
 * StartersLineup Component
 * Display 11-player formation
 * Players can be removed to bench via button click
 */
export const StartersLineup: React.FC = () => {
  const dispatch = useAppDispatch();
  const starters = useAppSelector(selectStarterPlayers);
  const positionGroups = useAppSelector(selectStartersGroupedByPosition);
  const signedSquads = useAppSelector((state) => state.roster.squads.signed);

  const handleRemoveStarter = (player: RosterPlayer) => {
    dispatch(movePlayerToBench(player));
  };

  return (
    <div className={styles.startersLineup}>
      <h3 className={styles.title}>STARTERS (4 Squads + {starters.length}/11)</h3>

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

      {starters.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No starters yet</p>
          <p className={styles.hint}>Sign players and drag them here</p>
        </div>
      ) : (
        <div className={styles.formation}>
          {/* Goalkeeper */}
          <div className={styles.positionRow}>
            <div className={styles.positionLabel}>GK</div>
            <div className={styles.positionPlayers}>
              {positionGroups.gk.map((player) => (
                <StarterPlayerCard
                  key={player.id}
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
                  key={player.id}
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
                  key={player.id}
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
                  key={player.id}
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
