<!--
=====================================================================
Author: Mauro Risonho de Paula Assumpção
Create: 2026-10-18
Update: 2026-10-23
Short Description: Milestone delivery timeline, vertical slice roadmap, and strategic objectives
License: MIT
=====================================================================
-->

# ROADMAP.md — Incremental delivery

## M0: Repository skeleton
Rust workspace, Tauri+React app, CI scripts, docs, lint/tests, synthetic fixtures. Acceptance: clean local build and smoke test.

## M1: Multi-repo fixture ingestion
Import three synthetic repos and their commits, files and manifests. Acceptance: deterministic graph snapshot with tests.

## M2: Canonical graph and evidence
FalkorDB/SQLite adapters, migrations, typed graph API. Acceptance: provenance and tenant isolation tests.

## M3: Cross-repo relations
Resolve package, API and event schema edges with confidence. Acceptance: positive/negative ground-truth fixtures.

## M4: Universe 3D
Globe, repository clusters, orbit/zoom, semantic zoom L0–L3, source detail panel. Acceptance: end-to-end click path and 2D fallback.

## M5: Security enrichment
Passive Opengrep/OSV/Joern adapters; trust boundaries, data assets, controls. Acceptance: parser isolation and reproducible findings.

## M6: Attack-path reasoning
Bounded candidate path engine with preconditions and mitigating controls. Acceptance: distinguish reachable from exploitable using synthetic cases.

## M7: AI Red Team graph
Model agents, tools, RAG/MCP, trust boundaries; synthetic safe validation cases. Acceptance: evidence-backed AI paths.

## M8: Hardening and packaging
Linux/macOS/Windows packages, telemetry off by default, security review, benchmark and docs. Acceptance: release checklist passed.

Do not advance a milestone based only on a screenshot.
