import React from "react";
import type { RosterPlayer } from "../../types/match";
import { useAppDispatch, useAppSelector } from "../../store";
import { closeModal } from "../../store/slices/uiSlice";
import { Modal } from "./Modal";
import { PlayerCard } from "../PlayerCard";

export const PlayerCardModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const modal = useAppSelector((state) => state.ui.modal);
  const rosterState = useAppSelector((state) => state.roster);
  const isOpen = modal.type === "player";

  // Get the selected player from the modal state
  const selectedPlayer = modal.selectedCard as RosterPlayer | undefined;

  // Determine fantasy status of the selected player
  const fantasyStatus: "available" | "starter" | "bench" | "eliminated" = React.useMemo(() => {
    if (!selectedPlayer) return "available";

    if (rosterState.players.starters.some((p) => p.id === selectedPlayer.id)) {
      return "starter";
    }
    if (rosterState.players.bench.some((p) => p.id === selectedPlayer.id)) {
      return "bench";
    }
    if (rosterState.players.eliminated.some((p) => p.id === selectedPlayer.id)) {
      return "eliminated";
    }
    if (rosterState.players.available.some((p) => p.id === selectedPlayer.id)) {
      return "available";
    }
    return "available"; // Default to available
  }, [selectedPlayer, rosterState.players.starters, rosterState.players.bench, rosterState.players.eliminated, rosterState.players.available]);

  const handleClose = () => {
    dispatch(closeModal());
  };

  if (!selectedPlayer) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <PlayerCard player={selectedPlayer} fantasyStatus={fantasyStatus} />
    </Modal>
  );
};
