import React from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { closeModal } from "../../store/slices/uiSlice";
import { signPlayer } from "../../store/slices/rosterSlice";
import type { RosterPlayer } from "../../types/match";
import { Modal } from "./Modal";

export const PlayerSigningModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const modal = useAppSelector((state) => state.ui.modal);
  const isOpen = modal.type === "playerSigning";

  const selectedPlayer = modal.selectedCard as RosterPlayer | undefined;
  const signedPlayers = useAppSelector((state) => state.roster.players.signed);

  const handleClose = () => {
    dispatch(closeModal());
  };

  const handleConfirm = () => {
    if (selectedPlayer) {
      dispatch(signPlayer(selectedPlayer));
      dispatch(closeModal());
    }
  };

  if (!selectedPlayer) {
    return null;
  }

  const isGoalkeeper = selectedPlayer.position === "GK";

  // Only count non-eliminated signed players (these are the active roster)
  const activeSignedPlayers = signedPlayers.filter((p) => p.status !== "eliminated");
  const signCapReached = activeSignedPlayers.length >= 18;

  // Goalie cap logic
  const activeSignedGoalkeepers = signedPlayers.filter(
    (p) => p.position === "GK" && p.status !== "eliminated"
  ).length;
  const goalkeepersAfterSign = isGoalkeeper ? activeSignedGoalkeepers + 1 : activeSignedGoalkeepers;
  const goalieCapReached = isGoalkeeper && activeSignedGoalkeepers >= 3;

  // Total roster count for display
  const totalRosterCount = activeSignedPlayers.length + 1; // +1 for the player being signed

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div style={{ padding: "32px", textAlign: "center" }}>
        <h2 style={{ marginBottom: "12px", fontSize: "1.3rem", fontWeight: 700 }}>
          Sign {selectedPlayer.name}?
        </h2>

        <p style={{ color: "#666", marginBottom: "8px" }}>
          This is player <strong>{totalRosterCount}</strong> of 18 on your roster.
        </p>

        {signCapReached && (
          <p style={{ color: "#d32f2f", marginBottom: "24px", fontSize: "0.9rem", fontWeight: 600 }}>
            ⚠ Signed roster full (18/18). Cannot sign additional players.
          </p>
        )}

        {!signCapReached && goalieCapReached && (
          <p style={{ color: "#d32f2f", marginBottom: "24px", fontSize: "0.9rem", fontWeight: 600 }}>
            ⚠ Goalie cap reached (3/3). Cannot sign additional goalkeepers.
          </p>
        )}

        {!signCapReached && isGoalkeeper && !goalieCapReached && (
          <p style={{ color: "#666", marginBottom: "24px", fontSize: "0.9rem" }}>
            (Reminder: you have filled {goalkeepersAfterSign} of 3 goalie slots, min. 1)
          </p>
        )}

        {!signCapReached && !isGoalkeeper && activeSignedGoalkeepers < 3 && (
          <p style={{ color: "#666", marginBottom: "24px", fontSize: "0.9rem" }}>
            (Reminder: you have filled {activeSignedGoalkeepers} of 3 goalie slots, min. 1)
          </p>
        )}

        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button
            onClick={handleClose}
            style={{
              padding: "8px 20px",
              backgroundColor: "#e0e0e0",
              color: "#333",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.95rem",
              fontWeight: 600,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={signCapReached || goalieCapReached}
            style={{
              padding: "8px 20px",
              backgroundColor: signCapReached || goalieCapReached ? "#ccc" : "#0055a4",
              color: signCapReached || goalieCapReached ? "#999" : "white",
              border: "none",
              borderRadius: "6px",
              cursor: signCapReached || goalieCapReached ? "not-allowed" : "pointer",
              fontSize: "0.95rem",
              fontWeight: 600,
            }}
          >
            Yes, Sign Player
          </button>
        </div>
      </div>
    </Modal>
  );
};
