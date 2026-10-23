<!--
=====================================================================
Author: Mauro Risonho de Paula Assumpção
Create: 2026-10-18
Update: 2026-10-23
Short Description: Testing methodology, synthetic org testbeds, and verification harness specification
License: MIT
=====================================================================
-->

# HARNESS.md — Autonomous engineering loop

## Harness objective
Turn the architecture into an executable, continuously tested product using OpenCode or Antigravity in VS Code. Agents should operate autonomously **within authorized scope**, with clear stop conditions.

## State machine
`DISCOVER → PLAN → IMPLEMENT → TEST → REVIEW → DOCUMENT → CHECKPOINT`.

### DISCOVER
Read required specs and existing source. Inspect git diff. Identify a single roadmap milestone.
### PLAN
Specify files, interfaces, tests, expected output and failure handling.
### IMPLEMENT
Deliver minimal functional code. Avoid placeholders in critical paths; label temporary mock data clearly.
### TEST
Run `cargo fmt --check`, `cargo clippy --workspace --all-targets -- -D warnings`, `cargo test --workspace`, frontend lint/typecheck/test/build, and desktop smoke checks when the project exists. Do not report unexecuted commands as passing.
### REVIEW
Check scope, privacy, resource usage, error handling, deterministic IDs, false positives and graph evidence.
### DOCUMENT
Update API/schema docs, changelog, decision records, tasks and an execution report.
### CHECKPOINT
Mark milestone complete only when its acceptance criteria pass. Otherwise record blocker and continue another unblocked task.

## Required gates
G0 Scope and repository authorization.
G1 Parsing and schema conformance.
G2 Graph provenance and identity correctness.
G3 Cross-repo correlation confidence and unresolved links.
G4 Attack-path claims verified against synthetic ground truth.
G5 UI performance and accessibility.
G6 Packaging/security review.

## Approval boundaries
Human approval required before: ingesting private repositories, installing remote integrations with write privileges, invoking external LLMs on project data, active network tests, executing PoCs, destructive operations, production deployment or sharing findings.

## Failure policy
Retry transient build issues once; do not silently alter scope. Save a reproducible failure note and switch to safe independent work.

## Report template
`REPORTS/YYYY-MM-DD-milestone.md`: summary, changed files, tests/outputs, observed limitations, evidence, next action.
