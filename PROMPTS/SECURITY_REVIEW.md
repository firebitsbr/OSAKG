<!--
=====================================================================
Author: Mauro Risonho de Paula Assumpção
Create: 2026-10-18
Update: 2026-10-23
Short Description: Defensive security review and safe boundaries verification checklist
License: MIT
=====================================================================
-->

# Security review prompt

Perform an authorized, non-destructive source and architecture review of the OSAKG workspace. Inspect untrusted repo ingestion, parser sandboxing, symlink/path traversal, tenant boundaries, credentials, logs, LLM prompt injection, API query budgets, UI source rendering and dependency risks. Use synthetic fixtures. For each finding provide severity, confidence, evidence location, realistic preconditions, remediation and a regression test. Do not attempt exploitation of external systems.
