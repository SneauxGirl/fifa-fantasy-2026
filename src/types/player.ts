// ==============================
// Players
// ==============================
export interface PlayerStats {
  minutesPlayed: number;
  goals: number;
  assists: number;
  penalties: number;
}

export interface Player {
  id: number;
  name: string;
  position: string;              // short code (e.g., "GK", "FW")
  positionFullName?: string;     // optional, full name (Goalkeeper, Forward)
  nationality: string;           // short code (e.g., "ARG")
  countryFullName?: string;      // optional, full country name
  professionalTeam: string;      // display name
  status: "starting" | "bench" | "not_expected";
  recentPerformance: PlayerStats[]; // last 10 matches
}