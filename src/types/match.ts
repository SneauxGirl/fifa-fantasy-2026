// ==============================
// Matches
// ==============================
export type MatchStatus = "upcoming" | "live" | "finished";

export type MatchEventType = "goal" | "yellow_card" | "red_card" | "penalty" | "substitution";

export interface MatchEvent {
  minute: number;
  type: MatchEventType;
  team: string;                  // team code
  playerId?: number;             // for goals/cards/penalties
  playerOutId?: number;          // for substitutions
  playerInId?: number;           // for substitutions
}

export interface MatchScore {
  home: number;
  away: number;
}

export interface Match {
  id: number;
  homeTeamCode: string;
  awayTeamCode: string;
  date: string;                  // ISO string
  status: MatchStatus;
  score: MatchScore;
  events: MatchEvent[];
}