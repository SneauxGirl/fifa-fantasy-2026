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
      // For now, default role is "bench" (can be "UpNext" if mid-week, handled in reducer)
      // TODO: Add timing logic to determine if after Wed 23:59 ET → role: "UpNext"
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

  const isGoalkeeper = selectedPlayer.position === "GK";

  // Check if player can be added (validator function from selector)
  const playerCanBeAdded = canAddToRoster(selectedPlayer);

  // Goalie-specific validation
  const goalieCapReached = isGoalkeeper && rosterGKCount >= 3;
  const rosterFullReached = activeSignedPlayers.length >= 18;

  // Total roster count for display (what it will be after signing)
  const totalRosterCount = activeSignedPlayers.length + 1;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Sign ${selectedPlayer.name}?`}>
      <div style={{ padding: "32px", textAlign: "center" }}>
        <h2 style={{ marginBottom: "12px", fontSize: "1.3rem", fontWeight: 700 }}>
          Sign {selectedPlayer.name}?
        </h2>

        <p style={{ color: "#666", marginBottom: "8px" }}>
          This will be player <strong>{totalRosterCount}</strong> of 18 on your roster.
        </p>

        {rosterFullReached && (
          <p style={{ color: "#d32f2f", marginBottom: "24px", fontSize: "0.9rem", fontWeight: 600 }}>
            ⚠ Signed roster full (18/18). Cannot sign additional players.
          </p>
        )}

        {!rosterFullReached && goalieCapReached && (
          <p style={{ color: "#d32f2f", marginBottom: "24px", fontSize: "0.9rem", fontWeight: 600 }}>
            ⚠ Goalkeeper cap reached (3/3). Cannot sign additional goalkeepers.
          </p>
        )}

        {!rosterFullReached && isGoalkeeper && !goalieCapReached && (
          <p style={{ color: "#666", marginBottom: "24px", fontSize: "0.9rem" }}>
            (Reminder: you have filled {rosterGKCount} of 3 goalkeeper slots, min. 1)
          </p>
        )}

        {!rosterFullReached && !isGoalkeeper && rosterGKCount < 3 && (
          <p style={{ color: "#666", marginBottom: "24px", fontSize: "0.9rem" }}>
            (Reminder: you have filled {rosterGKCount} of 3 goalkeeper slots, min. 1)
          </p>
        )}

        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button
            type="button"
            onClick={handleClose}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleClose();
              }
            }}
            style={{
              padding: "8px 20px",
              backgroundColor: "#e0e0e0",
              color: "#333",
              border: "2px solid transparent",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.95rem",
              fontWeight: 600,
              transition: "all 0.2s ease",
              outline: "none",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#0055a4";
              e.currentTarget.style.outline = "2px solid #0055a4";
              e.currentTarget.style.outlineOffset = "2px";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "transparent";
              e.currentTarget.style.outline = "none";
            }}
          >
            Cancel
          </button>
          <button
            type="button"
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
            style={{
              padding: "8px 20px",
              backgroundColor:
                !playerCanBeAdded || rosterFullReached || goalieCapReached
                  ? "#ccc"
                  : "#0055a4",
              color:
                !playerCanBeAdded || rosterFullReached || goalieCapReached
                  ? "#999"
                  : "white",
              border: "2px solid transparent",
              borderRadius: "6px",
              cursor:
                !playerCanBeAdded || rosterFullReached || goalieCapReached
                  ? "not-allowed"
                  : "pointer",
              fontSize: "0.95rem",
              fontWeight: 600,
              transition: "all 0.2s ease",
              outline: "none",
            }}
            onFocus={(e) => {
              if (!(!playerCanBeAdded || rosterFullReached || goalieCapReached)) {
                e.currentTarget.style.borderColor = "white";
                e.currentTarget.style.outline = "2px solid #0055a4";
                e.currentTarget.style.outlineOffset = "2px";
              }
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "transparent";
              e.currentTarget.style.outline = "none";
            }}
          >
            Yes, Sign Player
          </button>
        </div>
      </div>
    </Modal>
  );
};
