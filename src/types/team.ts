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

export interface Team {
  id: number;
  name: string;                   // Anglicized name — matches API: team.country (e.g. "Netherlands")
  nameLocal: string;              // Locally/legally preferred name (e.g. "Nederland")
  code: string;                   // FIFA 3-letter code — API: team.code (e.g. "NED")
  flag: string;                   // emoji flag or URL to SVG — API provides flag URLs
  logoUrl?: string;               // API: team.logo URL
  jerseyColors: [string, string]; // [primary, secondary] hex colors
  fifaRanking?: number;
  historicalPerformance: TeamHistoricalPerformance[]; // last 5 World Cup appearances
  players?: number[];             // optional array of Player IDs
}
