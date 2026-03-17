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

## Phase 1 — Mock Data & Core Types

// ====== Goal: Define the shape of data before connecting APIs. =====

1. Create mock JSON:
   - players.json
   - teams.json
   - matches.json

2. Define TypeScript interfaces:
   - Player, Team, Match, FantasyScore

3. Test importing mock data and rendering simple lists in a dashboard component.

4. Ensure Redux store is initialized to hold:
   - Selected teams & players
   - AI insights
   - Match updates (for WebSocket feed later)

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

---

## Phase 3 — REST API Integration (MVP)

// ====== Goal: Replace mock JSON with real REST API calls. =====

1. Create services/apiFootball.ts with fetch/axios calls.

2. Normalize API responses:
   - Map all fields to TypeScript interfaces
   - Handle missing/null values
   - Retain short codes (country, position, etc.) for both UI and internal logic
   - Add supplemental fields with full names (e.g., `countryFullName`, `positionFullName`) for tooltips, AI insights, or reports

3. Replace mock data in components with live API data.

4. Loading/error states for all components.

5. Historical caching:
   - Last 10 matches per player/team in memory
   - Make it accessible for AI insights and scoring calculations

---

## Phase 4 — AI Integration

// ====== Goal: Generate player and lineup insights dynamically. =====

1. Setup AI REST integration (Claude/OpenAI):
   - Define request payload (filtered subset of stats per player/team)
   - Caching strategy (per session)
   - Batch strategy (small batches per interaction)

2. Connect AI outputs to UI:
   - PlayerCard tooltips / insights
   - Insights panel (team / position / pre-selection strategy)

3. Pass scoring system + historical trends context to AI so recommendations are meaningful.

4. Ensure AI response caching prevents repeated calls for same player/team.

5. Test with mock AI responses first before connecting live API.

---

## Phase 5 — GraphQL (Learning Module)

// ====== Goal: Practice selective querying and API flexibility. =====

1. Create mock GraphQL server:
   - Serve a subset of player fields

2. Fetch player data via GraphQL in one React component

3. Compare performance / developer experience vs REST

---

## Phase 6 — WebSocket Live Match Feed

// ====== Goal: Add real-time updates to dashboard. =====

1. Set up dummy WebSocket server (ws):
   - Emits mock match events every few seconds

2. Frontend:
   - Create LiveFeed component
   - Subscribe to events and update dashboard dynamically

3. Optional:
   - Update scoreboard or lineup performance in real time

---

## Phase 7 — Auth / Database Integration

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

## Phase 8 — Optimizer Logic

// ====== Goal: Implement fantasy team optimization. =====

1. Define constraints:
   - Budget limit
   - Formation rules
   - Max players per team

2. Build algorithm:
   - Input: player stats + AI recommendations
   - Output: optimal lineup

3. Connect optimizer to:
   - Dashboard
   - Insights panel
   - Player selection UI

---

## Phase 9 — Final UI Polish

// ====== Goal: Clean and shiny. =====

1. Styling

2. Responsive design for dashboard + lineup panel

3. Error handling + empty states + loaders

4. Wireframe alignment check (ensure your initial plan matches implementation)

---

## Phase 10 — Documentation / README / Notes

// ====== Goal: Make your project self-explanatory. =====

1. Update README.md with:
   - Final Tech stack
   - Screenshots
   - How To Use/Recreate (KEEP IT SIMPLE - direct to design notes)

2. Make sure docs/design-notes.md is updated:
   - Architecture diagrams
   - Mock data notes
   - TODO notes for next phases