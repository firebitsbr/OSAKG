<!--
=====================================================================
Author: Mauro Risonho de Paula Assumpção
Create: 2026-10-18
Update: 2026-10-23
Short Description: Architecture Decision Records (ADRs) capturing key engineering trade-offs
License: MIT
=====================================================================
-->

# DECISIONS.md — Architecture decision records

## ADR-001: Independent Rust core
Accepted: Rust for core, ingestion, fusion, path analysis and API; external analyzers are adapters.

## ADR-002: Tauri + Three.js
Accepted: cross-platform desktop shell and interactive 3D visualization. 2D alternative required.

## ADR-003: FalkorDB + SQLite
Provisional: FalkorDB for graph queries, SQLite for audit/evidence. Reevaluate based on scale, query semantics and operations.

## ADR-004: Evidence-first reasoning
Accepted: observed/inferred/validated/refuted states and mandatory provenance.

## ADR-005: Offline-first authorization
Accepted: fixture mode by default; explicit approval for real repos and active testing.

## ADR-006: Semantic zoom
Accepted: 3D organization globe is a deterministic graph projection, not geographic data.

## ADR-007: Tool compatibility
OpenCode/Antigravity instructions are stored in portable Markdown; avoid relying on undocumented agent-specific APIs.
