import React from "react";
import { useNavigate } from "react-router-dom";
import type { Match, Roster } from "../../types/match";
import { MatchCard } from "../MatchCard";
import { useAppDispatch, useAppSelector } from "../../store";
import { closeModal } from "../../store/slices/uiSlice";
import { selectMatchRoster } from "../../store/selectors/scoringSelectors";
import { selectStarterPlayers } from "../../store/selectors/rosterSelectors";
import { Modal } from "./Modal";

export const MatchCardModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const modal = useAppSelector((state) => state.ui.modal);
  const isOpen = modal.type === "match";

  // Get the selected match from the modal state
  const selectedMatch = modal.selectedCard as Match | undefined;

  // Get current roster from Redux for display only
  const roster = useAppSelector(selectMatchRoster);
  const starters = useAppSelector(selectStarterPlayers);

  const handleClose = () => {
    dispatch(closeModal());
  };

  const handleGoToRoster = () => {
    dispatch(closeModal());
    navigate("/roster");
  };

  if (!selectedMatch) {
    return null;
  }

  const hasFullStartingXI = starters.length >= 11;

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      {!hasFullStartingXI ? (
        <div style={{ padding: "32px", textAlign: "center" }}>
          <h2 style={{ marginBottom: "12px", fontSize: "1.3rem", fontWeight: 700 }}>
            Some of your players are still in the locker room!
          </h2>
          <p style={{ color: "#666", marginBottom: "24px" }}>
            You have {starters.length}/11 starters assigned. Complete your lineup before analyzing matches.
          </p>
          <button
            onClick={handleGoToRoster}
            style={{
              padding: "8px 16px",
              backgroundColor: "#0055a4",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.95rem",
              fontWeight: 600,
            }}
          >
            Update your starting lineup
          </button>
        </div>
      ) : (
        <MatchCard
          match={selectedMatch}
          roster={roster as Roster}
          onMemberClick={(member) => {
            // TODO: Navigate to player/squad modal based on member type
            console.log("Member clicked:", member);
          }}
        />
      )}
    </Modal>
  );
};
