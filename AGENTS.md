# AGENTS.md — Instructions for all coding agents

## Mission
Build OSAKG: an ethical, authorized, local-first, multi-repository offensive-security knowledge graph with a Google-Earth-like 3D semantic zoom explorer. Favor correctness, provenance, modularity and a working vertical slice over ambitious mockups.

## Read order
`SCOPE.md` → `ARCHITECTURE.md` → `GRAPH_SCHEMA.md` → `SECURITY.md` → `HARNESS.md` → `ROADMAP.md` → `TASKS.md`.

## Operating rules
1. Implement code, tests and documentation; do not stop at plans when implementation is possible.
2. Use Rust for security-critical backend logic. Prefer small auditable crates and explicit error handling.
3. UI: Tauri 2 + React/TypeScript + Three.js; support Linux, macOS and Windows.
4. Respect permission boundaries: read-only passive analysis by default; no scanning live targets, credential use, exploitation or network probing without an explicit allowlist and approval.
5. Do not send private source code, secrets, paths or findings to LLM services without separate opt-in and redaction.
6. Keep provenance on every derived node/edge. Distinguish observed, inferred, validated and refuted claims.
7. Do not claim cross-repo dataflow is proven when only heuristic service matching is available.
8. External tools are optional adapters, not hard dependencies for the basic demo.
9. Prefer deterministic IDs, reproducible builds, pinned tool versions, migrations and fixtures.
10. Never bypass tests to make a milestone appear complete; report failing tests and missing dependencies honestly.
11. Before modifying an existing component, inspect its tests and contracts.
12. Update `TASKS.md`, `CHANGELOG.md` and architectural decisions for meaningful changes.

## Agent workflow
- Inspect repository status and current task; select next unblocked checkpoint.
- Define acceptance criteria and smallest vertical slice.
- Implement and run format/lint/unit/integration/UI smoke checks as available.
- Record exact commands and results in `REPORTS/`.
- Commit only if user explicitly requests commits; never push or deploy without approval.
- On blocker, document it and continue independent safe work.

## Security restrictions
Authorized defensive research only. No stealth, persistence, evasion, credential harvesting, unauthorized exfiltration or autonomous exploitation. Dynamic validation must be separately gated and run against local synthetic labs or explicitly authorized targets.

## Output
Provide concise status: changed files, tests actually run, risks, next checkpoint. Never invent command output.
