# Community MapOps Dashboard

A React + TypeScript + Vite prototype for Bryto's self-serve customer portal that combines:

- `MapOps` (plat intake, georeference preview, map health detection, submission packaging)
- `StreetView Ops` (route planning, coverage visibility, publishing status tracking)


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
