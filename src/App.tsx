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
    const squads = mockSquadsData.teams || [];

    //WHY is this here? Players and Squads should be completely separated Where am I using this?? #TODO
    // Extract all players from squad rosters
    const rosterPlayers: RosterPlayer[] = squads.flatMap((s: any) =>
      (s.players || []).map((p: any) => {
        const isEliminated = p.isEliminated;
        const playerCode = p.code || s.countryCode;
        // Generate synthetic ID for unmatched players: COUNTRY-NN (e.g., NED-01)
        const playerId = p.playerId || `${playerCode}-${String(p.number).padStart(2, '0')}`;
        return {
          type: "player" as const,
          playerId,
          pool: "available" as const,
          role: null,
          isEliminated,
          rosterElimination: isEliminated ? "resolved" : null,
          name: p.playerName,
          position: p.position,
          number: p.number,
          teamId: s.teamId,
          code: playerCode,
          flag: s.flag,
          matchPoints: {},
          totalPoints: 0,
          gamesComplete: false,
          substitute: false,
          playerGames: [],
          injury: { status: false, type: undefined },
        };
      })
    )

    // Transform squad data to RosterSquad format
    const rosterSquads: RosterSquad[] = squads.map((s: any) => {
      return {
        type: "squad" as const,
        id: s.teamId,
        teamId: s.teamId,
        pool: "available" as const,
        role: null,
        isEliminated: false,
        rosterElimination: null,
        name: s.teamName,
        code: s.countryCode,
        flag: s.flag,
        matchPoints: {},
        totalPoints: 0,
        gamesComplete: false,
        substitute: false,
        squadGames: [],
        coaches: s.coaches,
        officialRoster: s.players,
      };
    })

    // Load dummy data into Redux store
    dispatch(setMatches(mockMatches as Match[]))
    dispatch(initializeRoster({ players: rosterPlayers, squads: rosterSquads }))

    // Initialize national teams data (source of truth for elimination status)
    const nationTeamsSquads: RosterSquad[] = squads.map((s: any) => {
      const isEliminated = s.isEliminated || false;
      return {
        type: "squad" as const,
        id: s.teamId,
        teamId: s.teamId,
        pool: "available" as const,
        role: null,
        isEliminated,
        rosterElimination: isEliminated ? "resolved" : null,
        name: s.teamName,
        code: s.countryCode,
        flag: s.flag,
        matchPoints: {},
        totalPoints: 0,
        gamesComplete: false,
        substitute: false,
        squadGames: [],
        coaches: s.coaches,
        officialRoster: s.players,
      };
    })
    dispatch(initializeNationTeams(nationTeamsSquads))
  }, [dispatch])

  return <Router />
}

export default App
