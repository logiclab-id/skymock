# AGENTS.md

Instructions and architectural invariants for AI coding agents working on **Skymock**.

> **Source of Truth**: Always read [docs/PRD-TRD.md](docs/PRD-TRD.md) for the complete Product & Technical Requirements Document (database schema, request execution pipeline, feature scope, and milestones) before implementing new features.

## Product Overview

**Skymock** is an **Instant Multi-Project API Mock Server & Request Inspector** (part of the **Sky-Suite** ecosystem alongside Skyboard & Skytype).

- **Problem**: Frontend and mobile developers are frequently blocked waiting for backend teams to finish API endpoints, or struggle to reliably simulate slow network latency and error scenarios (such as `401`, `422`, `429 Too Many Requests`, or `500 Internal Server Error`).
- **Solution**: Define JSON contracts per project and instantly get a live public Base URL (`/m/{project_slug}`) with multi-method dynamic routes, request guards/conditional rules, dynamic response templating, artificial latency & status override, and a real-time Live Request Inspector.

## Core Features & Milestones (Summary)

See [docs/PRD-TRD.md](docs/PRD-TRD.md) for full details:
- **Milestone 1 (Core MVP)**: Database setup (`projects`, `endpoints`, `endpoint_rules`), project creation & unique `project_slug` Base URL, Public/Protected (`x-skymock-key`) access, CRUD endpoints (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`), dynamic path matching (`/v1/users/:id/orders/:orderId`), and wildcard CORS.
- **Milestone 2 (Rules & Dynamic Engine)**: Header/Bearer auth checks (`401`), required body/query validation (`422`), conditional response variants, dynamic template rendering (`{{$uuid}}`, `{{$isoTimestamp}}`, `{{$body.*}}`, `{{$header.*}}`, `{{$params.*}}`), and latency (`delay_ms`) + status code overrides.
- **Milestone 3 (Inspector & Ecosystem)**: Live Request Inspector via Server-Sent Events (SSE) and payload export integration to Skytype.

## Architectural Invariants

1. **Mock Engine Request Pipeline (`ALL /m/:projectSlug/*`)**:
   Follow the exact 7-step execution order defined in [docs/PRD-TRD.md](docs/PRD-TRD.md):
   1. CORS preflight check (`OPTIONS` → `204` + wildcard CORS headers)
   2. Project lookup & guard check (`project_slug` + `x-skymock-key` if `is_protected`)
   3. Route pattern matching (HTTP method + dynamic path params)
   4. Rules & auth evaluation (ordered by `priority`: header/body/query guards & conditional overrides)
   5. Template rendering (`{{$uuid}}`, `{{$isoTimestamp}}`, `{{$body.*}}`, `{{$header.*}}`, `{{$params.*}}`)
   6. Artificial delay execution (`delay_ms`)
   7. Send response & publish log event to Live Inspector stream (SSE)
2. **CORS-Friendly Public Mock Delivery**:
   - Mock endpoints (`/m/:projectSlug/*`) **MUST** return `Access-Control-Allow-Origin: *`, `Access-Control-Allow-Methods: *`, and `Access-Control-Allow-Headers: *` so browsers (`localhost`), emulators, and physical mobile devices can call them without CORS issues.
3. **Safety & Payload Limits**:
   - Enforce payload caps (e.g., max 512 KB JSON response per endpoint, max 1 MB incoming request body) and rate limiting per `project_slug`/client IP to protect server stability.
4. **Keep It Simple**:
   - Avoid unnecessary complexity or over-engineering. Keep both the Control Plane (dashboard) and Data Plane (mock engine) fast, predictable, and developer-friendly.

## Repository Structure & Conventions

### Frontend (`apps/web` — Control Plane)
- **Stack**: React 19 + Vite + TypeScript (`strict: true`).
- **Path alias**: `@/*` maps to `src/*` (configured in `tsconfig.json` and `vite.config.ts`).
- **API calls**: Use relative `/api/...` paths; Vite proxies `/api` to `http://localhost:5000` in development.
- **Directory roles**:
  - `src/core/` — JSON/template helpers, API client, SSE client
  - `src/modules/` — feature-specific views and logic (project workspace, endpoint builder, rules editor, live request inspector)
  - `src/components/` — shared UI components
  - `src/hooks/` — reusable React hooks
  - `src/stores/` — client state
  - `src/routes/` — route definitions
  - `src/types/` — TypeScript interfaces/types

### Backend (`apps/api` — Management API & Mock Engine)
- **Stack**: ASP.NET Core Web API (`apps/api/api.csproj`) *(Note: current workspace template uses ASP.NET Core; align with [docs/PRD-TRD.md](docs/PRD-TRD.md) functional contracts unless migrating the Data Plane).*
- **Entry & Wiring**:
  - `program.cs` calls `ConfigureServices()`, `ConfigureMiddleware()`, and `MapApiRoutes()`.
  - `src/app.cs` configures DI, CORS (`FrontendCors` for `http://localhost:5173`, plus wildcard CORS for `/m/*` mock endpoints), and middleware.
  - `src/routes.cs` maps `/api` control-plane routes and `/m/{projectSlug}/{**path}` mock-engine routes.
  - `src/db/` contains `AppDbContext` (`context.cs`) and DB registration (`index.cs`).
  - `src/modules/`, `src/utils/` hold project/endpoint management, dynamic mock execution pipeline, template engine, and SSE inspector streaming.

## Build & Verification

Run from the repository root (note: on Windows PowerShell with script execution restricted, use `bun.cmd` instead of `bun`):

- **Full build (API + Web)**:
  ```powershell
  bun.cmd run build
  ```
- **Individual builds**:
  ```powershell
  bun.cmd run build:api   # dotnet build apps/api/api.csproj
  bun.cmd run build:web   # tsc --noEmit && vite build in apps/web
  ```
