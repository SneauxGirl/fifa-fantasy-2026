## FF26 Fantasy Scoring Rules (Final)

### Definitions

* **Team** – The combination of the user's **Champion Teams** and **Players**; the total fantasy roster for scoring purposes.
* **Champion Team(s)** – The 4 teams selected by the user at the start of the tournament; score points automatically each week.
* **Player** – An individual non-Champion participant in the tournament; selected for the user's ROSTER and STARTER slots.
* **ROSTER** – The collection of all Champion Teams and Players available to the user for weekly selection.
* **STARTER** – A Player selected from the ROSTER to actively contribute points in a given week.
* **ELIMINATED** – Status for a Champion Team or Player removed from eligibility due to tournament elimination; greyed out in the UI.
* **SUBSTITUTE** – A Champion Team or Player added to the ROSTER after an elimination in permitted rounds; may score at 50% of standard points depending on timing of selection.

---

### 1️⃣ Initial Setup & Weekly Roster

* On initial selection, all **Champion Teams** and **Players** are added to a **ROSTER**.
* User selects **4 Champion Teams** and **18 Players** (by position, from any team) at the start of the tournament.
* **Champion Teams** are automatically included every week as STARTERS.
* Each week, the user selects **11 Players from the ROSTER** to be added as STARTERS. Only STARTERS are eligible to accumulate points for that week.
* Points are totaled from the STARTERS for that week, combined with the four **Champion Teams**.
* Points for the week are counted regardless of elimination status after the match.

### 2️⃣ Elimination & Substitutions

**Replacement rules for Champion Teams and Players (identical):**

1. **Group Stage or Round of 32 eliminations:** replacement Champion Teams or Players may be added at any time with **no penalty**.
2. **Round of 16 eliminations:** this is the **final round with replacement permitted**. Champion Teams or Players added at this time are flagged as **SUBSTITUTES** and score **50% of points and bonuses**.
3. **Quarterfinals and beyond:** no new Champion Teams or Players may be added, but ROSTER Players can still be rotated to fill STARTER roles as usual.

   * If the ROSTER does not have enough Players to fill all STARTER positions, those STARTER positions remain **unfilled** and score 0.
   * Similarly, unfilled Champion Team spots remain **unfilled** and score 0.
   * There is no additional penalty for unfilled spots beyond missed opportunity.

* Once a Champion Team or Player is eliminated, they are marked as **ELIMINATED** (greyed out) and removed from eligibility for STARTER selection until replaced.
* Substitutions only take effect starting the **following week** after they are added.

### 3️⃣ Starter Availability Notes

* STARTER slots that are empty but have available **Players** or **Champion Teams** in the ROSTER display as **“Unassigned”**.
* STARTER slots that are empty because all available **Players** or **Champion Teams** for that position have been eliminated display as **“Unavailable”**.
* ELIMINATED **Champion Teams** and **Players** remain visible in grey for strategic reference.

---

## 4️⃣ Champion Team / Player Scoring

### Match Result Points

| Result | Points |
| ------ | ------ |
| Win    | 10     |
| Draw   | 5      |
| Loss   | 0      |

* Assigned per match, consistent across tournament stages.

### Goals Scored / Conceded

* Goals Scored: +2 points per goal
* Goals Conceded: -1 point per goal
* Applies for every match, including group and knockout stages.

### Clean Sheet Bonus

* **Champion Team** keeps a clean sheet → +5 points per match

### Advancement Bonuses

* Awarded at the end of the week prior to matches in the next round:
  | Stage / Advancement    | Bonus Points |
  |------------------------|--------------|
  | Group Winner           | +30          |
  | Group Advances (other) | +20          |
  | Wins Round of 32       | +45          |
  | Wins Round of 16       | +60          |
  | Wins Quarterfinals     | +75          |
  | Wins Semifinals        | +100         |
  | Wins Final             | +125         |
* Points are cumulative, awarded once per advancement.

### Weekly Scoring Rules

* Points are calculated per match and summed for the week.
* Eliminated **Champion Teams** receive full points from their last match.
* Weekly totals include all **Champion Teams** plus STARTER **Player** points.

### Integration With Player Scoring

* **Champion Teams** treated as “team-players” with position = TEAM.
* Weekly total = sum of STARTER **Players** + 4 **Champion Teams**.
* Cumulative tournament score = sum of all weekly totals.
* Replacement **Champion Teams** or **Players** added as SUBSTITUTES after Round of 16 eliminations score at **50%**, including all bonuses.
* Replacement Champion Teams or Players added earlier (group stage or Round of 32) score at **100%**.

### Tie-Breaker: "In-House Shootout"

* Uses **top five scoring STARTER Players** (Forward, Mid, Defender, Goalkeeper).
* Excludes **Champion Teams**; only Player goals count.
* Formula: sum of top 5 STARTER Player goals minus **Champion Team goalie goals conceded**.
* Higher resulting goal count wins.

---

## 5️⃣ Player Scoring Rules

### Participation Points

* +1 point per 5 minutes played (rounded up)
* Examples:

  * 1 min → +1
  * 5:01 → +2
  * 44:59 → +9
  * 45:00 → +9

### Goals

* Forward (FWD) → +3
* Midfielder (MID) → +4
* Defender (DEF) → +5
* Goalkeeper (GK) → +7
* Goals are assigned based on the Player’s **most forward position**

### Assists

* All positions → +2 points

### Clean Sheets

* GK → +7, DEF → +4, MID → +1, FWD → 0
* Player must play ≥ 45 minutes
* Clean sheet is awarded only at end of match
* If subbed out and team concedes later → no clean sheet points

### Goalkeeper Extras

* Saves → +1 each (documented via API)
* Penalty Saves (regular play) → +5
* Penalty Saves (shootout) → +2

### Penalty Scoring

**On-Field Penalties:**

* Penalty scored → counts as standard goal (applies goal points + hat trick if eligible)
* Penalty missed (non-GK) → -2
* Penalty saved (GK only) → +5

**Shootout Penalties:**

* Shootout goal → +1
* Shootout save (GK only) → +2
* Shootout fail → -2

### Negative Events

* Yellow Card → -3
* Red Card → -7
* Own Goal → -3
* Penalty Miss (non-GK, on-field) → -2

### Hat Trick Bonus

* Awarded **once per match**, at the end of the match
* Player scoring ≥ 3 goals in a single match → +21 points
* Includes on-field penalty goals; excludes shootout goals

### Scoring Scope

* Only STARTERS contribute to weekly points
* Bench Players are greyed out, do not contribute to weekly score
* Bench points are visible for strategic consideration

### Substitutions

* No auto-bench substitutions
* If a STARTER does not play → 0 points for that slot
* Substitutions only allowed after a **Champion Team** or **Player** elimination and take effect the following week

### Position System

* Positions: GK / DEF / MID / FWD
* Hybrid roles assigned to most forward role

### Cumulative Scoring

* Player scores are cumulative per match and per week
* Weekly scores feed into total tournament cumulative score
* Weekly MVP awarded to **highest scoring STARTER Player** (Champion Teams excluded); no bonus, just a trophy icon

---

### Notes

* All **Champion Teams** score evenly.
* Match points, goals, clean sheet, and advancement bonuses do not change throughout the tournament.
* Points per match and per goal remain consistent from group stage to final.
* Hat trick bonus counts only once per match, non-shootout goals included.
