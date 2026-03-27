# Plan: Rebuild Roster Logic from Scratch

## Context

The current roster logic is inconsistent and has fundamental gaps:
- **Initialization ignores elimination status**: App.tsx hardcodes all squads to "available" regardless of JSON data, so "available (eliminated)" squads never reach the UI
- **Single status enum prevents valid states**: RosterMemberStatus is a single field that can't represent "available AND eliminated" simultaneously
- **Separate arrays for overlapping states**: `signed`, `starters`, and `bench` are stored in separate arrays, violating the logical relationship (starters + bench ⊂ signed)
- **Incomplete elimination logic**: `movePlayerToEliminated` only works on "signed" players, silently failing for "starter"/"bench"
- **Unclear state transitions**: No documented state machine; transitions are implicit in reducer guards

The rebuild will create a cleaner, explicit state machine with clear separation of concerns.

---

## Design

### 1. Type System Redesign

**Old model** (single enum):
```typescript
type RosterMemberStatus = "available" | "unsigned" | "signed" | "starter" | "bench" | "eliminated"
```
**Problem**: A squad can't be both "available" AND "eliminated"; states and roles are conflated

**Final model** (pool + role separation — **semantically distinct**, plus R16+ dynamics):
```typescript
type RosterPool = "available" | "unsigned" | "signed" | "eliminated"
type RosterRole = "starter" | "bench" | "UpNext" | "eliminatedSigned" | null

// Pool: WHERE the member is in the pipeline
// Role: HOW they function (only meaningful when signed/eliminated)

// RosterSquad extends:
{
  pool: RosterPool;          // available | unsigned (staging) | signed (roster) | eliminated
  role: RosterRole;          // null (for available/unsigned) | "starter" (for signed) | "eliminatedSigned"
  isEliminated: boolean;     // Parallel flag: true if tournament-eliminated
}

// RosterPlayer extends:
{
  pool: RosterPool;          // available | unsigned | signed (roster) | eliminated
  role: RosterRole;          // null (for available/unsigned) | "starter" | "bench" | "eliminatedSigned"
  isEliminated: boolean;     // Parallel flag: true if tournament-eliminated
}

// Role mapping by pool (final):
// pool: "available"  → role: null (unselected, no role yet)
// pool: "unsigned"   → role: null (staging, awaiting sign confirmation)
// pool: "signed"     → role: "starter" (squads always; players in formation, scoring)
//                   OR role: "bench" (players in roster, not in formation, no scoring)
//                   OR role: "UpNext" (newly signed/swapped mid-week, in formation but locked out of scoring until Thu 00:00)
// pool: "eliminated" → role: "eliminatedSigned" (historical: was signed, then eliminated)
```

**Key principle**: Pool and Role are distinct. Pool describes membership state; Role describes function. Role is only meaningful for signed/eliminated pools.

**File**: `/src/types/match.ts` — Update `RosterSquad` and `RosterPlayer` interfaces, remove `RosterMemberStatus`

---

### 2. Redux State Redesign

**Old structure** (6 separate player arrays):
```typescript
players: {
  available: RosterPlayer[];
  unsigned: RosterPlayer[];
  signed: RosterPlayer[];
  starters: RosterPlayer[];
  bench: RosterPlayer[];
  eliminated: RosterPlayer[];
}
```

**New structure** (filtered by pool property):
```typescript
players: {
  available: RosterPlayer[];        // pool: "available" (may have isEliminated: true)
  unsigned: RosterPlayer[];         // pool: "unsigned" (removed from available, not yet signed)
  signed: RosterPlayer[];           // pool: "signed" (in roster; role: "starter" | "bench")
  eliminated: RosterPlayer[];       // pool: "eliminated" (removed from signed; role: "eliminatedSigned")
}

squads: {
  available: RosterSquad[];         // pool: "available" (may have isEliminated: true)
  unsigned: RosterSquad[];          // pool: "unsigned" (staging bench, awaiting sign confirmation)
  signed: RosterSquad[];            // pool: "signed" (locked to roster; role: ALWAYS "starter", capped at 4)
  eliminated: RosterSquad[];        // pool: "eliminated" (removed from signed during tournament)
}
```

**Rationale**:
- `pool: "unsigned"` is a staging area for squads only — user can Remove or Sign them
- `signed` array contains only active roster members (capped at 4 for squads)
- `role: "starter" | "bench"` property on roster players determines formation vs bench
- For squads, `pool: "signed"` always implies `role: "starter"` (automatic, not a choice)
- Clearer mental model: available (initial) → unsigned (staging) → signed (locked) → eliminated (tournament)

**File**: `/src/store/slices/rosterSlice.ts` — Rewrite initial state and all reducers

---

### 3. State Machine & Transitions

**State Machine Notes:**
- **role: null** — Member has no functional role (available/unsigned pools): unselected or awaiting sign confirmation. No visual badge.

