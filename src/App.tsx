import { useEffect } from 'react'
import { useAppDispatch } from './store'
import { setMatches } from './store/slices/matchesSlice'
import { initializeRoster } from './store/slices/rosterSlice'
import { initializeNationTeams } from './store/slices/nationTeamsSlice'
import { useTestUtils } from './hooks/useTestUtils'
import type { RosterPlayer, RosterSquad, Match } from './types/match'
import { Router } from './router'
import mockMatches from './data/matches.json'
import mockSquadsData from './data/squads.json'

function App() {
  const dispatch = useAppDispatch()
  useTestUtils() // Initialize dev test utilities

  useEffect(() => {
    // Extract all players from squad official rosters
    const rosterPlayers: RosterPlayer[] = mockSquadsData.flatMap((s: any) =>
      (s.officialRoster || []).map((p: any) => {
        const isEliminated = p.status === "eliminated";
        return {
          type: "player" as const,
          id: p.id,
          playerId: p.id,
          pool: "available" as const,
          role: null,
          isEliminated,
          rosterElimination: isEliminated ? "resolved" : null,
          name: p.name,
          position: p.position,
          number: p.number,
          teamId: s.teamId,
          code: s.code,
          flag: s.flag,
          matchPoints: {},
          totalPoints: 0,
          gamesComplete: false, // Will be calculated by reducer
          substitute: false,
          playerGames: [],
          injury: { status: false, type: undefined },
        };
      })
    )

    // Transform squad data to RosterSquad format
    const rosterSquads: RosterSquad[] = mockSquadsData.map((s: any) => {
      const isEliminated = s.status === "eliminated";
      return {
        type: "squad" as const,
        id: s.teamId,
        teamId: s.teamId,
        pool: "available" as const,
        role: null,
        isEliminated,
        rosterElimination: isEliminated ? "resolved" : null,
        name: s.name,
        code: s.code,
        flag: s.flag,
        matchPoints: {},
        totalPoints: 0,
        gamesComplete: false, // Will be calculated by reducer
        substitute: false,
        squadGames: [],
        coaches: s.coaches,
        officialRoster: s.officialRoster,
      };
    })

    // Load dummy data into Redux store
    // gamesComplete will be calculated dynamically by the reducer based on tournament date
    dispatch(setMatches(mockMatches as Match[]))
    dispatch(initializeRoster({ players: rosterPlayers, squads: rosterSquads }))

    // Initialize national teams data (source of truth for elimination status)
    const nationTeamsSquads: RosterSquad[] = mockSquadsData.map((s: any) => {
      const isEliminated = s.status === "eliminated";
      return {
        type: "squad" as const,
        id: s.teamId,
        teamId: s.teamId,
        pool: "available" as const,
        role: null,
        isEliminated,
        rosterElimination: isEliminated ? "resolved" : null,
        name: s.name,
        code: s.code,
        flag: s.flag,
        matchPoints: {},
        totalPoints: 0,
        gamesComplete: false,
        substitute: false,
        squadGames: [],
        coaches: s.coaches,
        officialRoster: s.officialRoster,
      };
    })
    dispatch(initializeNationTeams(nationTeamsSquads))
  }, [dispatch])

  return <Router />
}

export default App
