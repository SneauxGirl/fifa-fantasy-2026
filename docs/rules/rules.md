## FF26 Fantasy Scoring Rules (Final)

### Definitions

* **Squad(s)** – The 4 national teams selected by the user at the start of the tournament; score points automatically each week. Squads are treated as their own position type (not GK/DEF/MID/FWD).
* **Player** – An individual footballer participant in the tournament; selected for the user's ROSTER and STARTER slots. Players have one of four positions: GK, DEF, MID, FWD. Players relationship to a Squad in real life does not affect gameplay other than elimination.
* **ROSTER** – The collection of all Squads and Players selected available to the user for weekly selection.
* **STARTER** – A Player selected from the ROSTER to actively contribute points in a given week. Squads are automatic STARTERS every week.
* **ELIMINATED** – Status for a Squad or Player removed from eligibility due to tournament elimination; greyed out in the UI.
* **SUBSTITUTE** – A Squad or Player added to the ROSTER after R16, scores at 50% of standard points.

---

### 1️⃣ Initial Setup & Weekly ROSTER

* On initial selection,**Squads** and **Players** are available for user to add to a **ROSTER**.
* User selects **4 Squads** and **18 Players** (by position, from any team) at the start of the tournament.
* **Squads** are automatically included every week as STARTERS.
* Each week, the user selects **11 Players from the ROSTER** to be added as STARTERS. Only STARTERS are eligible to accumulate points for that week.
* Points are totalled from the STARTERS for that week, combined with the four **Squads**.
* Points for the week are counted regardless of elimination status as a result of that squad or player's match.

#### Goalkeeper Constraints (Player ROSTER only)

* A maximum of **3 Goalkeepers (GK)** may be held on the Player ROSTER at any time.
* A maximum of **1 Goalkeeper (GK)** may be selected as a STARTER per week.
* These limits apply to the **Player position GK only**. Squads are their own position type and players within Squads are not counted against the GK cap.

### 2️⃣ Elimination & Substitutions

**Replacement rules for Squads and Players (identical):**

1. **Group Stage 1 and Group Stage 2:** replacement Squads or Players may be added for any elimiated Squad or Player with **no penalty**.
2. **Round of 16 eliminations:** this is the **final round with replacement permitted**. Squads or Players added at this time are flagged as **SUBSTITUTES** and score **50% of points and bonuses**.
3. **Quarterfinals and beyond:** no new Squads or Players may be added, but ROSTER Players can still be rotated to fill STARTER roles as usual.

   * If the ROSTER does not have enough Players to fill all STARTER positions, those STARTER positions remain **unfilled** and score 0.
   * Similarly, unfilled Squad spots remain **unfilled** and score 0.
   * There is no additional penalty for unfilled spots beyond missed opportunity.

* Once a Squad or Player is ELIMINATED, they are marked as **ELIMINATED** (greyed out) and removed from eligibility for STARTER selection until replaced.
* Substitutions only take effect starting the **following week** after they are added.

### 3️⃣ STARTER Availability Notes

* STARTER slots that are empty but have available **Players** or **Squads** in the ROSTER display as **"Unassigned"**.
* STARTER slots that are empty because all available **Players** or **Squads** for that position have been ELIMINATED display as **"Unavailable"**.
* ELIMINATED **Squads** and **Players** remain visible in grey for strategic reference.

---

## 4️⃣ Squad Scoring

### Match Result Points

| Result | Points |
| ------ | ------ |
| Win    | 10     |
| Draw   | 5      |
| Loss   | 0      |

* Assigned per match, consistent across tournament stages.
* Match result points are awarded only for **completed matches** (status: FT, AET, PEN).
* **Partial matches** (status: SUSP, ABD, INT) award goals-based points only — no result points.

### Goals Scored / Conceded

* Goals Scored: +2 points per goal
* Goals Conceded: -1 point per goal
* Applies for every match, including group and knockout stages.
* For partial matches, all goals scored in play completed are counted.