- **role: "starter"** — Member is in starting formation and scoring (pool: signed only). Visual: ⭐ starter badge on card.
  - Squads: auto-assigned "starter" when signed (all 4 signed squads are starters)
  - Players: user-assigned when dragged to formation grid (max 11, max 1 GK)
  - Prerequisites: `gamesComplete !== relevant` (scorable regardless of week progress)

- **role: "UpNext"** — Member is in starting formation but LOCKED OUT of scoring until Thu 00:00 EST (pool: signed only). Visual: muted colors, "UpNext" badge.
  - Occurs when: newly signed mid-week OR promoted from bench after games complete
  - Automatic transition: **Thu 00:00 EST** → role changes to "starter" (automatic, no user action)
  - Can be moved back to bench anytime while in UpNext state
  - Applies to: regular swaps AND eliminatedSigned replacements

- **role: "bench"** — Member is in roster but NOT in starting formation, no scoring (pool: signed only). Visual: no badge.
  - Can only promote to "starter" or "UpNext" if `gamesComplete === true` (must wait for all games to finish)

- **role: "eliminatedSigned"** — Member was signed, then eliminated during tournament (pool: eliminated only). Visual: "eliminatedSigned" badge for historical record.

- **Scoring multiplier**: If `substitute === true`, all points earned × 0.5 for entire tournament (R16 signings only)

- Role is ONLY meaningful when pool is "signed" or "eliminated"; check pool first before checking role
- **Visual indicators**: ⭐ = "starter" (scoring), muted = "UpNext" (locked), no badge = "bench" (no scoring)

**Squad state machine**:
```
┌─────────────────────────────────┐
│  AVAILABLE                      │
│  pool: "available"              │
│  role: null                     │
│  isEliminated: T/F              │  ← Can initialize with isEliminated: true
└─────────────────────────────────┘
  │
  ├─ (non-eliminated only, click/drag) → moveSquadToUnsigned()
  │
  └─ [if already signed] → moveSquadToEliminated() [tournament progression]

┌─────────────────────────────────────────────┐
│  UNSIGNED (Staging Bench)                   │
│  pool: "unsigned"                           │
│  role: undefined                            │
│  isEliminated: always false                 │
│  No limit on quantity                       │
└─────────────────────────────────────────────┘
  │
  ├─ (Remove button) → moveSquadToAvailable() [back to available pool]
  │
  └─ (Sign button → confirm dialog) → moveSquadToSigned() [locks to roster]
         ⚠️ Confirmation popup: "By signing this squad, you commit to this team
            for the duration of the tournament. You cannot change this selection
            until the tournament ends."
         [Cancel] or [Confirm Signing]

┌──────────────────────────────────────────┐
│  SIGNED (Roster)                         │
│  pool: "signed"                          │
│  role: ALWAYS "starter" (automatic)      │
│  Capped at 4 signed-active squads        │
│  isEliminated: always false              │
└──────────────────────────────────────────┘
  │
  └─ (tournament) → moveSquadToEliminated()
         ↓ If 4-squad cap is full and user tries to sign another:
           Show popup: "Squad cap reached. Consider adding this Squad
                       if one of your current selections is eliminated
                       in tournament play"

┌─────────────────────────────────────┐
│  ELIMINATED (Signed-Eliminated)     │
│  pool: "eliminated"                 │
│  role: "eliminatedSigned" (tracked) │
│  Remains visible in Roster, below   │
│  the Bench section                  │
└─────────────────────────────────────┘
```

**Player state machine**:
```
┌─────────────────────┐
│  AVAILABLE          │
│  pool: "available"  │
│  role: undefined    │
│  isEliminated: T/F  │  ← Can initialize with isEliminated: true
└─────────────────────┘
  │
  ├─ (non-eliminated only) → movePlayerToUnsigned() [optional staging]
  │
  └─ [if already signed] → movePlayerToEliminated() [during tournament]

┌──────────────────────────┐
│  UNSIGNED     │
│  pool: "unsigned"        │
│  role: undefined         │
│  isEliminated: always F  │
└──────────────────────────┘
  │
  ├─ → movePlayerToAvailable() [deselect]
  │
  └─ → movePlayerToSigned() [confirms selection, role: default "bench"]

┌────────────────────────────────┐
│  SIGNED (Roster)               │
│  pool: "signed"                │
│  role: "bench" (default)       │  ← Can drag into formation if <11 starters
│  Min 11, Max 18 roster players │
└────────────────────────────────┘
  │
  ├─ movePlayerToStarter() [role changes to "starter", requires <11 starters]
  │
  ├─ movePlayerToAvailable() [deselect from roster]
  │
  └─ movePlayerToEliminated() [tournament elimination]

┌────────────────────────────────┐
│  SIGNED + STARTER              │
│  pool: "signed"                │
│  role: "starter"               │  ← In 11-person formation
│  Max 11 starters               │
└────────────────────────────────┘
  │
  ├─ movePlayerToBench() [role changes to "bench", remove from formation]
  │
  └─ movePlayerToEliminated() [tournament elimination]

┌────────────────────────────────────┐
│  ELIMINATED                        │
│  pool: "eliminated"                │
│  role: "eliminatedSigned"          │ ← Tracks they were signed before elimination
│  Visible in Roster's Eliminated    │
│  section, below Bench              │
└────────────────────────────────────┘
```

