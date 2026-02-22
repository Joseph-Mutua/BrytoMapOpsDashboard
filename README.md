# Community MapOps Dashboard

Live deployment: https://bryto-map-ops-dashboard.vercel.app/

A React + TypeScript + Vite prototype for Bryto's self-serve operational portal. It combines map intake, georeference preview, map health checks, submission packaging, and Street View publishing workflow tracking in one dashboard experience.

## Purpose

This project is a front-end prototype that demonstrates:

- A multi-page operational dashboard for map data workflows
- A realistic UX for internal/partner self-serve tooling
- Typed domain models and feature-layer business logic
- Mocked API behavior with loading/error states
- Testable validation and submission workflow logic

It is intended to showcase product direction and implementation quality, not a production backend integration.

## Live App

- Deployed URL: https://bryto-map-ops-dashboard.vercel.app/

## Core Features

### 1. Overview Dashboard

- Summary metrics and operational status indicators
- Timeline/status components for quick health checks
- Community scope selection support (shared across routes)

### 2. Intake + Georeference

- Intake form for nearest address and seed coordinates
- Attachment staging UX for plats/evidence
- Georeference control-point editing workflow
- Plat preview canvas with readiness cues
- Input validation and error messaging

### 3. Map Health

- Geometry validation checks (including Turf-based validity checks)
- Confidence/quality scoring views
- Gap/coverage-oriented diagnostics
- Readiness support before packaging/submission

### 4. Submissions

- Versioned submission list and comparison workflow
- Status transition logic with guardrails
- Package manifest/bundle generation helpers
- Version diff summaries for review
- Audit trail and review checklist patterns

### 5. StreetView Ops

- Capture route/segment planning views
- Coverage heatmap and gap planning UI
- Publishing batch tracking (`uploaded -> processing -> live`)
- Operational readiness and follow-up tracking patterns

## Routes

The application uses `react-router-dom` with a shared `AppLayout`.

- `/` - Overview
- `/intake` - Intake + Geo tools
- `/map-health` - Map health diagnostics
- `/submissions` - Submission packaging, diff, workflow states
- `/streetview-ops` - Street View operations planner/tracker

Unknown routes redirect back to `/`.

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- Zustand (local app state)
- Turf (`@turf/*`) for geometry validation helpers
- Vitest + Testing Library for unit/component tests

## Project Structure

```text
src/
  api/           Mock API client (latency/error simulation)
  components/    UI primitives + shared feature components
  domain/        Typed entities and mock data contracts
  features/      Feature-specific business logic and tests
  hooks/         Async hooks and data loading abstractions
  layouts/       App shell/layout composition
  pages/         Route-level pages
  store/         Zustand state and selectors
  utils/         Formatting utilities and tests
```

## Architecture Notes

### Frontend-only prototype

- Data is served from mock domain fixtures (`src/domain/mockData.ts`)
- API behavior is simulated via `src/api/client.ts`
- Latency and error flows are intentionally represented to exercise UI states

### Separation of concerns

- `pages/*` compose screens and route-level layout only
- `features/*` contains business logic (validation, packaging, workflow transitions, diffs)
- `components/*` contains reusable UI and domain presentation widgets
- `store/*` coordinates cross-screen UI state (selection/compare context)

### Resilience / UX behavior

- Error boundary at app level
- Route focus management + skip link for accessibility
- Abort-safe request patterns and stale-response protection in hooks
- Explicit loading, empty, and error states

## Local Development

Run commands from:

```powershell
d:\WORK\Bryto\BrytoMapOpsDashboard
```

### Prerequisites

- Node.js 20+ recommended
- npm (or pnpm)

### Install dependencies

Using npm:

```powershell
npm install
```

Using pnpm:

```powershell
pnpm install
```

### Start the development server

```powershell
npm run dev
```

Vite will print a local URL (commonly `http://localhost:5173`).

### Build for production

```powershell
npm run build
```

### Preview the production build locally

```powershell
npm run preview
```

## Testing

Run the test suite:

```powershell
npm test
```

Watch mode:

```powershell
npm run test:watch
```

Test coverage in this prototype is focused on logic-heavy areas, including:

- Intake validation
- Geometry validation
- Submission workflow transitions
- Submission diff behavior
- Formatting helpers

## Design / UI Notes

- Responsive dashboard layout for desktop and mobile viewports
- Accessible navigation patterns (skip link + route focus management)
- Consistent UI primitives (`Card`, `Button`) shared across modules
- Theming centralized in `src/index.css` for fast palette/typography iteration

## Deployment Notes

- Deployed on Vercel: https://bryto-map-ops-dashboard.vercel.app/
- Uses client-side routing (`BrowserRouter`)
- For non-Vercel static hosting, ensure SPA fallback rewrites route requests to `index.html`

## Known Limitations (Prototype Scope)

- No real backend persistence or authentication
- No real file uploads (staged UX only)
- Mock operational data rather than live production integrations
- No server-side validation or workflow orchestration

## Suggested Next Steps

- Replace mock API client with real service integration
- Add auth/roles for internal vs partner views
- Persist intake/submission state to backend
- Add integration tests for end-to-end route flows
- Add analytics/telemetry for operational bottleneck tracking

## Scripts Reference

- `npm run dev` - Start Vite dev server
- `npm run build` - Type-check and build production assets
- `npm run preview` - Preview built assets locally
- `npm test` - Run Vitest suite once
- `npm run test:watch` - Run Vitest in watch mode
