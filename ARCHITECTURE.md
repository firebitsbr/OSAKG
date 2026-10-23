# ARCHITECTURE.md — System design

## Logical pipeline
GitHub/GitLab/local Git → scope validator → ingestion → language parsers and tool adapters → canonical graph fusion → FalkorDB + SQLite evidence → query/path engine → Axum API → Tauri desktop / Three.js 3D viewer.

## Workspace proposal
- `crates/osakg-core`: IDs, entities, permissions, provenance, config.
- `crates/osakg-ingest`: repository discovery, commit snapshots, file inventory.
- `crates/osakg-codegraph`: tree-sitter AST/symbols/imports and normalized outputs.
- `crates/osakg-adapters`: optional Joern, Opengrep, OSV-Scanner adapters.
- `crates/osakg-fusion`: cross-repo matching, confidence and conflicts.
- `crates/osakg-graph`: graph repository interfaces, FalkorDB implementation.
- `crates/osakg-evidence`: SQLite evidence and audit metadata.
- `crates/osakg-attackpath`: constrained graph queries and path scoring.
- `crates/osakg-ai-redteam`: AI component modeling and safe test metadata.
- `crates/osakg-api`: Axum HTTP endpoints.
- `apps/desktop`: Tauri 2 shell.
- `apps/web`: React + TypeScript + Three.js visual client.
- `fixtures/`: small licensed/synthetic multi-repo lab.
- `infra/`: compose and migrations.

## Architectural rules
Hexagonal architecture; APIs behind traits; explicit versioned DTOs. No direct UI access to database credentials. Read-only analysis default. Local-first storage. Bounded concurrency, cancellation, incremental indexing by commit SHA. Background parsing isolated from UI thread.

## Performance
Viewport queries return clustered subgraphs, not full graph dumps. Implement level-of-detail, batching/instancing, frustum culling, cache invalidation, server-side path filtering and memory budgets.

## Threat model
Untrusted repositories may contain malicious code, huge files, symlinks, crafted parsers, prompt injections and secrets. Never execute imported project code as part of indexing. Sandbox third-party analyzers, enforce time/memory limits, normalize paths and prevent traversal.
