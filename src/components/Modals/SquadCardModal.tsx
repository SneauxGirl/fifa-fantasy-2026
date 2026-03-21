import React from "react";
import type { RosterSquad } from "../../types/match";
import { useAppDispatch, useAppSelector } from "../../store";
import { closeModal } from "../../store/slices/uiSlice";
import { Modal } from "./Modal";

export const SquadCardModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const modal = useAppSelector((state) => state.ui.modal);
  const isOpen = modal.type === "squad";

  // Get the selected squad from the modal state
  const selectedSquad = modal.selectedCard as RosterSquad | undefined;

  const handleClose = () => {
    dispatch(closeModal());
  };

  if (!selectedSquad) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div style={{ padding: "20px" }}>
        <h3>{selectedSquad.name}</h3>
        <p>Squad details for {selectedSquad.code}</p>
        {selectedSquad.coaches && selectedSquad.coaches.length > 0 && (
          <p>
            <strong>Coaches:</strong> {selectedSquad.coaches.map((c) => c.name).join(", ")}
          </p>
        )}
        <p>
          <strong>Players in Squad:</strong> {selectedSquad.officialRoster?.length || 0}
        </p>
      </div>
    </Modal>
  );
};
