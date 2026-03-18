// ==============================
// Players
// ==============================

export type Position = "GK" | "DEF" | "MID" | "FWD";
export type PositionFull = "Goalkeeper" | "Defender" | "Midfielder" | "Forward";
export type PlayerStatus = "starting" | "bench" | "not_expected";

// Per-match stats shape — mirrors API-Football /fixtures/players response.
// API refs: statistics[].games, .goals, .cards, .penalty
//
// null semantics (never omit a field — always be explicit):
//   saves: null          → outfield player; field does not apply
//   penaltiesMissed: null → GK; scoring rule explicitly excludes GK
//   penaltiesSaved: null  → outfield player; field does not apply
//   cleanSheet: null      → not eligible: FWD always; any position if played < 45 min
//   shootoutGoals: null   → match did not reach a penalty shootout
//   shootoutSaves: null   → outfield player OR match did not reach a penalty shootout
//   shootoutMisses: null  → match did not reach a penalty shootout
export interface PlayerMatchStats {
  minutesPlayed: number;          // API: games.minutes
  goals: number;                  // API: goals.total
  assists: number;                // API: goals.assists
  saves: number | null;           // API: goals.saves — null for outfield players
  penaltiesScored: number;        // API: penalty.scored — all positions; 0 if none
  penaltiesMissed: number | null; // API: penalty.missed — null for GK (rule excludes GK)
  penaltiesSaved: number | null;  // API: penalty.saved — null for outfield players
  yellowCards: number;            // API: cards.yellow (includes yellow-red first booking)
  redCards: number;               // API: cards.red + cards.yellowred (second yellow)
  ownGoals: number;               // derived from fixture events — all positions; 0 if none
  cleanSheet: boolean | null;     // derived: team conceded 0 AND player played ≥ 45 min — null if not eligible
  shootoutGoals: number | null;   // derived from fixture events — null if no shootout this match
  shootoutSaves: number | null;   // derived from fixture events — null if outfield OR no shootout
  shootoutMisses: number | null;  // derived from fixture events — null if no shootout this match
}

export interface Player {
  id: number;
  firstName: string;              // API: player.firstname
  lastName: string;               // API: player.lastname
  apiDisplayName: string;         // API: player.name — abbreviated (e.g. "L. Messi"); for mapping/logging only
  position: Position;
  positionFull?: PositionFull;
  nationality: string;            // API: player.nationality — Anglicized (e.g. "Netherlands"); used for API calls
  nationalityCode: string;        // FIFA 3-letter code (e.g. "NED") — mapped via countryNames.ts
  nationalityLocal: string;       // Locally preferred name (e.g. "Nederland") — mapped via countryNames.ts
  club: string;                   // API: statistics[].team.name — professional club name
  status: PlayerStatus;
  isMvp?: boolean;                // tournament MVP designation — toggles trophy badge on card
  price?: number;                 // Phase 8: budget constraint value
  photoUrl?: string;              // API: player.photo
  recentPerformance: PlayerMatchStats[]; // last 10 non-tournament match-level stats, most recent first
  tournamentPerformance?: PlayerMatchStats[]; // tournament match-level stats (populated once tournament begins)
}
