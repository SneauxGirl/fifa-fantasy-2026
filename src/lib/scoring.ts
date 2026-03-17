// TODO: Logic for calculating points

//Notes: 
  // The concept is that players select up to 4 teams for a brackets style scoring. Each round their team stays in earns points, in addition to their teams' for/against points and these are cumulative. Teams lose points for penalties, and shootouts are worth ... I haven't decided. But not full goal points per goal. Probably .2 points per goal for the first two rounds because it's a round of 5. Once it goes to sudden death the winning goal counts as one goal.
   //Player points are per minutes played and per goal for/directly against. Goalies lose .3 for each goal scored against, a defender who is directly scored against loses .5 points, assists are +0.5. 1 point for every 5 minutes played, rounded to even points from the double decimal seconds (2.33 would round up to 5 min)
  //Players who are not expected to start will need to be noted as such somewhere on the dropdown.

import type { PlayerScore, TeamScore } from "../types/fantasyScore";
import type { Player } from "../types/player";
import type { Team } from "../types/team";

export const calculatePlayerScore = (player: Player): PlayerScore => {
  let minutesPoints = 0;
  let goalPoints = 0;
  let assistPoints = 0;
  let penaltyPoints = 0;
  let concededGoalPoints = 0;

  player.recentPerformance.forEach((match) => {
    minutesPoints += Math.round(match.minutesPlayed / 5);
    goalPoints += match.goals;
    assistPoints += match.assists * 0.5;
    penaltyPoints += match.penalties * -0.5;

    if (["GK", "DF"].includes(player.position)) {
      concededGoalPoints +=
        player.position === "GK" ? match.goals * -0.3 : match.goals * -0.5;
    }
  });

  const totalPoints =
    minutesPoints + goalPoints + assistPoints + penaltyPoints + concededGoalPoints;

  return {
    playerId: player.id,
    totalPoints,
    breakdown: {
      minutesPoints,
      goalPoints,
      assistPoints,
      penaltyPoints,
      concededGoalPoints: concededGoalPoints || undefined,
    },
  };
};

export const calculateTeamScore = (team: Team, playerScores: PlayerScore[]): TeamScore => {
  const totalPoints = playerScores
    .filter((ps) => team.players.includes(ps.playerId)) // FIX : define and to proper link
    .reduce((sum, ps) => sum + ps.totalPoints, 0);

  return {
    teamId: team.id,
    totalPoints,
  };
};