import './App.css'
import type { Player } from './types/player'
import type { Team } from './types/team'
import type { Match, Roster } from './types/match'
import playersData from './data/players.json'
import teamsData from './data/teams.json'
import matchesData from './data/matches.json'
import rosterData from './data/roster.json'
import { PlayerCard } from './components/PlayerCard'
import { SquadCard } from './components/SquadCard'
import { MatchCard } from './components/MatchCard'

const players = playersData as Player[];
const teams   = teamsData as Team[];
const matches = matchesData as Match[];
const roster  = rosterData as Roster;

function App() {
  const handleMemberClick = (member: any) => {
    console.log("Clicked roster member:", member);
    // TODO: navigate to PlayerCard or SquadCard
  };

  return (
    <>
      <section id="center">
        <h2 style={{ marginBottom: "20px" }}>Component Library</h2>

        <h3>PlayerCard</h3>
        <PlayerCard player={players[0]} fantasyStatus="starter" />

        <h3 style={{ marginTop: "30px" }}>SquadCard</h3>
        <SquadCard team={teams[0]} fantasyStatus="active" />

        <h3 style={{ marginTop: "30px" }}>MatchCard (Brazil vs Argentina - Live)</h3>
        <MatchCard
          match={matches[1]}
          roster={roster}
          onMemberClick={handleMemberClick}
        />

        <h3 style={{ marginTop: "30px" }}>MatchCard (Netherlands vs Brazil - Finished)</h3>
        <MatchCard
          match={matches[2]}
          roster={roster}
          onMemberClick={handleMemberClick}
        />
      </section>
    </>
  )
}

export default App
