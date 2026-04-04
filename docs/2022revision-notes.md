# Gameplay revision notes for refactor 

## Turn 1: InitalState, loads from Squads.JSON regardless API or Mock Data state

- All Squads and Players start from Available.
- Dashboard shows Group Stage 1 Matches as upcoming
- User selects and confirms Roster and STarters.
-Conflict logic that currently shows on the match page will be integrated with the Player and Squad cards. **Player and Squad cards need to be edited** a bit so the see insights is a button on the card and onClick moves them to Unsigned. This is opposite the current Player setup, and Squads don't have a button at all
- Dashboard will show all Group Stage 1 matches as Live and Group Stage 2 Matches as Upcoming All group stage matches must show team group affiliation.

## Matches: Tournaments become the turn change as follows:

**Notes**
1. Group Stage 1 (Nov 20-26, 2022)
2. Group Stage 2 (Nov 27-Dec 3, 2022 - Cameroon v Brazil and Serbia v Switzerland)
3. Round of 16 (Dec 3, 2022 1A v2B - Dec 7)
4. Quarterfinals (Dec 9-11, 2022)
5. Semifinal (Dec 14-15, 2022)
6. Third Place and Final (Dec 16-17, 2022)

Use screenshots of tournament play schedule to help configure logic and set Upcoming Matches at Initialization

**Matches: Insights will be replaced by by Scoring Record**  showing Totals from each turn. It will start empty, then display a simple Squads points + Players points = Total points and a running tally will go in the header on the top right for both Roster and Matches

## Change of Turn
- After the User has updated their starters, they will have the option to go to the Tournament and select to "Play" Group Stage 1.
- Play will progress sequentially with each turn unlocking following play of the prior.
- onClick is a single API call to pull information for all games played in that week - specifically scoring, red card and yellow card related information by team and player - whatever we need for scoring tracking by squad and by player
- onClick also unlocks the dropdown showing the results of all matches played that week, which remains unlocked for the remainder of gameplay

### Scoring Record Component (NEW)
- **Replaces**: Current MatchInsights component
- **Content**: Shows "Squads points + Players points = Total points" per turn
- **Update timing**: First thing updated on "Play" onClick after API call
- **Behavior**: Static display until next "Play" is clicked
- **Cumulative**: Points compound from turn to turn, eliminated members keep points earned in their final turn
- **Header display**: Rolling count-up animation probably for combined total in top-right header only (post-API call), then static

### Turn Completion Sequence (async thunk)
Use async thunk to run updates in the following order:
1. Update all scores and score related statuses (update Scoring Record component first)
2. Round/turn score locks for all squads and players
3. Update eliminated status (if eliminated, prior score remains part of final individual and corporate total)
4. Elimination pop-up flags showing roster squads and players eliminated
5. All eliminated Squads and Players move to Eliminated or signedEliminated state

### Post-Scores Display
- All "played" matches will now display as Finished on the dashboard, the current turn's matches as "live" and the following turn's matches by position only (IE: 1A v 2B not Norway v Nederlands) as upcoming.
- **Finished matches remain visible** from the prior round (helpful reference for user decisions)
- User can take as long as needed to update Roster and/or Starters (sign replacements for eliminated signed members, adjust starters)
- User then proceeds to click "Play" on the next round

## Round Specific Logic

### Roster Availability by Round
- **Prior to Playing Group Stage 1**: All Squads and Players available for Roster selection
- **Prior to Playing Group Stage 2**: All non-eliminated, unsigned Squads and Players available for Roster selection at full points
- **Prior to Playing R16**: All non-eliminated, unsigned Squads and Players available for Roster selection at full points
- **Prior to Playing Quarterfinals**: Final replacements available as Substitute only (50% points)

### Key Notes on Availability
- "Non-eliminated, unsigned" means players/squads in `available` and `unsigned` pools (current logic, no changes)
- Eliminated signed members (pool: "eliminated", role: "eliminatedSigned") cannot be re-signed or replaced until next round opens availability
- **Important**: Eliminated members maintain their points from the turn they were eliminated
- Substitute flag (50% multiplier) applies ONLY to new signings made in Quarterfinals window, not to existing roster members
- All details compound into squad and player cards as game progresses