// ==============================
// Fantasy Scoring
// ==============================

export interface PlayerScore {
  playerId: number;
  totalPoints: number;
  breakdown: {
    minutesPoints: number;
    goalPoints: number;
    assistPoints: number;
    penaltyPoints: number;
    concededGoalPoints?: number;
  };
}

export interface TeamScore {
  teamId: number;
  totalPoints: number;
}