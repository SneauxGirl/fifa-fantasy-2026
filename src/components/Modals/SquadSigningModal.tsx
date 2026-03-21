import React from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { signSquad } from "../../store/slices/rosterSlice";
import { closeModal } from "../../store/slices/uiSlice";
import type { RosterSquad } from "../../types/match";
import { Modal } from "./Modal";
import styles from "./SquadSigningModal.module.scss";

/**
 * SquadSigningModal Component
 * Confirmation dialog for signing a squad to the roster
 * Shows tournament duration reminder and requires user confirmation
 */
export const SquadSigningModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const modal = useAppSelector((state) => state.ui.modal);
  const isOpen = modal.type === "squadSigning";
  const selectedSquad = modal.selectedCard as RosterSquad | undefined;

  const handleConfirm = () => {
    if (selectedSquad) {
      dispatch(signSquad(selectedSquad));
      dispatch(closeModal());
    }
  };

  const handleCancel = () => {
    dispatch(closeModal());
  };

  if (!selectedSquad) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={handleCancel}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.flag}>{selectedSquad.flag}</span>
          <h2 className={styles.title}>Confirm Squad Signing</h2>
        </div>

        <div className={styles.content}>
          <p className={styles.squadName}>{selectedSquad.name}</p>

          <div className={styles.reminder}>
            <p className={styles.reminderTitle}>⚠️ Important:</p>
            <p className={styles.reminderText}>
              By signing this squad, you commit to this team for the duration of the tournament.
              You cannot change this selection until the tournament ends.
            </p>
          </div>

          <div className={styles.details}>
            <div className={styles.detailItem}>
              <span className={styles.label}>Squad Code:</span>
              <span className={styles.value}>{selectedSquad.code}</span>
            </div>
            {selectedSquad.coaches && selectedSquad.coaches.length > 0 && (
              <div className={styles.detailItem}>
                <span className={styles.label}>Coach:</span>
                <span className={styles.value}>
                  {selectedSquad.coaches.map((c) => c.name).join(", ")}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.actions}>
          <button
            className={`${styles.button} ${styles.cancel}`}
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            className={`${styles.button} ${styles.confirm}`}
            onClick={handleConfirm}
          >
            Confirm Signing
          </button>
        </div>
      </div>
    </Modal>
  );
};
