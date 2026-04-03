______________________________

# FF26 Project Notes
______________________________

## Phase 0 — Setup & Skeleton - Complete 3/16/26

// ====== Goal: Get a working dev environment and repo structure. =====

1. Initialize project:
   - Vite + React + TypeScript

2. Create Github Repository and link

3. Create folder structure:

src/
  components/                 # Reusable UI components

    PlayerCard/
        index.ts                 # Barrel export
        PlayerCard.tsx           # Component logic & JSX
        PlayerCard.module.scss   # Component styles

    TeamCard/
        index.ts
        TeamCard.tsx
        TeamCard.module.scss

    MatchCard/
        index.ts
        MatchCard.tsx
        MatchCard.module.scss
        MatchTimeline.tsx        # Subcomponent for event timeline
        PlayerBreakdown.tsx      # Subcomponent for per-player fantasy points

    LineupSelection/
        index.ts
        LineupSelection.tsx
        LineupList.tsx           # List of selectable players by position
        DragDropBoard.tsx        # Drag & drop board for team selection

    InsightsPanel/
        index.ts
        InsightsPanel.tsx
        AIInsights.tsx           # AI-generated insights subcomponent

    Layout/
        index.ts
        Layout.tsx               # Main layout wrapper (dashboard, page shells)
    pages/              # Full pages/screens
        Dashboard/
        Lineup/
        Insights/
        ...
  
  data/               # Mock JSON, cached historical stats
    players.json
    teams.json
    matches.json
    historicalCache.ts  # optional TS helper for cached stats
  
  types/              # TypeScript interfaces
    player.ts
    team.ts
    match.ts
    fantasyScore.ts
  
  services/           # API calls and external integration
    apiFootball.ts    # REST API integration & normalization
    aiService.ts      # Claude/OpenAI helper
    webSocket.ts      # Live match feed connection
    authService.ts    # Optional Firebase / Supabase auth
    ...
  
  lib/                # Pure helper functions / algorithms / scoring
    scoring.ts        # Fantasy points calculations
    aiHelpers.ts      # Prompt building, parsing AI outputs
    utils.ts          # Generic helpers
  
  store/              # Redux store
    index.ts
    slices/
      lineupSlice.ts
      matchSlice.ts
      aiSlice.ts
      ...
  
  styles/             # SCSS files / global styles
    _variables.scss
    _mixins.scss
    main.scss
  
  assets/             # Images, fonts, icons
    logos/
    flags/
    playerPortraits/
    ...
  
  hooks/              # Custom React hooks
    useMatchFeed.ts
    useAIInsights.ts
    ...

4. Install essential dependencies:
   - Axios / Fetch for REST
   - redux + @reduxjs/toolkit for state management
   - react-dnd for drag & drop team selection
   - sass (SCSS support for styling)
   - ws (for WebSocket testing)
   - optional: @apollo/client + graphql (GraphQL client) for Phase 5

--- 

## Phase 1 — Mock Data & Core Types complete 3/17/2025

// ====== Goal: Define the shape of data before connecting APIs. =====

1. Finalize and define rules for selection and scoring

2. Create mock JSON:
   - players.json
   - teams.json
   - matches.json

3. Define TypeScript interfaces:
   - Player, Team, Match, FantasyScore

4. Ensure Redux store is initialized to hold:
   - Selected teams & players
   - AI insights
   - Match updates (for WebSocket feed later)

5. Test importing mock data and rendering simple lists in a dashboard component.
   - Complete 3/17/26 ![Data Check ScreenShot](Phase1-dataCheck.png)

// ===== Process Key: Use mock data first, swap in REST, then add AI / GraphQL / WebSocket. =====

---

## Phase 2 — Basic UI Components

// ====== Goal: Render interactive UI using mock data + establish component structure for live + fantasy features. =====

1. PlayerCard component:
   - Name
   - Position (normalized)
   - National team (jersey colors/icon + Country abreviation ie: NED for Nederlands)
   - Professional team (display name only)
   - Status (starting / not expected to start)
   - Recent performance stats (last 10 matches):
     - Minutes played
     - Goals
     - Assists
     - Penalties
   - Entry point for AI insights (tooltip or expandable)

2. TeamCard component:
   - Team name
   - Flag + jersey colors/icon
   - FIFA ranking (if available)
   - Historical performance (last 5 World Cup appearances):
     - Matches played
     - Goals for / against
     - Penalties
   - Entry point for AI insights (team-level trends)

