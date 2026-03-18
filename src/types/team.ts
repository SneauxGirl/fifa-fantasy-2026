// ==============================
// Teams
// ==============================

export interface TeamHistoricalPerformance {
  year: number;
  matchesPlayed: number;
  goalsFor: number;
  goalsAgainst: number;
  penalties: number;              // penalty shootout appearances
}

export interface SquadPerformanceStats {
  goalsFor: number;               // aggregate goals scored by squad players
  goalsAgainst: number;           // aggregate goals conceded by squad players
  yellowCards: number;            // cumulative yellow cards
  redCards: number;               // cumulative red cards
  penaltiesScored: number;        // cumulative penalties scored
  penaltiesMissed: number;        // cumulative penalties missed
  cleanSheets: number;            // count of clean sheet matches
  shootoutGoals: number;          // aggregate shootout goals scored
  shootoutMisses: number;         // aggregate shootout misses
}

export interface Team {
  id: number;
  name: string;                   // Anglicized name — matches API: team.country (e.g. "Netherlands")
  nameLocal: string;              // Locally/legally preferred name (e.g. "Nederland")
  code: string;                   // FIFA 3-letter code — API: team.code (e.g. "NED")
  flag: string;                   // emoji flag or URL to SVG — API provides flag URLs
  logoUrl?: string;               // API: team.logo URL
  fifaRanking?: number;
  historicalPerformance: TeamHistoricalPerformance[]; // last 5 World Cup appearances
  players?: number[];             // optional array of Player IDs
  squadPerformance?: SquadPerformanceStats; // pre-tournament aggregate stats from squad's last 10 non-tournament matches
  tournamentPerformance?: SquadPerformanceStats; // tournament-only aggregate stats (populated once tournament begins)
}
