# Skymock

**Instant Multi-Project API Mock Server & Request Inspector** — part of the **Sky-Suite** ecosystem (alongside Skyboard & Skytype).

Frontend and mobile teams are often blocked waiting for backend APIs—or struggle to simulate edge cases like slow networks, `401`/`422` validation errors, and `429`/`500` failures. **Skymock** lets you define JSON API contracts per project and instantly publishes a live Base URL (`/m/{project_slug}`) with request guards, dynamic templating, latency/chaos controls, and a real-time request inspector.

> For full product and technical specifications (database schema, mock engine pipeline, and milestones), see [docs/PRD-TRD.md](docs/PRD-TRD.md).

## Core Features

- **Multi-Project Workspace & Base URL Generator**: Isolated projects with unique public Base URLs (`/m/{project_slug}`), supporting **Public** and **Protected** (`x-skymock-key`) modes.
- **Multi-Method Endpoint Builder**: Supports `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, automatic `OPTIONS` CORS preflight, and dynamic path parameters (`/v1/users/:id/orders/:orderId`).
- **Request Guards & Conditional Rules**: Built-in header/Bearer auth checks (`401`), required body/query validation (`422`), and conditional response variants.
- **Dynamic Template & Echo Engine**: Inject dynamic variables into JSON responses (`{{$uuid}}`, `{{$isoTimestamp}}`, `{{$body.field}}`, `{{$header.name}}`, `{{$params.id}}`).
- **Network & Chaos Simulator**: Configure artificial latency (`delay_ms`) and override HTTP status codes (`200`, `201`, `400`, `401`, `429`, `500`) in real time.
- **Live Request Inspector**: Stream incoming request headers, payloads, query params, and response times in real time via Server-Sent Events (SSE).

## Tech Stack

- **Frontend (`apps/web`)**: React 19, Vite, TypeScript
- **Backend (`apps/api`)**: ASP.NET Core (`net8.0` currently configured locally)

## Project Structure

```text
SKYMOCK/
├── apps/
│   ├── api/                 # Backend API (control plane & dynamic mock engine)
│   │   ├── src/
│   │   │   ├── app.cs       # DI, CORS, middleware setup
│   │   │   ├── routes.cs    # Control plane (/api) & mock engine (/m/*) routes
│   │   │   ├── db/          # Database context & setup
│   │   │   ├── modules/     # Projects, endpoints, rules, mock engine, SSE inspector
│   │   │   └── utils/       # Shared helpers & template parser
│   │   └── program.cs
│   └── web/                 # React + Vite + TypeScript dashboard
│       └── src/
│           ├── components/  # Reusable UI components
│           ├── core/        # Core utilities & API/SSE clients
│           ├── hooks/       # Custom React hooks
│           ├── modules/     # Workspace, endpoint builder, rules, live inspector
│           ├── routes/      # App routing
│           ├── stores/      # Client state management
│           └── types/       # Shared TypeScript types
├── docs/
│   └── PRD-TRD.md           # Full Product & Technical Requirements Document
├── AGENTS.md                # Guidelines & invariants for AI coding agents
└── README.md
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (package manager & runtime)
- .NET SDK (currently `net8.0` in `apps/api/api.csproj`)

### Run Both (Backend + Frontend) from Root

```bash
bun install
bun run dev
```

- **Backend (`apps/api`)**: `http://localhost:5000` (health check: `GET /api/health`)
- **Frontend (`apps/web`)**: `http://localhost:5173` (`/api` proxied to `http://localhost:5000`)

Or run individually:

```bash
bun run dev:api   # Backend only
bun run dev:web   # Frontend only
bun run build     # Build both API and Web
```
