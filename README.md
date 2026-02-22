# Bryto Community MapOps Dashboard

A React + TypeScript + Vite prototype for Bryto's self-serve customer portal that combines:

- `MapOps` (plat intake, georeference preview, map health detection, submission packaging)
- `StreetView Ops` (route planning, coverage visibility, publishing status tracking)

This project was built in a separate folder from `OrbitAtlas` and intentionally mirrors its design language and engineering patterns while adapting them to Bryto's operational workflow.

## OrbitAtlas Analysis (Design + Engineering Language)

### Visual language observed in `OrbitAtlas`

From `OrbitAtlas/apps/explorer` and `OrbitAtlas/apps/backoffice`:

- Typography pair: `DM Sans` (body/UI) + `Outfit` (display headings)
- Color system: neutral `slate` scale with `sky` accent for active/primary actions
- Surfaces: white cards/panels with soft borders (`slate-200`) and small shadows
- Layout style: strong shell framing (header/sidebar/content), clear panel separation
- Negative space: generous spacing, readable component grouping, low visual noise
- Motion: subtle only, with explicit `prefers-reduced-motion` support
- Accessibility defaults: skip link, semantic sections, keyboardable controls, focus rings

### Engineering patterns observed in `OrbitAtlas`

- Clear module boundaries (`components`, `hooks`, `store`, `utils`, `viewer`)
- Abort-safe data hooks with explicit `idle/loading/success/error` states
- Deterministic formatting helpers with unit tests
- Domain/state logic outside JSX where possible
- Reusable UI primitives (`Card`, `Button`) with stable APIs

## How This Project Reuses That Language (Without Copying the Product)

This app keeps OrbitAtlas's clean slate/sky DNA and panel-driven composition, but shifts the expression toward a more "operations console" feel:

- Glass-tinted panels + subtle background mesh/orbs for higher visual identity
- Same typography family pairing (`DM Sans` + `Outfit`) for continuity
- Similar card/button semantics, status badges, and sidebar app shell
- Stronger workflow visualization for ops states (timelines, diff views, readiness checks)

## Feature Modules

### 1) Intake -> Plat-to-Geo Preview

- Intake form for nearest address + seed coordinates
- Attachment staging UI (plat/evidence)
- Georeference control-point editor (3-6 point workflow)
- Preview canvas + readiness checklist
- Turf-based geometry validation integrated into preview

### 2) Map Health Detector

- Before/after road/address gap metrics
- Confidence score breakdown
- Bryto target vs platform variability timeline
- Geometry error summary for submission readiness

### 3) Submission Packager + Audit Trail

- Versioned submission list (`v1/v2/...`)
- Bundle manifest generator (GeoJSON/CSV/evidence/notes summary)
- Status workflow with transition guards
- Version diff viewer (roads/lots/checklist changes)
- Review checklist + notes
- Audit trail timeline

### 4) Street View Ops Planner + Publishing Tracker

- Capture route segment planner
- Coverage heatmap / gap list
- Upload readiness checks
- Publishing batch tracker (`uploaded -> processing -> live`)

## Architecture Summary

- `src/domain/*`: typed business entities + mock data contracts
- `src/api/*`: mock REST client
- `src/hooks/*`: abort-safe async hooks with stale-response guards
- `src/store/*`: Zustand app state (community scope, submission compare, intake overrides)
- `src/features/*`: domain logic per feature (validation, submissions, intake)
- `src/components/*`: UI primitives + dashboard/shared feature components
- `src/pages/*`: route-level composition only

## Correctness / Resilience Notes

- Explicit loading, empty, error, and retry states across modules
- Defensive intake validation (including `NaN` coordinate handling)
- Abort-safe request hooks and stale response guards
- App-level `ErrorBoundary`
- Route focus management + skip link
- Deterministic format utilities and targeted unit tests

## Verification (Final Pass)

Verified locally after a clean dependency reinstall:

- `npm test` -> `5` test files passed (`13` tests)
- `npm run build` -> success (Vite production build)

## 18-Commit Milestone Map

1. Scaffold separate Vite project
2. React shell + route layout
3. Bryto visual design system (OrbitAtlas-inspired)
4. Typed domain models + mock data
5. Abort-safe mock API hooks
6. Zustand app state slices
7. Community overview dashboard
8. Intake form + attachment staging
9. Georeference control-point editor
10. Turf geometry validation engine
11. Map Health detector views
12. Submission packager workflow
13. Submission diffs + audit detail
14. Street View coverage planner groundwork
15. Street View publishing tracker + restored planner page
16. Accessibility + resilience defaults
17. Risk-focused tests (workflow/intake edge cases)
18. Docs + verification pass
