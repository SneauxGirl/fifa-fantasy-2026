import { useEffect } from 'react'
import { useAppDispatch } from './store'
import { setMatches } from './store/slices/matchesSlice'
import { initializeRoster } from './store/slices/rosterSlice'
import type { RosterPlayer, RosterSquad, Match } from './types/match'
import { Router } from './router'
import mockMatches from './data/matches.json'
import mockSquadsData from './data/squads.json'

function App() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    // Extract all players from squad official rosters
    const rosterPlayers: RosterPlayer[] = mockSquadsData.flatMap((s: any) =>
      (s.officialRoster || []).map((p: any) => {
        const status: "available" | "eliminated" = p.status === "eliminated" ? "eliminated" : "available";
        return {
          type: "player" as const,
          id: p.id,
          playerId: p.id,
          status,
          name: p.name,
          position: p.position,
          number: p.number,
          teamId: s.teamId,
          code: s.code,
          flag: s.flag,
          matchPoints: {},
        };
      })
    )

    // Transform squad data to RosterSquad format
    const rosterSquads: RosterSquad[] = mockSquadsData.map((s: any) => ({
      type: "squad" as const,
      id: s.teamId,
      teamId: s.teamId,
      status: "available" as const,
      name: s.name,
      code: s.code,
      flag: s.flag,
      matchPoints: {},
      coaches: s.coaches,
      officialRoster: s.officialRoster,
    }))

    // Load dummy data into Redux store
    dispatch(setMatches(mockMatches as Match[]))
    dispatch(initializeRoster({ players: rosterPlayers, squads: rosterSquads }))
  }, [dispatch])

  return <Router />
}

export default App