---

### 4. Reducer Actions

**Old** (13 reducers):
- `movePlayerToUnsigned`, `movePlayerToAvailable`, `signPlayer`, `movePlayerToStarters`, `movePlayerToBench`, `movePlayerToStartersFromBench`, `movePlayerToEliminated`
- `moveSquadToUnsigned`, `moveSquadToAvailable`, `signSquad`, `moveSquadToEliminated`
- `initializeRoster`, `setRoundLocked`

**New** (13 reducers):
- **Squad transitions:**
  - `moveSquadToUnsigned` (available → unsigned, staging bench)
  - `moveSquadToAvailable` (unsigned → available, removal)
  - `moveSquadToSigned` (unsigned → signed with confirmation, auto-assigns role: "starter", validates 4-squad cap, also continues to display on the ROSTER with icon to denote starter)
  - `moveSquadToEliminated` (signed → eliminated, exclusive to Squad - Players have their own separate elimination logic)

- **Player transitions:**
  - `movePlayerToUnsigned` (available → unsigned, staging bench)
  - `movePlayerToAvailable` (unsigned → available, removal)
  - `movePlayerToSigned` (unsigned → signed, role: "bench" default, validates at <18, Goalkeeper cap at <3)
  - `movePlayerToStarter` (signed with role "bench" → signed with role "starter", validates <11 starters including up to <1 Goalkeeper but not required and no other position restrictions, also continues to display on the ROSTER with icon to denote starter)
  - `movePlayerToBench` (signed with role "starter" → signed with role "bench", starter icon removed)
  - `movePlayerToEliminated` (signed → eliminated, role becomes "eliminatedSigned", player National Team elimination data pulls exclusively, distinct from Squads)

- **Other:**
  - `initializeRoster` (respects isEliminated from JSON, initializes all pools, sets substitute flag for R16+ signings)
  - `setRoundLocked` (unchanged)
  - `validateSquadCapacity` (helper: checks if signed squad count < 4)
  - `updateGamesComplete` (triggered by match result, sets gamesComplete on affected squads/players)
  - `promoteUpNextToStarter` (automatic, Thu 00:00 EST: role "UpNext" → role "starter")
  - `calculateSubstitutePoints` (scoring: if substitute === true, multiply all earned points by 0.5)

**File**: `/src/store/slices/rosterSlice.ts`

---

### 5. Type Updates

**Files to update**:

1. **`/src/types/match.ts`** — Redefine RosterSquad and RosterPlayer (confirmed model):
   ```typescript
   export type RosterPool = "available" | "unsigned" | "signed" | "eliminated";
   export type RosterRole = "starter" | "bench" | "eliminatedSigned" | null;

   export interface RosterSquad {
     type: "squad";
     id: number;
     teamId: number;
     pool: RosterPool;                    // available | unsigned (staging) | signed (roster) | eliminated
     role: RosterRole;                    // Mapping:
                                          // - null when pool: "available" or "unsigned"
                                          // - "starter" when pool: "signed" and scoring
                                          // - "UpNext" when pool: "signed" but locked out (newly signed/swapped, muted visual until Thu 00:00)
                                          // - "eliminatedSigned" when pool: "eliminated"
     isEliminated: boolean;               // Parallel flag: true if tournament-eliminated
     gamesComplete: boolean;              // All games for this week completed? (allows bench↔starter swaps)
     substitute: boolean;                 // Signed during R16? Scores at 50% for entire tournament
     name: string;
     code: string;
     flag: string;
     matchPoints: Record<string, number>; // Points by game/week
     totalPoints: number;                 // All points (respects substitute 50% multiplier)
     coaches?: Coach[];
     officialRoster?: RosterPlayer[];
     squadGames?: Game[];                 // Games scheduled for this squad with isComplete flag
   }

   export interface RosterPlayer {
     type: "player";
     id: number;
     playerId: number;
     pool: RosterPool;                    // available | unsigned | signed (roster) | eliminated
     role: RosterRole;                    // Mapping:
                                          // - null when pool: "available" or "unsigned" (no role)
                                          // - "starter" when pool: "signed", in formation, scoring
                                          // - "bench" when pool: "signed", in roster, no scoring
                                          // - "UpNext" when pool: "signed", in formation, locked until Thu 00:00 (muted visual)
                                          // - "eliminatedSigned" when pool: "eliminated" (historical)
     isEliminated: boolean;               // Parallel flag: true if tournament-eliminated
     gamesComplete: boolean;              // All games for this week completed? (allows bench↔starter swaps)
     substitute: boolean;                 // Signed during R16? Scores at 50% for entire tournament
     name: string;
     position: "FWD" | "MID" | "DEF" | "GK";
     number: number;
     teamId: number;
     code: string;
     flag: string;
     matchPoints: Record<string, number>; // Points by game/week
     totalPoints: number;                 // All points (respects substitute 50% multiplier)
     injury?: PlayerInjury;
     eliminatedReason?: PlayerEliminationReason;
     playerGames?: Game[];                // Games scheduled for this player with isComplete flag
   }
   ```

