import React from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { closeModal } from "../../store/slices/uiSlice";
import { movePlayerToSigned } from "../../store/slices/rosterSlice";
import {
  selectCanAddToSignedRoster,
  selectRosterGKCount,
  selectActiveSignedPlayers,
} from "../../store/selectors/rosterSelectors";
import type { RosterPlayer } from "../../types/match";
import { Modal } from "./Modal";
import styles from "./PlayerSigningModal.module.scss";

export const PlayerSigningModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const modal = useAppSelector((state) => state.ui.modal);
  const isOpen = modal.type === "playerSigning";

  const selectedPlayer = modal.selectedCard as RosterPlayer | undefined;
  const activeSignedPlayers = useAppSelector(selectActiveSignedPlayers);
  const rosterGKCount = useAppSelector(selectRosterGKCount);
  const canAddToRoster = useAppSelector(selectCanAddToSignedRoster);

  const handleClose = () => {
    dispatch(closeModal());
  };

  const handleConfirm = () => {
    if (selectedPlayer) {
      dispatch(
        movePlayerToSigned({
          player: selectedPlayer,
          role: "bench",
        })
      );
      dispatch(closeModal());
    }
  };

  if (!selectedPlayer) {
    return null;
  }

  const isGoalkeeper = selectedPlayer.position === "Goalkeeper";

  // Check if player can be added (validator function from selector)
  const playerCanBeAdded = canAddToRoster(selectedPlayer);

  // Goalie-specific validation
  const goalieCapReached = isGoalkeeper && rosterGKCount >= 3;
  const rosterFullReached = activeSignedPlayers.length >= 18;

  // Total roster count for display (what it will be after signing)
  const totalRosterCount = activeSignedPlayers.length + 1;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Sign ${selectedPlayer.name}?`}>
      <div className={styles.container}>
        <h2 className={styles.title}>
          Sign {selectedPlayer.name}?
        </h2>

        <p className={styles.rosterCountText}>
          This will be player <strong>{totalRosterCount}</strong> of 18 on your roster.
        </p>

        {rosterFullReached && (
          <div className={styles.warningText} role="alert">
            ⚠ Signed roster full (18/18). Cannot sign additional players.
          </div>
        )}

        {!rosterFullReached && goalieCapReached && (
          <div className={styles.warningText} role="alert">
            ⚠ Goalkeeper cap reached (3/3). Cannot sign additional goalkeepers.
          </div>
        )}

        {!rosterFullReached && isGoalkeeper && !goalieCapReached && (
          <p className={styles.reminderText}>
            (Reminder: you have filled {rosterGKCount} of 3 goalkeeper slots, min. 1)
          </p>
        )}

        {!rosterFullReached && !isGoalkeeper && rosterGKCount < 3 && (
          <p className={styles.reminderText}>
            (Reminder: you have filled {rosterGKCount} of 3 goalkeeper slots, min. 1)
          </p>
        )}

        <div className={styles.buttonGroup}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={handleClose}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleClose();
              }
            }}
            aria-label="Cancel signing this player"
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.confirmButton}
            onClick={handleConfirm}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (playerCanBeAdded && !rosterFullReached && !goalieCapReached) {
                  handleConfirm();
                }
              }
            }}
            disabled={!playerCanBeAdded || rosterFullReached || goalieCapReached}
            aria-label={`Confirm signing ${selectedPlayer.name}`}
          >
            Yes, Sign Player
          </button>
        </div>
      </div>
    </Modal>
  );
};
