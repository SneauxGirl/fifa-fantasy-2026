// ==============================
// Dashboard — Phase 1 data verification only
// No styling. Browser defaults only.
// Proves: JSON imports → TS types → Redux round-trip → render
// ==============================

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import { setMatches } from "../../../store/slices/matchSlice";

import playersData from "../../../data/players.json";
import teamsData   from "../../../data/teams.json";
import matchesData from "../../../data/matches.json";

import type { Player } from "../../../types/player";
import type { Team }   from "../../../types/team";
import type { Match }  from "../../../types/match";

const players = playersData as Player[];
const teams   = teamsData   as Team[];
const matches = matchesData as Match[];

export default function Dashboard() {
  const dispatch     = useAppDispatch();
  const storeMatches = useAppSelector((state) => state.matches.matches);
  const matchStatus  = useAppSelector((state) => state.matches.status);

  useEffect(() => {
    dispatch(setMatches(matches));
  }, [dispatch]);

  return (
    <div>
      <h1>FF26 — Phase 1 Data Check</h1>

      <h2>Players ({players.length})</h2>
      <ul>
        {players.map((p) => (
          <li key={p.id}>
            {p.firstName} {p.lastName} · {p.position} · {p.nationalityCode}
          </li>
        ))}
      </ul>

      <h2>Teams ({teams.length})</h2>
      <ul>
        {teams.map((t) => (
          <li key={t.id}>
            {t.name} ({t.code}) · FIFA #{t.fifaRanking}
          </li>
        ))}
      </ul>

      <h2>Matches — from JSON ({matches.length})</h2>
      <ul>
        {matches.map((m) => (
          <li key={m.id}>
            {m.homeTeam.code} vs {m.awayTeam.code} · {m.status.short}
          </li>
        ))}
      </ul>

      <h2>Matches — from Redux ({storeMatches.length}) · store status: {matchStatus}</h2>
      <ul>
        {storeMatches.map((m) => (
          <li key={m.id}>
            {m.homeTeam.code} vs {m.awayTeam.code} · {m.status.short}
          </li>
        ))}
      </ul>
    </div>
  );
}
