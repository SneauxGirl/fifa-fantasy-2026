# Services Architecture & Integration Guide

## Current Services Status

### Active Services
- ✅ **matchService.ts** (126 lines) — Data fetching & normalization
- ✅ **pollService.ts** (188 lines) — Polling orchestration

### Future Services (Not Yet Created)
- Phase 3: `apiFootball.ts` — Real API-Football integration
- Phase 4: `aiService.ts` — AI insights (Claude/OpenAI)
- Phase 6: `webSocket.ts` — WebSocket live feed
- Phase 7: `authService.ts` — Firebase authentication

---

## Service Design: Separation of Concerns

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

### pollService.ts
**Purpose:** Orchestration layer — manages polling intervals and Redux updates

**Functions:**
- `calculateNextPollInterval(status, elapsed)` → Determines poll frequency based on match state
- `startPollingMatch(config)` → Begins polling a match with smart intervals
- `stopPollingMatch(matchId)` → Cancel polling for one match
- `stopAllPolls()` → Cancel all active polls
- `getActivePolls()` → List currently polled matches

**Polling Strategy:**
```
Match Status        | Poll Interval | Reason
─────────────────────────────────────────────
Not Started (NS)    | 5 min        | Low frequency, match hasn't begun
1st Half (1H)       | 60 sec       | Live play, frequent updates needed
2nd Half (2H)       | 60 sec       | Live play, frequent updates needed
Half Time (HT)      | 2 min        | Check for resumption
Full Time (FT)      | 2 min        | Might go to Extra Time
Penalty (PEN)       | 60 sec       | Live shootout
Cancelled/Abandoned | Never (∞)    | Match won't resume
```

**Redux Integration:**
- Updates `matchesSlice` with:
  - New scores (halftime, fulltime, extratime, penalty)
  - Match status changes
  - Poll metadata (lastFetched, nextFetchAt, pollInterval)

**Current State:** Fully implemented but never called
**Next Phase:** Wire up in a component/effect when user navigates to match view

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

### 1. Implement Real API Calls in matchService.ts
```typescript
// Replace mock implementation with:
const API_URL = "https://api-football-v1.p.rapidapi.com/v3";
const API_KEY = process.env.REACT_APP_API_FOOTBALL_KEY;

export const fetchAllMatches = async (): Promise<Match[]> => {
  const response = await fetch(
    `${API_URL}/fixtures?league=1&season=2026`,
    {
      headers: {
        "x-rapidapi-key": API_KEY,
        "x-rapidapi-host": "api-football-v1.p.rapidapi.com"
      }
    }
  );
  const data = await response.json();
  return normalizeMatches(data.response);
};
```

### 2. Wire Up Polling in Component
```typescript
// In a page/component that shows matches:
useEffect(() => {
  if (userHasRoster) {
    const rosterMatchIds = getRosterMatchIds(state);
    rosterMatchIds.forEach(matchId => {
      pollService.startPollingMatch({
        matchId,
        isRosterMatch: true,
        matchStartTime: getMatchStartTime(matchId)
      });
    });
  }

  return () => pollService.stopAllPolls();
}, [userHasRoster]);
```

### 3. Set Up Environment Variables
```
REACT_APP_API_FOOTBALL_KEY=your_key_here
```

---

## Why These Services Are Separate (Not Consolidated)

✅ **Good separation of concerns:**
- `matchService` = What to fetch (data layer)
- `pollService` = When/how often to fetch (orchestration layer)

✅ **Easier to test:**
- Can mock matchService responses to test polling strategy
- Can test polling intervals without hitting API

✅ **Easier to replace:**
- Phase 6: Replace pollService with WebSocket (matchService unchanged)
- Phase 3: Swap mock data for real API (pollService unchanged)

---

## Services Deleted (Phase 0 Stubs)

These were created as placeholders but are not needed until their respective phases:

- ~~aiService.ts~~ → Create fresh in Phase 4 with real implementation
- ~~apiFootball.ts~~ → Not needed; matchService handles API integration
- ~~authService.ts~~ → Create fresh in Phase 7 with Firebase SDK
- ~~webSocket.ts~~ → Create fresh in Phase 6; can replace pollService approach

**Why delete?** Stubs become outdated quickly. When you actually implement these phases, you'll have better context and newer dependencies. Better to create fresh than revive stale stubs.

---

## Future Considerations

### Phase 4: AI Integration
- Create `aiService.ts` with Claude API calls
- Use `matchService.fetchMatchDetails()` to get match context
- Call AI for injury predictions, lineup recommendations
- Cache results in `aiSlice.ts`

### Phase 6: WebSocket Upgrade
- Create `webSocket.ts` with socket.io or native WebSocket
- Replace `pollService` polling with real-time updates
- Keep same Redux dispatch pattern from pollService
- Fallback to polling if WebSocket disconnects

### Performance Optimization
- Add request deduplication (don't fetch same match twice in same minute)
- Add response caching with TTL (1 minute)
- Implement exponential backoff for API errors
