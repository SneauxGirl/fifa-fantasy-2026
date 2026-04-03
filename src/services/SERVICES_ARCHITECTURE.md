# Services Architecture & Integration Guide

**REVISIT THIS ENTIRE STRUCTURE  for Turnbased rather than Live GamePlay** #TODO

## Current Services Status

### Active Services
- ✅ **matchService.ts** (126 lines) — Data fetching & normalization
**DELETED **- ✅ **pollService.ts** (188 lines) — Polling orchestration

### Future Services (Not Yet Created)
- Phase 3: `apiFootball.ts` — Real API-Football integration
**DELETED** - Phase 4: `aiService.ts` — AI insights (Claude/OpenAI)
**DELETED** - Phase 6: `webSocket.ts` — WebSocket live feed
**Confirm revised phase**- Phase 4: `authService.ts` — Firebase authentication

---

## Service Design: Separation of Concerns

**REVISE**
### matchService.ts
**Purpose:** Data layer — fetches and normalizes match data

**Functions:**
- `fetchAllMatches()` → Get all tournament matches
- `fetchRosterMatches(teamIds)` → Get matches involving your roster teams
- `fetchMatchDetails(matchId)` → Get expanded match info + events
- `pollMatchScore(matchId)` → Wrapper for polling (calls fetchMatchDetails)
- `normalizeMatches(apiMatches)` → Converts API-Football response to internal Match type

**Current State:** Uses mock data with artificial delays
**Next Phase:** Replace mock implementation with real API-Football calls

**DELETED** 
### pollService.ts
**Purpose:** Orchestration layer — manages polling intervals and Redux updates

**REVISE** #TODO
**Redux Integration:**
- Updates `matchesSlice` with:
  - New scores (halftime, fulltime, extratime, penalty)
  - Match status changes
  - Poll metadata (lastFetched, nextFetchAt, pollInterval)

---

## API-Football Response Normalization

**Source:** API-Football v3 `/fixtures` endpoint

**Mapping to internal Match type:**
```typescript
{
  id: fixture.id,
  homeTeam: {
    id: teams.home.id,
    code: teams.home.code,
    name: teams.home.name
  },
  awayTeam: {
    id: teams.away.id,
    code: teams.away.code,
    name: teams.away.name
  },
  date: fixture.date,
  status: {
    short: fixture.status.short,      // "NS", "1H", "FT", etc.
    long: fixture.status.long,        // "Not Started", "First Half", etc.
    elapsed: fixture.status.elapsed   // Minutes elapsed in match
  },
  score: {
    halftime: { home, away },
    fulltime: { home, away },
    extratime: { home, away },
    penalty: { home, away }
  },
  events: fixture.events  // Goal, card, substitution events
}
```

---

## Phase 3 Integration Checklist (API-Football)

## REVISED - VITE project and 2022 turn based gameplay - no polling

### 1. Implement Real API Calls in matchService.ts


### 2. Wire Up Polling in Component

### 3. Set Up Environment Variables - reworked for VITE
```

---