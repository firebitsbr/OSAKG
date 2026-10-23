<!--
=====================================================================
Author: Mauro Risonho de Paula Assumpção
Create: 2026-10-18
Update: 2026-10-23
Short Description: End-to-end quality assurance and smoke testing verification prompt
License: MIT
=====================================================================
-->

# End-to-end QA prompt

Audit the current OSAKG implementation against `TESTING.md`, `SECURITY.md`, `API_CONTRACT.md`, `GRAPH_SCHEMA.md` and `UNIVERSE_3D.md`. Build/run available tests and add missing deterministic fixture coverage. Verify semantic zoom, graph provenance, cross-repo false-positive handling, path-state distinctions, authorization gates, secret redaction, tenant isolation and failure behavior. Test UI keyboard navigation and 2D fallback. Report executed commands, environment, pass/fail/skip counts, defects with reproduction steps and prioritized fixes. Do not run active tests against real targets.
