#!/usr/bin/env python3
# =====================================================================
# Author: Mauro Risonho de Paula Assumpção
# Create: 2026-10-18
# Update: 2026-10-23
# Short Description: Script to prepend standardized author headers across project files
# License: MIT
# =====================================================================

import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

DESCRIPTIONS = {
    # Root configs & docs
    "Makefile": "Top-level orchestration Makefile for building, testing, linting, and running OSAKG",
    ".gitignore": "Git ignore patterns for Rust, Node, Tauri, and cache artifacts",
    "Cargo.toml": "Top-level Cargo workspace manifest defining all OSAKG backend crates",
    "AGENTS.md": "Operational guidelines, safety constraints, and mission directives for coding agents",
    "AI_REDTEAM.md": "Architecture and contracts for AI-assisted red teaming and autonomous exploit generation guardrails",
    "API_CONTRACT.md": "REST, WebSocket, and Tauri IPC contract specification for backend and frontend communication",
    "ARCHITECTURE.md": "Comprehensive system architecture, crate boundaries, dataflows, and security design",
    "CHANGELOG.md": "Release notes, versioning history, and milestone progress log",
    "DATA_SOURCES.md": "Catalog of supported passive code scanners, vulnerability feeds, and AST extractors",
    "DECISIONS.md": "Architecture Decision Records (ADRs) capturing key engineering trade-offs",
    "GRAPH_SCHEMA.md": "Formal knowledge graph schema for nodes, edges, scopes, and provenance evidence",
    "HARNESS.md": "Testing methodology, synthetic org testbeds, and verification harness specification",
    "README.md": "OSAKG project overview, architecture, quickstart guide, and feature walkthrough",
    "ROADMAP.md": "Milestone delivery timeline, vertical slice roadmap, and strategic objectives",
    "SCOPE.md": "Project boundaries, defensive security mission, and scope restrictions",
    "SECURITY.md": "Security posture, safe analysis bounds, vulnerability disclosure, and privacy guarantees",
    "TASKS.md": "Actionable task tracking list and milestone status for engineering agents",
    "TESTING.md": "Test execution plan, coverage matrix, and QA procedures",
    "UNIVERSE_3D.md": "3D semantic zoom visualization design and spatial layout specifications",
    "PROMPTS/BOOTSTRAP.md": "Bootstrap prompt template for initializing new agent sessions",
    "PROMPTS/CONTINUE.md": "Continuation prompt template for iterative agent development",
    "PROMPTS/QA_E2E.md": "End-to-end quality assurance and smoke testing verification prompt",
    "PROMPTS/SECURITY_REVIEW.md": "Defensive security review and safe boundaries verification checklist",
    "REPORTS/2026-10-18-m0-bootstrap.md": "Milestone M0 execution report, verification results, and initial benchmarks",
    "REPORTS/README.md": "Index and guidelines for engineering milestone execution reports",

    # Desktop / Tauri
    "apps/desktop/src-tauri/Cargo.toml": "Cargo manifest for the OSAKG Tauri 2 desktop application wrapper",
    "apps/desktop/src-tauri/build.rs": "Tauri application build script configuring native platform hooks",
    "apps/desktop/src-tauri/src/main.rs": "Native entrypoint initializing the Tauri 2 runtime and IPC bridge",

    # Crates
    "crates/osakg-adapters/Cargo.toml": "Cargo manifest for external scanner adapters (Semgrep, Gitleaks, Trivy)",
    "crates/osakg-adapters/src/lib.rs": "Scanner adapter abstractions and output normalization parsers",
    "crates/osakg-ai-redteam/Cargo.toml": "Cargo manifest for the AI red team simulation and validation engine",
    "crates/osakg-ai-redteam/src/lib.rs": "Safe red team simulation heuristics and threat hypothesis generator",
    "crates/osakg-api/Cargo.toml": "Cargo manifest for the Axum REST and WebSocket graph API server",
    "crates/osakg-api/src/lib.rs": "REST router definitions, WebSocket stream handlers, and state management",
    "crates/osakg-api/src/main.rs": "CLI executable launching the standalone OSAKG API backend service",
    "crates/osakg-attackpath/Cargo.toml": "Cargo manifest for the attack path analysis and kill chain engine",
    "crates/osakg-attackpath/src/lib.rs": "Dijkstra/A* shortest path algorithms and security risk propagation evaluator",
    "crates/osakg-codegraph/Cargo.toml": "Cargo manifest for tree-sitter AST and code intelligence extraction",
    "crates/osakg-codegraph/src/lib.rs": "Language-specific AST parsing, symbol extraction, and call graph builders",
    "crates/osakg-core/Cargo.toml": "Cargo manifest for core domain models, errors, and identity primitives",
    "crates/osakg-core/src/dto.rs": "Data transfer objects for frontend serialization and API wire protocols",
    "crates/osakg-core/src/edge.rs": "Graph edge definitions, relationship types, and directional attributes",
    "crates/osakg-core/src/error.rs": "Unified error types and result aliases for OSAKG crates",
    "crates/osakg-core/src/evidence.rs": "Provenance tracking, confidence levels, and evidence claim data structures",
    "crates/osakg-core/src/id.rs": "Deterministic identifier generation using SHA-256 for nodes and edges",
    "crates/osakg-core/src/lib.rs": "OSAKG core domain library root aggregating models and traits",
    "crates/osakg-core/src/node.rs": "Graph node definitions across organizational, code, and threat scopes",
    "crates/osakg-core/src/scope.rs": "Scope hierarchy definitions from Enterprise to AstEntity levels",
    "crates/osakg-evidence/Cargo.toml": "Cargo manifest for the cryptographic provenance and evidence vault",
    "crates/osakg-evidence/src/lib.rs": "Evidence recording, validation ledger, and confidence computation",
    "crates/osakg-fusion/Cargo.toml": "Cargo manifest for multi-source entity deduplication and graph fusion",
    "crates/osakg-fusion/src/lib.rs": "Disjoint-set entity resolution and heuristic cross-repository link fusion",
    "crates/osakg-graph/Cargo.toml": "Cargo manifest for in-memory and persistent graph query engine",
    "crates/osakg-graph/src/lib.rs": "Petgraph wrapper, spatial indexing, and semantic zoom query layer",
    "crates/osakg-ingest/Cargo.toml": "Cargo manifest for repository ingestion and manifest parsing pipeline",
    "crates/osakg-ingest/src/lib.rs": "File tree walkers, package manifest parsers, and batch ingestion workers",

    # Web application
    "apps/web/vite.config.ts": "Vite bundler configuration with React and Tailwind plugins",
    "apps/web/index.html": "Single Page Application HTML entrypoint and root canvas container",
    "apps/web/src/App.tsx": "Main application component managing HUD, layout, themes, and views",
    "apps/web/src/api.ts": "Client API wrapper supporting REST endpoints and mock fallback data",
    "apps/web/src/components/Breadcrumbs.tsx": "Hierarchical breadcrumb navigation component reflecting zoom altitude",
    "apps/web/src/components/ColorCustomizerModal.tsx": "Corporate color theme customizer modal with RGB and HSL palette adjustments",
    "apps/web/src/components/CommandPalette.tsx": "Keyboard-driven spotlight command palette (Ctrl+K) for quick navigation",
    "apps/web/src/components/EnterpriseHeader.tsx": "Corporate enterprise header with search, theme switch, and status metrics",
    "apps/web/src/components/Graph2D.tsx": "Force-directed 2D canvas visualization fallback for graph inspection",
    "apps/web/src/components/NodeDrawer.tsx": "Slide-over inspector drawer displaying node details, CVSS, and provenance",
    "apps/web/src/components/Toolbar.tsx": "Viewport navigation toolbar with zoom controls, centering, and perspective toggle",
    "apps/web/src/components/Universe3D.tsx": "Three.js 3D semantic zoom universe explorer with orbital camera and LOD",
    "apps/web/src/index.css": "Global enterprise Tailwind styling, glassmorphism utilities, and theme tokens",
    "apps/web/src/main.tsx": "React DOM root initialization and app mounting",
    "apps/web/src/theme.ts": "Theme state manager supporting dark/light modes and 5 enterprise color presets",
    "apps/web/src/types.ts": "TypeScript interfaces matching OSAKG Rust backend graph models and DTOs",

    # Scripts
    "scripts/check.sh": "Comprehensive verification script executing format, lint, test, and build suites",
    "scripts/generate_deep_universe.py": "Synthetic deep universe generator creating granular AST nodes and attack paths",
    "scripts/ingest_anthropic.py": "Public GitHub API ingestion crawler for Anthropic organization repositories",

    # Synthetic fixtures
    "fixtures/synthetic-org/repo-ai-agent/src/agent.ts": "Synthetic AI agent repository entrypoint for testing code parsing",
    "fixtures/synthetic-org/repo-auth/src/index.ts": "Synthetic authentication service entrypoint for testing code parsing",
    "fixtures/synthetic-org/repo-billing/src/index.ts": "Synthetic billing service entrypoint for testing code parsing",
}