3. MatchCard component:
   - Dynamic, real-time match component that:
     - Displays match state (upcoming / live / finished)
     - Shows live score and match minute
     - Tracks fantasy scoring impact (team + player contributions)
     - Highlights selected teams/players
     - Core subcomponents:
       - MatchHeader
         - Teams, flags, score, status
       - MatchStatusBar
         - Current minute, live indicator
       - FantasyImpact
         - Points gained/lost by user selections
       - ExpandToggle
         - Button or control to expand/collapse details
     - Expanded view (when `expanded = true`):
       - MatchTimeline
         - Goals, penalties, substitutions
       - PlayerBreakdown
         - Per-player fantasy points
       - AIInsights
         - Optional per-match or per-player insights

## Phase 2.5 — Architecture & Implementation Plan for Dashboard/Roster/FutureMatches

// ====== Goal: Plan full page structure, routing, state management, and data models before implementation. =====

### Key Design Decisions:

**Navigation Structure:**
- Three main pages:
  1. Dashboard (landing page) - overview of current/upcoming/past matches
  2. Roster (formerly "Lineup") - player/squad selection and management
  3. Future Matches - tournament brackets + insights and team strategy recommendations

**Dashboard Page Features:**
- Summary stats ticker (marquee style):
  - Tournament-to-date match scores
  - Coming matches with dates/times/locations
  - "Find Match Day Tickets" (StubHub link)
  - "Find Merch" (FIFA Store link)
- Match list (minimal view):
  - All upcoming, current, and last week's final scores
  - Non-roster matches show team/time/score only
  - Roster matches highlighted to indicate fantasy impact
  - Click roster match to open MatchCard modal
- Roster sidebar (collapsible on browser/tablet):
  - Shows current roster at-a-glance
  - "GO TO ROSTER" link/button to navigate to Roster page

**Roster Page Features:**
- Position filter (dropdowns, not checkboxes - tab-through friendly)
- Select position → show available players for that position
- Drag players between available/unsigned/signed/starters/bench
- Squads always displayed at top (max 4 signed)
- Validation rules (through Round 16):
  - Must have 11+ players signed to unlock starters/bench drag
  - Must have 4 squads signed
  - One dedicated goalie slot required
- Post-Round 16:
  - Roster locks to no new additions
  - Can still replace eliminated players
  - Players continue to be eliminated as tournament progresses
- Semantic HTML, aria labels, tab-through friendly

**Future Matches Page Features:**
- Tournament bracket view (groups → knockout stages)
- Mobile: dropdown/tab-through to select matches
- Desktop: full bracket display
- Click match for insights/recommendations panel
- Insights priority levels:
  - ⚠️ High Priority: team conflicts, strategic warnings
  - ℹ️ Info: lineup optimization, player recommendations
- "Click for insights" to trigger updates

---

### File Structure (Current):

```
src/
  pages/
    Dashboard.tsx           # Match summary, roster impact overview
    Roster.tsx              # Available players + squads, bench/starters
    FutureMatches.tsx       # Tournament bracket view & insights

  components/
    Navigation/
      TopNav.tsx
      Sidebar.tsx
      BottomNav.tsx
      ThemeToggle.tsx

    Dashboard/
      MatchList.tsx
      SummaryTicker.tsx
      RosterSidebar.tsx

    Roster/
      PositionFilter.tsx           # Dropdown: ALL, GK, DEF, MID, FWD
      AvailablePlayersList.tsx     # Grid cards (3-row fixed height, scrollable)
      AvailableSquadsList.tsx      # Squad selection cards
      RosterDragZone.tsx           # Unsigned players (GK/DEF/MID/FWD columns)
      RosterSidebar.tsx            # Goalie cap + validation display
      SquadsSection.tsx            # Squad status
      SquadSigningModal.tsx        # Squad confirmation modal
      AvailableSquadsList.tsx      # Available squad grid

    FutureMatches/
      BracketView.tsx
      BracketDropdown.tsx
      InsightsPanel.tsx

    Modals/
      Modal.tsx                    # Base modal wrapper
      MatchCardModal.tsx
      PlayerCardModal.tsx          # Status: available | starter | bench | eliminated
      SquadCardModal.tsx
      PlayerSigningModal.tsx       # Confirmation: "Player X of 18. Min. 1 of 3 goalies?"
      SquadSigningModal.tsx

    PlayerCard/
      PlayerCard.tsx               # Detailed stats + fantasy status badge

    SquadCard/
      SquadCard.tsx

    MatchCard/
      MatchCard.tsx
      MatchCard.module.scss

    Dashboard/
      MatchList.tsx
      MatchList.module.scss
      SummaryTicker.tsx
      SummaryTicker.module.scss
      RosterSidebar.tsx

    Shared/
      RosterSidebar.tsx

  store/
    index.ts
    slices/
      rosterSlice.ts               # Players: available, unsigned, signed, starters, bench, eliminated
      matchesSlice.ts              # Match data + live scores
      uiSlice.ts                   # Modal state, sidebar visibility
    middleware/
      eliminationMiddleware.ts      # Team elimination cascade logic

  services/
    matchService.ts                # getMatches(), normalizeData()
    pollService.ts                 # startPolling(), managePollingIntervals()
    rosterService.ts               # validateRoster(), canAddToStarters(), etc.
    SERVICES_ARCHITECTURE.md       # Detailed separation of concerns

  data/
    squads.json                    # 4 teams w/ officialRoster (id, name, position, number, flag, matchPoints)
    matches.json                   # Fixtures + live scores
    historicalCache.ts             # In-memory cache structure

  lib/
    nationalColors.ts              # nationalColors, nationalFlags, nationalConfederations, nationalMerchUrls
    scoring/
      calculateSquadScore.ts       # Match impact calculations
    dataTransform.ts               # enrichPlayerForDisplay(), transformMatch(), etc.

  layouts/
    AppLayout.tsx
    AppLayout.module.scss

  hooks/
    useTheme.ts                    # Light/dark/system theme management

  styles/
    tokens.scss                    # Sass design tokens (spacing, colors, fonts, shadows)
    THEME_GUIDE.md                 # Theme system documentation

  types/
    match.ts                       # RosterPlayer, RosterSquad, Match
    squad.ts                       # Squad types with pool states
    player.ts                      # Player types with elimination tracking
```

