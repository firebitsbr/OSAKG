<!--
=====================================================================
Author: Mauro Risonho de Paula Assumpção
Create: 2026-10-18
Update: 2026-10-23
Short Description: Release notes, versioning history, and milestone progress log
License: MIT
=====================================================================
-->

# Changelog

## 0.3.0 — Enterprise UI, Continuous Google-Earth Zoom & Massive Deep AST
- **Universal Organization Ingestion Pipeline**: Added capability to ingest all public repositories of any GitHub organization or user account on-the-fly (`scripts/ingest_org.py`, `crates/osakg-ingest`, `crates/osakg-api`, and UI `IngestOrgModal`). Synthesizes deterministic SHA-256 IDs, Fibonacci celestial coordinates, packages, trust boundaries, security findings, and heuristic cross-repo dependencies.
- **Project Identity**: Replaced all remaining legacy references to "Grafos" with "OSAKG" in repository documentation, links, git origin remote, and UI telemetry.
- **Massive Graph Scale**: Expanded universe to 1,603 nodes and 1,700 edges across 100 Anthropic public repositories, with 1,471 deep AST entities (Directories, Files, Classes, Functions with signatures, Packages/Dependencies, Endpoints, DataStores, TrustBoundaries).
- **Continuous Google-Earth 3D Zoom**: Implemented mouse wheel continuous LOD transitions (L0 Orbit -> L1 Continents -> L2 Cities -> L3 AST Street level) with real-time altitude telemetry HUD (`ALTITUDE: XX km`, `LOD`, `NODES IN VIEW`).
- **Tactical Attack Paths & Kill Chains**: Implemented 3 multi-stage attack chains across repositories with 6 validated vulnerabilities (CWE-918 MCP SSRF, CWE-77 Prompt Injection, CWE-250 Sandbox Escape), pulsing neon attack path overlay, and tactical node dimming.
- **Enterprise Corporate UI**: Replaced legacy toolbar with `EnterpriseHeader` featuring live tenant badge, security KPI telemetry pills, floating glassmorphism filter ribbon, and global Command Palette (`Ctrl+K` / `⌘K`) for rapid fuzzy navigation and camera swoop flight.
- **Tabbed Enterprise Inspector**: Redesigned `NodeDrawer` with 4 specialized tabs (Overview, Security & CVSS 3.1 Gauge, AST Code Evidence Trace with syntax highlighting, and Graph Relationships with jump-to flight).
- **Theme & Color Customization Engine**: Added Light/Dark mode toggle (hotkey `T`), 5 executive palettes (`Enterprise SOC`, `Nordic Slate`, `Cyberpunk Neon`, `Matrix Terminal`, `Synthwave Sunset`), per-kind color pickers, and local storage persistence.
- **Global Typography & Styling**: Added Inter and JetBrains Mono typography with subpixel antialiasing and custom sleek scrollbars.

## 0.2.0 — Milestone 0: Modular Workspace & 3D Interactive Explorer
- Created modular Rust workspace with 10 crates conforming to hexagonal architecture: `osakg-core`, `osakg-evidence`, `osakg-graph`, `osakg-ingest`, `osakg-codegraph`, `osakg-fusion`, `osakg-attackpath`, `osakg-ai-redteam`, `osakg-adapters`, `osakg-api`.
- Deeply granularized node taxonomy: implemented extraction for `Directory`, `File`, `Function`, `Class`, `Symbol`, `Package`, `Dependency`, `Endpoint`, `Service`, `DataStore`, `TrustBoundary`, `Control`, `Finding`, `AIAgent`, `Tool`, `AIModel`.
- Enhanced `osakg-codegraph` with AST pattern extraction for functions, classes, data sinks, calls, and authentication controls.
- Implemented multi-geometry 3D rendering (cubes for DataStores, octahedrons for Endpoints, icosahedrons for Controls, toruses for TrustBoundaries, cylinders for Directories).
- Added multi-level semantic zoom (L0-L3) and category filter chips in the web client and desktop shell.
- Implemented typed canonical Graph DTOs, deterministic SHA-256 Node IDs, and four-state claim model (`observed`, `inferred`, `validated`, `refuted`).
- Implemented SQLite evidence store with migrations, audit logging, and tenant isolation tests.
- Created three synthetic ground-truth repository fixtures: `repo-auth`, `repo-billing`, and `repo-ai-agent`.
- Implemented fixture ingestion engine discovering files, endpoints, OpenAPI routes, and AI Agent boundary crossings.
- Built interactive Three.js 3D Organization Sphere with Fibonacci spherical distribution, OrbitControls, curved quadratic arcs, and click-to-focus camera interpolation.
- Added 2D SVG graph fallback view, breadcrumbs navigation, and slide-out NodeDrawer panel for provenance evidence inspectability.
- Scaffolding and build verification for Tauri 2 desktop shell and Axum HTTP API.
- Added `./scripts/check.sh` covering `cargo fmt`, `clippy -D warnings`, `cargo test`, and `vite build`.

## 0.1.0 — Specification bundle
- Established OSAKG identity, architecture, agent harness, graph schema, 3D universe design, security model, API contracts, roadmap and tests.
