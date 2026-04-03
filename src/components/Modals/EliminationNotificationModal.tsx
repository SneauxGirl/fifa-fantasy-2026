import React from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { clearEliminationNotification } from "../../store/slices/uiSlice";
import { Modal } from "./Modal";
import styles from "./EliminationNotificationModal.module.scss";

/**
 * EliminationNotificationModal
 * Displays a notification when squads/players are eliminated from the tournament
 * Lists all newly eliminated members and allows user to dismiss
 * KEEP - use at start of new turn #TODO
 */
export const EliminationNotificationModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const notification = useAppSelector((state) => state.ui.eliminationNotification);

  const handleClose = () => {
    dispatch(clearEliminationNotification());
  };

  if (!notification.isOpen) {
    return null;
  }

  const totalEliminated = notification.squads.length + notification.players.length;

  return (
    <Modal
      isOpen={notification.isOpen}
      onClose={handleClose}
      title="Tournament Elimination"
    >
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>⚠️ Tournament Elimination</h2>
          <p className={styles.subtitle}>
            {totalEliminated} member{totalEliminated !== 1 ? "s" : ""} from your roster{" "}
            {totalEliminated === 1 ? "has" : "have"} been eliminated
          </p>
        </div>

        <div className={styles.content}>
          {/* Eliminated Squads */}
          {notification.squads.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Squads ({notification.squads.length})</h3>
              <div className={styles.list}>
                {notification.squads.map((squad) => (
                  <div key={`squad-${squad.id}`} className={styles.item}>
                    <span className={styles.flag}>{squad.flag}</span>
                    <span className={styles.name}>{squad.name}</span>
                    <span className={styles.badge}>SQUAD</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Eliminated Players */}
          {notification.players.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                Players ({notification.players.length})
              </h3>
              <div className={styles.list}>
                {notification.players.map((player) => (
                  <div key={`player-${player.playerId}`} className={styles.item}>
                    <span className={styles.flag}>{player.flag}</span>
                    <span className={styles.name}>{player.name}</span>
                    <span className={styles.position}>{player.position}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <p className={styles.message}>
          These members have been moved to the "Eliminated" section and will no longer contribute
          to your score.
        </p>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={handleClose}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleClose();
              }
            }}
            className={styles.dismissButton}
            aria-label="Dismiss elimination notification"
          >
            Got it
          </button>
        </div>
      </div>
    </Modal>
  );
};