**Key Consolidations:**
- ✅ players.json + teams.json → squads.json officialRoster
- ✅ Layout/ → Navigation/
- ✅ Store uses slices/ subfolder + middleware for side effects
- ✅ Theme system: Sass design tokens + useTheme hook
- ✅ Modal confirmations: PlayerSigningModal, SquadSigningModal
- ✅ Available players: 3-row fixed height grid, scrollable
- ✅ Elimination logic: Redux middleware with three-path cascade (signed→eliminatedSigned, unsigned→available, available→stays)
- ✅ Responsive design: Tab-based mobile/tablet layout with 768px/767px breakpoints
- ✅ SCSS modules: Component-scoped styling with Sass tokens

---

4. Layout / Pages:
   - Dashboard page:
     - Overview of matches, scores, and fantasy impact
   - Lineup page:
     - Team selection (drag & drop)
     - Player selection (by position, checkbox list)
   - Insights panel:
     - Placeholder structure for:
       - Global strategy insights
       - Team selection guidance (ie: red flag when selecting two teams required to eliminate each other to proceed)
       - Player selection recommendations

5. Redux state integration for UI interactivity:
   - dragging teams
   - selecting players
   - placeholder insights

// ===== All components should support: =====
- Loading state (skeleton or spinner)
- Empty state (no data available)
- Error state (API failure fallback)

// ===== Checkpoint: all mock data should be renderable in the dashboard. ===== //

---------------------------------------------------------
### COMPLETE TO THIS POINT (3/27/26) 
_________________________________________________________

## Phase 3 — REST API Integration (MVP)

// ====== Goal: Replace mock JSON with real REST API calls. =====

1. Create services/apiFootball.ts with fetch/axios calls.

2. Normalize API responses:
   - Map all fields to TypeScript interfaces
   - Handle missing/null values
   - Retain short codes (country, position, etc.) for both UI and internal logic
   - Add supplemental fields with full names (e.g., `countryFullName`, `positionFullName`) for tooltips, etc.

3. Replace mock data in gameplay with API calls by tournament round.

4. Loading/error states for all components.

5. Clean up - polish and deploy

---

// ===== Problems for Future Me =====//

---

## Phase 4 — Auth / Database Integration

// ====== Goal: Allow users to save their fantasy teams. =====

1. Decide MVP approach:
   - Firebase Auth (fast, serverless) or
   - SQL (PostgreSQL / Supabase) for custom auth

2. Connect database:
   - Save user-selected lineups
   - Store historical performance / match updates

3. Secure API routes for CRUD operations:
   - Save team
   - Fetch team
   - Update / delete lineup

---

## Phase 5 — Final UI Polish

// ====== Goal: Clean and shiny. =====

1. Styling

2. Responsive design for dashboard + lineup panel

3. Error handling + empty states + loaders

4. Wireframe alignment check (ensure your initial plan matches implementation)

---

## Phase 6 — Documentation / README / Notes

// ====== Goal: Make your project self-explanatory. =====

1. Update README.md with:
   - Final Tech stack
   - Screenshots
   - How To Use/Recreate (KEEP IT SIMPLE - direct to design notes)

2. Make sure docs/design-notes.md is updated:
   - Architecture diagrams
   - Mock data notes
   - TODO notes for next phases