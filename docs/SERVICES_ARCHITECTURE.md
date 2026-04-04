# Services Architecture & Integration Guide

## Overview

Turn-based gameplay model: Users click "Play" to trigger a single API call per turn. No continuous polling. All data fetching and normalization happens in `matchService.ts`, then async thunk (`rosterThunks.ts`) orchestrates state updates in strict sequence.

---

## Current Services Status

### Active Services
- ✅ **matchService.ts** — Data fetching & normalization (turn-based)

### Deleted Services (Live-Action Only)
- ❌ **pollService.ts** — Removed (polling not used in turn-based model)
- ❌ **aiService.ts** — Removed (Phase 0)
- ❌ **webSocket.ts** — Removed (Phase 0, no live feed)

### Future Services (Not Yet Created)
- Phase 4: `authService.ts` — Firebase authentication & user sessions

---

## Service Design: Separation of Concerns

### matchService.ts
**Purpose:** Data layer — fetches and normalizes match results for a single turn

**Core Function:**
```typescript
getMatchResults(turnId: string): Promise<MatchResult>
  // Called by playTurn() async thunk in Step 0
  // Input: Turn ID (e.g., "Group_Stage_1", "R16", "Quarterfinals")
  // Returns: Match results data for all games in that turn
  // Data includes: scores, eliminations, events (goals, cards, substitutions)
  // No polling, no continuous updates — one call per "Play" click
```

**Supporting Functions:**
```typescript
normalizeMatchResults(apiResponse): MatchResult
  // Converts API-Football response to internal MatchResult type
  // Extracts: goals, assists, red/yellow cards, substitutions

calculatePlayerScore(match, player): number
  // Calculates fantasy points for a player in a single match
  // Called by async thunk Step 1 (updateScores)
  // Input: match result + player involvement
  // Returns: points earned (before substitute multiplier)

calculateSquadScore(matches[], squad): number
  // Calculates fantasy points for a squad across all turn matches
  // Called by async thunk Step 1 (updateScores)
  // Input: all matches in turn + squad's players
  // Returns: cumulative squad points for turn
```

**Current State:** Uses pre-pulled Squad/Player and mock Match 2022 World Cup data
**Next Phase (Phase 3):** Integrate with real API-Football v3 `/fixtures` endpoint calls

---

## Turn Completion Flow

**matchService.ts role in async thunk:**

```
User clicks "Play"
  ↓
playTurn() async thunk (rosterThunks.ts)
  ↓
Step 0: await matchService.getMatchResults(turnId)
  ↓ (returns match data)
  ↓
Step 1: dispatch(updateScores()) — uses calculatePlayerScore(), calculateSquadScore()
  ↓ Step 2-5: Additional Redux updates (lock, eliminate, modal, move)
```

See: `/docs/roster-logic-rebuild.md` Section 11 for full async thunk implementation.

---

## API-Football Response Mapping (Phase 3)

**Source:** API-Football v3 `/fixtures` endpoint

**Required fields from API response:**
```typescript
{
  fixture: {
    id: number,
    date: string (ISO 8601),
    status: {
      short: string,    // "NS" (not started), "1H" (1st half), "FT" (fulltime), etc.
      elapsed: number   // minutes elapsed in match
    }
  },
  teams: {
    home: { id, code, name },
    away: { id, code, name }
  },
  goals: {
    home: number,
    away: number
  },
  score: {
    halftime: { home, away },
    fulltime: { home, away },
    extratime: { home, away },
    penalty: { home, away }
  },
  events: Array<{         // Goals, substitutions, cards
    type: "Goal" | "Card" | "subst",
    detail: string,       // e.g., "Yellow Card", "Red Card"
    player: { id, name },
    time: { elapsed, extra }
  }>
}
```

**Normalize to internal MatchResult type** via `normalizeMatchResults()`

---

## Phase 3 Implementation TODO

### matchService.ts Updates
- [ ] Update `getMatchResults()` to call real API-Football endpoint
- [ ] Implement `normalizeMatchResults()` for API response mapping
- [ ] Define point calculation in `calculatePlayerScore()` per scoring formula (see roster-logic-rebuild.md Section 3.6)
- [ ] Define point calculation in `calculateSquadScore()` per scoring formula
- [ ] Add error handling for API failures (network, rate limits, invalid turn)
- [ ] Add caching layer (optional: cache results per turn to avoid re-fetching)

### matchService.ts Testing
- [ ] Test against 2022 World Cup historical data
- [ ] Verify score calculations match defined formula
- [ ] Test error scenarios (missing data, API unavailable)
- [ ] Test performance with all 32 teams + ~650 players

### Integration with Async Thunk
- [ ] Verify matchService calls work from `playTurn()` thunk
- [ ] Ensure API response data flows correctly to updateScores reducer
- [ ] Test full "Play" click → API → score updates flow

---

## Confirm Environment Variables (Phase 3)

**File:** `.env` (Vite config)

**And filters for League, SEason, Dates and potentially by Match**
```
VITE_API_FOOTBALL_KEY=your_api_key_here
VITE_API_FOOTBALL_BASE_URL=https://api-football-v1.p.rapidapi.com
VITE_API_FOOTBALL_HOST=api-football-v1.p.rapidapi.com
```

**Usage in matchService.ts:**
```typescript
const API_KEY = import.meta.env.VITE_API_FOOTBALL_KEY;
const API_BASE = import.meta.env.VITE_API_FOOTBALL_BASE_URL;
```

---

## Future Services (Phase 4+)

### authService.ts (Phase 4)
- Firebase authentication (sign up, login, logout)
- User session management
- JWT token refresh

### Potential Future (Phase 5+)
- `databaseService.ts` — User game saves (Firestore / Supabase)
- `analyticsService.ts` — Game event tracking

---