### Clean Sheet Bonus

* **Squad** keeps a clean sheet (0 goals conceded) → +5 points per match
* Awarded for completed and partial matches when no goals were conceded.

### Advancement Bonuses

* Awarded at the end of the week prior to matches in the next round:
  | Stage / Advancement    | Bonus Points |
  |------------------------|--------------|
  | Group Winner           | +40          |
  | Group Advances (other) | +20          |
- **remove all other advancement bonuses because results of this tourney are already known**

### Partial Match Handling

Matches interrupted before completion (API status: `SUSP`, `ABD`, `INT`) are scored as follows:

* Goals scored in play completed count normally (+2 per goal for Squads; position-based for Players).
* Goals conceded count normally (-1 per goal for Squads; affects Player clean sheets).
* No win/draw/loss result points are awarded.
* Score is derived from the best available data: `fulltime → halftime → 0`.

Matches not yet started or cancelled (status: `NS`, `PST`, `CANC`, `TBD`) score 0 points.

### Weekly Scoring Rules

* Points are calculated per match and summed for the week.
* ELIMINATED **Squads** and **Starters** receive full points from their last match.
* Weekly totals include all **Squads** plus STARTER **Player** points.

### Integration With Player Scoring

* **Squads** are treated as a unique position type (not GK/DEF/MID/FWD).
* Weekly total = sum of STARTER **Players** + 4 **Squads**.
* Cumulative tournament score = sum of all weekly totals.
* Replacement **Squads** or **Players** added as SUBSTITUTES after Round of 16 eliminations score at **50%**, including all bonuses.
* Replacement Squads or Players added earlier (Group Stage 1 and Group Stage 2) score at **100%**.

### Tie-Breaker: "In-House Shootout"

* Uses **top five scoring STARTER Players** (GK, DEF, MID, FWD).
* Excludes **Squads**; only Player goals count.
* Formula: sum of top 5 STARTER Player goals minus **STARTER GK goals conceded**.
* Players ranked by fantasy points, not by goals (provides better statistical variation in winner).
* Higher resulting goal count wins.
* Only non-shootout goals count.

---

## 5️⃣ Player Scoring Rules

### Goals (credited to Player)

* Forward (FWD) → +3
* Midfielder (MID) → +4
* Defender (DEF) → +5
* Goalkeeper (GK) → +7
* Goals are assigned based on the Player's **most forward position**

### Assists (credited to Player)

* All positions → +2 points

### Clean Sheets

* GK → +7, DEF → +4, MID → +1, FWD → 0
* Clean sheet is awarded only at end of match

**REMOVE: Player must play ≥ 45 minutes, * If subbed out and team concedes later → no clean sheet points - no game minutes available**

### Goalkeeper Extras (If I can get these from API calls)

**REMOVE: * Saves → +1 each (documented via API) - not easily available**
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
* Bench Players do not contribute to weekly score
* Bench points are visible for strategic consideration

### Substitutions

* No auto-bench substitutions
* If a STARTER does not play → 0 points for that slot
* Substitutions only allowed after a **Squad** or **Player** elimination and take effect the following week/round

### Position System

* Player positions: GK / DEF / MID / FWD
* Squads are their own position type and are not part of the GK/DEF/MID/FWD classification
* Hybrid roles assigned to most forward role

### Cumulative Scoring

* Player scores are cumulative per match and per week
* Weekly scores feed into total tournament cumulative score
* Weekly MVP awarded to **highest scoring STARTER Player** (Squads excluded); no bonus, just a trophy icon

---

### Notes

* All **Squads** score evenly (same point structure; no positional differentiation).
* Match points, goals, clean sheet, and advancement bonuses do not change throughout the tournament.
* Points per match and per goal remain consistent from group stage to final.
* Hat trick bonus counts only once per match, non-shootout goals included.
