// ==============================
// Teams
// ==============================
export interface TeamHistoricalPerformance {
  year: number;
  matchesPlayed: number;
  goalsFor: number;
  goalsAgainst: number;
  penalties: number;
}

export interface Team {
  id: number;
  name: string;
  code: string;                   // short code for UI
  flag: string;                   // emoji or image
  jerseyColors: [string, string]; // primary + secondary colors
  fifaRanking?: number;
  historicalPerformance: TeamHistoricalPerformance[]; // last 5 WC appearances
  players?: number[];             // optional array of Player IDs
}