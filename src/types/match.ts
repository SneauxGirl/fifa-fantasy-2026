// ==============================
// Matches
// ==============================

// API-Football fixture status short codes (all 16 possible values)
export type MatchStatusShort =
  | "NS"    // Not Started
  | "1H"    // First Half (live)
  | "HT"    // Half Time (live)
  | "2H"    // Second Half (live)
  | "ET"    // Extra Time (live)
  | "BT"    // Break Time between ET halves (live)
  | "P"     // Penalty Shootout (live)
  | "SUSP"  // Suspended
  | "INT"   // Interrupted
  | "FT"    // Full Time
  | "AET"   // After Extra Time
  | "PEN"   // After Penalties (decided by shootout)
  | "PST"   // Postponed
  | "CANC"  // Cancelled
  | "ABD"   // Abandoned
  | "TBD";  // Time To Be Defined

// API-Football fixture event type values
export type MatchEventType = "Goal" | "Card" | "subst" | "Var";

// API-Football fixture event detail values
// Using string & {} to allow unknown API passthrough values without losing autocomplete
export type MatchEventDetail =
  | "Normal Goal"
  | "Own Goal"
  | "Penalty"
  | "Header"
  | "Missed Penalty"
  | "Yellow Card"
  | "Red Card"
  | "Yellow Red Card"
  | "Goal cancelled"
  | "Card upgrade"
  | (string & {});

// Mirrors API-Football /fixtures/events response shape
export interface MatchEvent {
  time: {
    elapsed: number;              // match minute
    extra: number | null;         // stoppage time minutes (e.g. 45+2 → elapsed:45, extra:2)
  };
  team: {
    id: number;
    code: string;                 // 3-letter team code
  };
  player: {
    id: number;
    name: string;                 // API abbreviated name (e.g. "L. Messi")
  };
  assist: {
    id: number | null;
    name: string | null;          // assisting player for goals; player coming IN for substitutions
  };
  type: MatchEventType;
  detail: MatchEventDetail;
  comments?: string | null;
}

// Full score breakdown — mirrors API-Football fixture score object
export interface MatchScore {
  halftime: { home: number | null; away: number | null; };
  fulltime: { home: number | null; away: number | null; };
  extratime: { home: number | null; away: number | null; };
  penalty: { home: number | null; away: number | null; };
}

export interface Match {
  id: number;
  homeTeam: { id: number; code: string; name: string; };
  awayTeam: { id: number; code: string; name: string; };
  date: string;                   // ISO 8601 string (e.g. "2026-06-10T15:00:00Z")
  status: {
    short: MatchStatusShort;
    long: string;                 // Human-readable (e.g. "Match Finished", "Second Half")
    elapsed: number | null;       // Current minute — populated during live matches only
  };
  score: MatchScore;
  events: MatchEvent[];
}

// ─── Roster & Fantasy ─────────────────────────────────────────────────────

export type RosterMemberStatus = "starter" | "inactive" | "eliminated";

/**
 * A Squad selected in the user's roster.
 * Tracks fantasy points per match.
 */
export interface RosterSquad {
  type: "squad";
  id: number;                          // Team ID
  teamId: number;                      // same as id, for clarity
  status: RosterMemberStatus;
  name: string;
  code: string;
  flag: string;
  matchPoints: Record<string, number>; // matchId → points gained in that match
}

/**
 * A Player selected in the user's roster.
 * Tracks fantasy points per match.
 */
export interface RosterPlayer {
  type: "player";
  id: number;                          // Player ID
  playerId: number;                    // same as id, for clarity
  status: RosterMemberStatus;
  name: string;
  position: string;                    // FWD, MID, DEF, GK
  number: number;                      // Jersey number
  teamId: number;                      // National team ID
  code: string;                        // FIFA country code (e.g., "ARG", "BRA")
  flag: string;                        // Country flag emoji
  matchPoints: Record<string, number>; // matchId → points gained in that match
}

export type RosterMember = RosterSquad | RosterPlayer;

/**
 * User's fantasy roster.
 * 4 squads + 18 players (11 starters, 7 inactive).
 * Eliminated members retain historical points but don't count toward active tally.
 */
export interface Roster {
  squads: RosterSquad[];  // 4 squads
  players: RosterPlayer[]; // 18 players
}

/**
 * Summary of fantasy impact for a specific match.
 * Used by MatchCard to display which roster members were involved and their points.
 */
export interface MatchRosterImpact {
  matchId: string;
  activePoints: number;   // sum of starter member points only
  inactivePoints: number; // sum of inactive member points (informational only)
  members: Array<{
    member: RosterMember;
    pointsThisMatch: number;
    events: MatchEvent[]; // events that affected this member
  }>;
}