---

### 6. App.tsx Initialization Update

**File**: `/src/App.tsx`

**Old problem** (line 42):
```typescript
status: "available" as const,  // Hardcoded, ignores JSON
```

**New approach** (respects isEliminated and pool from JSON):
```typescript
// Initialize Squads: all in "available" pool, respect isEliminated from JSON
const rosterSquads: RosterSquad[] = mockSquadsData.map((s: any) => ({
  type: "squad" as const,
  id: s.teamId,
  teamId: s.teamId,
  pool: "available" as const,
  role: null,                              // No functional role until signed
  isEliminated: s.status === "eliminated" ? true : false,  // ← Respect JSON
  name: s.name,
  code: s.code,
  flag: s.flag,
  matchPoints: {},
  coaches: s.coaches,
  officialRoster: s.officialRoster,
}));

// Initialize Players: all in "available" pool initially, respect isEliminated from JSON
// NOTE: Pre-eliminated players should NOT appear in available per user spec.
// If a player is pre-eliminated, initialize them in "eliminated" pool with role "eliminatedSigned"
const rosterPlayers: RosterPlayer[] = mockSquadsData.flatMap((s: any) =>
  (s.officialRoster || []).map((p: any) => ({
    type: "player" as const,
    id: p.id,
    playerId: p.id,
    pool: p.status === "eliminated" ? "eliminated" : "available" as const,
    role: p.status === "eliminated" ? "eliminatedSigned" : null,
    isEliminated: p.status === "eliminated" ? true : false,
    name: p.name,
    position: p.position,
    number: p.number,
    teamId: s.teamId,
    code: s.code,
    flag: s.flag,
    matchPoints: {},
  }))
);
```

---

### 7. Component Updates

Components will need to adapt to the new pool/role model and unsigned states. On Click for any Squad or Player from any location will trigger their SquadCard or PlayerCard... so we probably need to do + sign and drag and drop for the available teams, leaving on click for the Available card to pop the SquadCard

**Squads Section:**
- **SquadsSection.tsx** (unified component):
  - Display: all squads organized in three subsections:
    1. **Available Squads** — `pool === "available"`, active first, eliminated at bottom (greyed out)
       - Button: "Add to Bench" → `moveSquadToUnsigned()` (non-eliminated only)
    2. **Unsigned Squads** (staging bench) — `pool === "unsigned"`
       - Two buttons: Remove (X) → `moveSquadToAvailable()` | Sign → `moveSquadToSigned()`
       - Sign triggers confirmation dialog:
         ```
         🇧🇷
         Confirm Squad Signing
         Brazil

         ⚠️ Important:
         By signing this squad, you commit to this team for the duration
         of the tournament. You cannot change this selection until the
         tournament ends.

         Squad Code: BRA
         Coach: Dorival Júnior
         [Cancel] [Confirm Signing]
         ```
       - Validation on Sign: if `selectSignedSquads.length >= 4`, show popup:
         "Squad cap reached. Consider adding this Squad if one of your current selections is eliminated in tournament play"
    3. **Signed Squads** ** (remove from staging bench and immediately populate ROSTER Squad section and Starter) — `pool === "signed"` (capped at 4)
       - Display: squad flag, name, coach, players count
       - All have `role === "starter"` (automatic, no choice)
       - Status: locked (no remove option until elimination)
    4. **EliminatedSigned Squads** — `pool === "eliminated"` (below signed)
       - Greyed out, informational only
       - Shows which signed squads were eliminated during tournament

**ROSTER Component (Right Panel):**

- **SignedSquadsSection.tsx** (new):
  - Display: squads with `pool === "signed"` (capped at 4)
  - Show squad flag, name, coach, player count
  - **Visual indicator**: ⭐ or "Starter" badge (all signed squads are starters by definition)
  - Read-only display (locked until elimination)

- **EliminatedSquadsSection.tsx** (new):
  - Display: squads with `pool === "eliminated"` (below signed squads)
  - Greyed out, informational only
  - Historical record of which squads were eliminated

- **StartersLineup.tsx** (update):
  - Display: **11-slot formation grid** with players with `pool === "signed" && (role === "starter" OR role === "UpNext")`
  - **Visual indicators**:
    - ⭐ badge = `role: "starter"` (scoring actively)
    - 🔒 muted colors = `role: "UpNext"` (locked, no scoring until Thu 00:00)
  - **Constraints**: Max 11 starters total, max 1 Goalkeeper (no other position limits)
  - **Automatic transitions**: Thu 00:00 EST, all UpNext → Starter (automatic, visual update, muted colors removed)
  - **Interactions**:
    - Drag starter/UpNext to bench: `movePlayerToBench()` (removes ⭐ and 🔒 badges)
    - Drag bench player to empty slot: `movePlayerToStarter()` → role becomes "UpNext" if after Wed 23:59 (adds 🔒 muted badge)
  - **Empty slots**: Show placeholder cards for unfilled positions (0-11 total)