def format_header(ext: str, rel_path: str, desc: str) -> str:
    lines = [
        "=====================================================================",
        "Author: Mauro Risonho de Paula Assumpção",
        "Create: 2026-10-18",
        "Update: 2026-10-23",
        f"Short Description: {desc}",
        "License: MIT",
        "=====================================================================",
    ]
    if ext in [".rs", ".ts", ".tsx"]:
        return "\n".join(f"// {line}" for line in lines) + "\n\n"
    elif ext in [".py", ".sh", ".toml", ".gitignore"] or rel_path in ["Makefile", ".gitignore"]:
        return "\n".join(f"# {line}" for line in lines) + "\n\n"
    elif ext in [".md", ".html"]:
        body = "\n".join(lines)
        return f"<!--\n{body}\n-->\n\n"
    elif ext == ".css":
        body = "\n".join(f"   {line}" for line in lines)
        return f"/* {lines[0]}\n{body}\n   {lines[-1]} */\n\n"
    else:
        return "\n".join(f"// {line}" for line in lines) + "\n\n"

def process_file(rel_path: str, desc: str):
    file_path = ROOT / rel_path
    if not file_path.exists():
        print(f"Warning: file not found: {rel_path}")
        return

    content = file_path.read_text(encoding="utf-8")
    if "Mauro Risonho de Paula Assumpção" in content:
        print(f"Skipping already tagged: {rel_path}")
        return

    ext = file_path.suffix.lower()
    header = format_header(ext, rel_path, desc)

    # Check for shebang
    if content.startswith("#!"):
        parts = content.split("\n", 1)
        shebang = parts[0] + "\n"
        rest = parts[1] if len(parts) > 1 else ""
        new_content = shebang + header + rest
    else:
        new_content = header + content

    file_path.write_text(new_content, encoding="utf-8")
    print(f"Tagged: {rel_path}")

def main():
    for rel_path, desc in sorted(DESCRIPTIONS.items()):
        process_file(rel_path, desc)
    print("\nHeader tagging complete.")

if __name__ == "__main__":
    main()
