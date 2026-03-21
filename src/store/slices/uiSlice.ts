import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Match, RosterSquad, RosterPlayer } from "../../types/match";

type ModalCard = Match | RosterPlayer | RosterSquad;

interface UIState {
  modal: {
    type: "match" | "player" | "squad" | "squadSigning" | "playerSigning" | null;
    selectedCard: ModalCard | null;
  };
  sidebar: {
    open: boolean;
  };
}

const initialState: UIState = {
  modal: {
    type: null,
    selectedCard: null,
  },
  sidebar: {
    open: false,
  },
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openMatchModal: (state, action: PayloadAction<ModalCard>) => {
      state.modal.type = "match";
      state.modal.selectedCard = action.payload;
    },

    openPlayerModal: (state, action: PayloadAction<ModalCard>) => {
      state.modal.type = "player";
      state.modal.selectedCard = action.payload;
    },

    openSquadModal: (state, action: PayloadAction<ModalCard>) => {
      state.modal.type = "squad";
      state.modal.selectedCard = action.payload;
    },

    openSquadSigningModal: (state, action: PayloadAction<ModalCard>) => {
      state.modal.type = "squadSigning";
      state.modal.selectedCard = action.payload;
    },

    openPlayerSigningModal: (state, action: PayloadAction<ModalCard>) => {
      state.modal.type = "playerSigning";
      state.modal.selectedCard = action.payload;
    },

    closeModal: (state) => {
      state.modal.type = null;
      state.modal.selectedCard = null;
    },

    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebar.open = action.payload;
    },

    toggleSidebar: (state) => {
      state.sidebar.open = !state.sidebar.open;
    },
  },
});

export const {
  openMatchModal,
  openPlayerModal,
  openSquadModal,
  openSquadSigningModal,
  openPlayerSigningModal,
  closeModal,
  setSidebarOpen,
  toggleSidebar,
} = uiSlice.actions;

export default uiSlice.reducer;