- **RosterPlayersBench.tsx**:
  - Display: players with `pool === "signed" && role === "bench"`
  - **Constraints shown**: Max 18 roster players total (current count), max 3 Goalkeepers (current count)
  - **Game completion status**: Show which bench players' games are complete (🟢 for complete, ⏳ for in-progress)
  - **Interactions**:
    - Drag to starters: `movePlayerToStarter()` (only if `gamesComplete === true` AND <11 starters AND <1 GK)
    - Click remove: `movePlayerToAvailable()`
    - Disabled/greyed when: player games not yet complete OR starters full OR GK limit reached
  - **No visual indicators** (bench players don't have ⭐ badge)
  - **R16 substitutes**: If signed during R16, show "50% points" indicator (scores at half rate throughout tournament)

- **EliminatedPlayersSection.tsx**:
  - Display: players with `pool === "eliminated"` (below bench)
  - Show role: `role === "eliminatedSigned"` (historical)
  - Informational only

**Players Selection (Left Panel):**
- **AvailablePlayersList.tsx**:
  - Display: all players with `pool === "available"`
  - Active at top, eliminated at bottom (greyed out)
  - Button: "Add to Roster" → `movePlayerToSigned()` (or through unsigned staging if preferred)
  - Must have space: `selectRemainingRosterSlots > 0`

---

### 8. Selector Updates (Unchanged from original)

**File**: `/src/store/selectors/scoringSelectors.ts`

Update selectors to use new pool/role model:
```typescript
// Squad Selectors
selectAvailableSquads = squads.filter(s => s.pool === "available" && !s.isEliminated)  // role: null
selectEliminatedAvailableSquads = squads.filter(s => s.pool === "available" && s.isEliminated)  // role: null
selectUnsignedSquads = squads.filter(s => s.pool === "unsigned")  // role: null (staging)
selectSignedSquads = squads.filter(s => s.pool === "signed")  // All have role: "starter" (capped at 4)
selectEliminatedSquads = squads.filter(s => s.pool === "eliminated")  // role: "eliminatedSigned"
selectRemainingSquadSlots = 4 - selectSignedSquads.length

// Player Selectors
selectAvailablePlayers = players.filter(p => p.pool === "available" && !p.isEliminated)  // role: null
selectEliminatedAvailablePlayers = players.filter(p => p.pool === "available" && p.isEliminated)  // role: null
selectUnsignedPlayers = players.filter(p => p.pool === "unsigned")  // role: null (staging)
selectSignedPlayers = players.filter(p => p.pool === "signed")  // All roster members (role: "starter" or "bench")
selectStarterPlayers = players.filter(p => p.pool === "signed" && p.role === "starter")  // In formation (11 max)
selectBenchPlayers = players.filter(p => p.pool === "signed" && p.role === "bench")  // In roster, not formation
selectEliminatedPlayers = players.filter(p => p.pool === "eliminated")  // role: "eliminatedSigned"
selectRemainingStarterSlots = 11 - selectStarterPlayers.length
selectRemainingRosterSlots = 18 - selectSignedPlayers.length
```

---

### 9. CRITICAL: Starters Formation Grid (Empty Slots)

**Current Issue**: StartersLineup.tsx only displays filled slots (players with `role: "starter"`). It should show an 11-slot formation grid with:
- **Filled slots**: Players with `pool: "signed" && role: "starter"`, draggable to bench
- **Empty slots**: Visual placeholders showing available positions (0-11 total)
- **Formation layout**: Positions arranged by soccer formation (e.g., 4-3-3, 3-5-2, etc.)

**Implementation approach**:
```typescript
// StartersLineup should render:
const totalStarterSlots = 11;
const filledSlots = selectStarterPlayers;  // pool: "signed" && role: "starter"
const emptySlotCount = totalStarterSlots - filledSlots.length;

// Render all 11 positions:
{/* Filled slots with player cards (draggable out) */}
{filledSlots.map(player => <PlayerCard key={player.id} player={player} />)}

{/* Empty slots (draggable targets from bench) */}
{Array.from({ length: emptySlotCount }).map((_, idx) => (
  <EmptySlot key={`empty-${idx}`} onDropPlayer={movePlayerToStarter} />
))}
```

**Why this matters**:
- Users need to see formation at a glance (how many slots left?)
- Drag-and-drop from bench becomes intuitive (drag to empty slot vs dragging to another player)
- Visual feedback that formation is incomplete until all 11 filled

---

### 10. Validation Rules Update

**File**: `/src/services/rosterService.ts`

Update validation logic to match new pool/role state model:

```typescript
// Squad Validation
canAddSquadToUnsigned = (squad: RosterSquad) => !squad.isEliminated && squad.pool === "available"
canSignSquad = () => selectSignedSquads.length < 4
validateSignedSquadCount = () => selectSignedSquads.length === 4  // Required to start tournament

// Player Validation
canAddPlayerToRoster = (player: RosterPlayer) =>
  !player.isEliminated &&
  player.pool === "available" &&
  selectSignedPlayers.length < 18 &&
  (player.position !== "GK" || selectSignedPlayers.filter(p => p.position === "GK").length < 3)

canPromoteToStarter = (player: RosterPlayer) =>
  selectStarterPlayers.length < 11 &&
  (player.position !== "GK" || selectStarterPlayers.filter(p => p.position === "GK").length < 1) &&
  player.gamesComplete === true  // Can only promote from bench after all games complete

validateRosterCount = () => selectSignedPlayers.length >= 11 && selectSignedPlayers.length <= 18
validateRosterPositions = () => {
  const gkCount = selectSignedPlayers.filter(p => p.position === "GK").length
  return gkCount <= 3 && gkCount >= 0  // No GK requirement, max 3
}

validateStarterCount = () => selectStarterPlayers.length === 11  // Required to start tournament
validateStarterPositions = () => {
  const gkCount = selectStarterPlayers.filter(p => p.position === "GK").length
  return gkCount <= 1  // Max 1 GK in starters, GK not required
}

// Tournament Rules
canModifyRoster = (roundLocked: boolean) => !roundLocked  // No changes once round/tournament locked

// Squad elimination: exclusive to squads (separate from player elimination)
canEliminateSquad = (squad: RosterSquad) => squad.pool === "signed" && squad.isEliminated === false
moveSquadToEliminated = (squad: RosterSquad) => {
  // Updates squad.pool to "eliminated" and role to "eliminatedSigned"
  // Does NOT automatically eliminate players on that squad
}

// Player elimination: based on national team status (pulls exclusively from player.isEliminated)
canEliminatePlayer = (player: RosterPlayer) =>
  player.pool === "signed" &&
  player.isEliminated === true  // Eliminated by national team, not squad selection

movePlayerToEliminated = (player: RosterPlayer) => {
  // Updates player.pool to "eliminated" and role to "eliminatedSigned"
  // Triggered when player.isEliminated becomes true during tournament
  // Independent of squad elimination status
}

// R16+ Game Completion Rules
canMoveFromBenchToStarter = (player: RosterPlayer) =>
  player.gamesComplete === true && selectStarterPlayers.length < 11
  // Must wait for all games to complete this week before swapping

canMoveFromStarterToBench = (player: RosterPlayer) =>
  player.gamesComplete === true
  // Can only bench a player after all their games are complete

// UpNext State Rules (Automatic Promotion & Scoring Lock)
autoPromoteUpNextToStarter = (timestamp: Date) =>
  timestamp.toUTCString().includes("Thursday 00:00 EST")
  // Automatic: role "UpNext" → role "starter" at Thu 00:00 EST
  // No user action required, all UpNext members transition simultaneously

canScorePoints = (member: RosterSquad | RosterPlayer) =>
  (member.role === "starter" || member.role === "UpNext") &&
  member.pool === "signed"
  // Only "starter" and "UpNext" members can score
  // BUT: UpNext members are locked out until Thu 00:00 (points applied retroactively)

// R16 Substitutes (Last Round to Add New Members)
canSignNewMember = (tournament: Tournament) =>
  tournament.currentRound !== "R16_COMPLETE" &&
  tournament.currentRound !== "Quarterfinals"
  // Can sign new members only through R16 Wed 23:59

markAsSubstitute = (tournament: Tournament): boolean =>
  tournament.currentRound === "Round16" &&
  tournament.currentWeek === "R16_week"
  // Only members signed during R16 get substitute flag

applySubstituteMultiplier = (points: number, substitute: boolean): number =>
  substitute ? points * 0.5 : points
  // All points × 0.5 for substitute members throughout entire tournament
```

---

## Files to Modify

### Core Refactor (in order):
1. `/src/types/match.ts` — Update RosterSquad, RosterPlayer types (pool, role, isEliminated)
2. `/src/store/slices/rosterSlice.ts` — Rewrite entire reducer with new state shape and actions
3. `/src/App.tsx` — Fix initialization to respect isEliminated from JSON
4. `/src/store/selectors/scoringSelectors.ts` — Update all selectors for pool/role model
5. `/src/services/rosterService.ts` — Update validation logic for new state model

**⚠️ CRITICAL ADDITION TO ROSTER COMPONENT:**
- **StartersLineup.tsx** must display an 11-slot formation grid with empty placeholders
- Currently only shows filled slots; users can't see available positions to drop players into

### Squad Component Updates:
6. `/src/components/Squads/SquadsSection.tsx` (update) — Already exists, unified display:
   - Ensure Unsigned subsection shows Remove/Sign buttons correctly
   - Ensure Sign button triggers confirmation dialog with cap validation

### ROSTER Component Updates (Right Panel):
7. `/src/components/Roster/SignedSquadsSection.tsx` (new) — Display signed squads, informational
8. `/src/components/Roster/EliminatedSquadsSection.tsx` (new) — Display eliminated squads, below signed
9. `/src/components/Roster/StartersLineup.tsx` (update) — **CRITICAL: Add empty slot visualization**
   - Currently shows only filled slots
   - Needs to show 11-slot formation grid with empty positions
   - Allow drag-drop from bench to fill available slots
10. `/src/components/Roster/RosterPlayersBench.tsx` — Show bench players, drag to starters (existing logic non-functional)
11. `/src/components/Roster/EliminatedPlayersSection.tsx` — Show eliminated players (may need update or may not exist yet)

### Player Selection (Left Panel):
12. `/src/components/Players/AvailablePlayersList.tsx` (update, but currently working visually) — Show available + eliminated players
    - Active players at top with "Add to Roster" button
    - Eliminated players at bottom (greyed out, disabled)

### Modal Updates:
13. `/src/components/Modals/SquadSigningConfirmation.tsx` — Confirmation dialog for moveSquadToSigned()
14. `/src/components/Modals/SquadCapReachedModal.tsx` — Popup when trying to sign 5th squad

---

## Verification

1. **Type safety**: TypeScript compiles without errors using new pool/role model

2. **Initialization**:
   - Load `squads.json` and `players.json`
   - All squads initialize to `pool: "available"` with proper `isEliminated` status, `role: null`
   - Eliminated squads show at bottom of available list, greyed out, no actions
   - Pre-eliminated players initialize to `pool: "eliminated"`, `role: "eliminatedSigned"`
   - Active players initialize to `pool: "available"`, `role: null`

3. **Squad Workflow - Unsigned (Staging)**:
   - Click "Add to Bench" on available squad → `pool: "unsigned"`, `role: null`
   - Squad appears in Unsigned Squads section
   - "Remove" button → squad returns to `pool: "available"`, `role: null`
   - "Sign" button → confirmation dialog with squad details (flag, name, code, coach)
   - Confirm → `pool: "signed"`, `role: "starter"` (auto-assigned)
   - Squad immediately appears in ROSTER SignedSquadsSection with ⭐ starter badge

4. **Squad Workflow - Signed (Locked)**:
   - Can have max 4 squads with `pool: "signed"`, `role: "starter"`
   - All Squads `pool: "signed"`are`role: "starter"`no else
   - If attempting 5th signature when cap is reached → popup: "Squad cap reached. Consider adding this Squad if one of your current selections is eliminated in tournament play"
   - Signed squads cannot be removed (locked for tournament)
   - Squad elimination is independent: if squad's `isEliminated` becomes true during tournament → `pool: "eliminated"`, `role: "eliminatedSigned"`
   - **Important**: Squad elimination does NOT automatically eliminate players on that squad
   - Players are eliminated exclusively based on their national team `isEliminated` status

5. **Squad Workflow - Eliminated**:
   - When squad `isEliminated` becomes true → moves to EliminatedSquadsSection (below signed)
   - Displays for historical record
   - Does NOT cascade elimination to players on that squad
   - Players remain in roster/starters unless their own national team is eliminated

6. **Player Workflow - Available to Roster**:
   - Click "Add to Roster" on available player → `pool: "signed"`, `role: "bench"` (default)
   - Player appears in RosterPlayersBench section
   - **Roster constraints**:
     - Max 18 roster players total (any position mix)
     - Max 3 Goalkeepers (no GK requirement)
     - Can add 0-18 of any position combination (18 FWD valid, 0 GK valid, etc.)
   - "Remove" button → player returns to `pool: "available"`, `role: null`

7. **Player Workflow - Bench to Starters**:
   - Drag player from bench to empty formation slot → `pool: "signed"`, `role: "starter"`
   - Player card shows ⚽ starter badge
   - **Starter constraints**:
     - Max 11 starters total
     - Max 1 Goalkeeper among starters (GK not required)
     - No FWD/MID/DEF position limits
   - Drag back to bench → `role: "bench"`, ⚽ badge removed

8. **Player Workflow - Eliminated**:
   - Player's national team is eliminated (based on `player.isEliminated` from JSON/tournament data)
   - Player automatically moves: `pool: "eliminated"`, `role: "eliminatedSigned"`
   - Moves to EliminatedPlayersSection (below bench)
   - Remains visible as historical record
   - **Independent of squad elimination**: A player on a signed squad can be eliminated without the squad being eliminated, and vice versa

9. **UpNext Workflow - Mid-Week Swaps (R16+)**:
   - When promoted from bench after Wed 23:59 ET:
     - Drag bench player to starter slot → `pool: "signed"`, `role: "UpNext"` (muted visual)
     - Player appears in starters formation with 🔒 muted badge
     - Player CANNOT score points until Thu 00:00
   - Automatic promotion (Thu 00:00 EST):
     - System automatically: role "UpNext" → role "starter" (visual: muted colors removed, ⭐ added)
     - Points earned retroactively applied (if any games played Thu)
   - Can move back to bench anytime while UpNext: `movePlayerToBench()` → role: "bench"

10. **Game Completion & Roster Locks**:
   - Tracking: Each squad/player has `gamesComplete: boolean` and `squadGames[]/playerGames[]` array with match results
   - Workflow:
     - Week Thu-Wed: Games play, results come in, `gamesComplete` updates when all matches finished
     - Once `gamesComplete === true`: starter can move to bench, bench can move to starter
     - Before Wed 23:59: User can swap players if games are complete
     - Wed 23:59: Roster locks, no more swaps allowed until next week
   - Display: Bench shows 🟢 (complete) or ⏳ (in-progress) indicator per player

11. **R16 Substitutes - 50% Scoring Rule**:
   - R16 eligibility: Thu 00:00 through Wed 23:59 of R16 week only
   - Activation: Any new squad/player signed during this window gets `substitute: true`
   - Scoring: `totalPoints = basePoints × 0.5` for entire tournament (not just R16)
   - Display: Shows "50% points" badge in roster/bench sections
   - Verification:
     - Substitute signed in R16 scores 10 pts in QF → counts as 5 pts
     - Substitute signed in R16 scores in SF → still counts as 50% (not 100%)
   - After R16 Wed 23:59: No new squads/players can be signed (roster fully locked)

12. **UI Consistency & Visual Indicators**:
   - **Eliminated items** in available pools: greyed out, disabled, no actions
   - **Unsigned squads** in staging section: Remove (X) + Sign buttons only
   - **Signed squads** in ROSTER: no actions (locked), ⭐ starter badge visible
   - **Starter players** in formation grid:
     - ⭐ badge = active, scoring
     - Drag to bench enabled
     - Show 11-slot grid with empty placeholders for unfilled positions
   - **UpNext players** in formation grid:
     - 🔒 muted colors/badge = locked, no scoring until Thu 00:00
     - Drag to bench enabled (can cancel UpNext anytime)
   - **Bench players**:
     - No badge (neither ⭐ nor 🔒)
     - Shows game completion status: 🟢 (complete, eligible to promote) or ⏳ (in-progress, locked)
     - Drag to starters enabled ONLY if `gamesComplete === true`
     - Shows position, GK count (X/3), roster count (X/18)
     - R16 substitutes show "50% points" indicator
   - **Eliminated section**: informational only, no actions, "eliminatedSigned" badge

13. **Validation & Constraints Display**:
   - Roster section shows: "Signed Players (X/18)" with GK count (X/3), game completion summary
   - Starters section shows: "Starters (X/11)" with GK count (X/1), includes both Starter and UpNext counts
   - Add button disabled when:
     - Roster is full (18 players) OR
     - Trying to add GK and already have 3 GK in roster
   - Promote to starters disabled when:
     - Already have 11 starters OR
     - Player is GK and already have 1 GK starter OR
     - `gamesComplete === false` (player's games not yet finished this week)
   - Thu 00:00 transition shows notification: "All UpNext players promoted to Starter"

---

## Summary of Breaking Changes

| Old | New |
|-----|-----|
| `status: RosterMemberStatus` (single enum) | **Three semantic properties**: `pool`, `role`, `isEliminated` |
| Pool values: "available" \| "unsigned" \| "roster" \| "eliminated" | Pool values: "available" \| "unsigned" \| "signed" \| "eliminated" |
| Role values: "starter" \| "bench" \| undefined | Role values: "starter" \| "bench" \| "UpNext" \| "eliminatedSigned" \| null |
| Role values mixed with pool meaning | **Role only meaningful for signed/eliminated pools** |
| 6 separate player arrays | Single array, filtered by `pool` + `role` |
| No explicit unsigned state | **Unsigned state added** (staging before sign confirmation) |
| Separate starters/bench arrays | Single signed array with `role: "starter" \| "bench" \| "UpNext"` |
| `movePlayerToStarters()` | `movePlayerToStarter()` (role changes to "starter" or "UpNext" if mid-week) |
| `movePlayerToEliminated()` only on signed | Works on any `pool: "signed"` player |
| `signSquad()` | `moveSquadToSigned()` (with confirmation dialog + cap validation) |
| No squad cap | **Squad cap: 4 signed squads** (popup enforcement) |
| Players don't show as "bench" | **Bench role explicitly defined** for signed-but-not-starter players |
| No mid-week roster swaps | **UpNext role allows mid-week swaps** (new players locked until Thu 00:00, muted visual) |
| No game tracking | **Game completion tracking** (`gamesComplete` flag, `playerGames[]` array) |
| Fixed roster after signing | **R16 substitutes** (signed during R16, score at 50% forever) |
| No automatic transitions | **Automatic Thu 00:00 promotion** (UpNext → Starter, automatic, no user action) |
