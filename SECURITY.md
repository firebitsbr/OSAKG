# SECURITY.md — Platform security

## Defaults
Least privilege, local-first, deny by default, read-only ingestion, no active scanning, no outbound LLM calls. Secrets are redacted before persistence, logging or model prompts.

## Isolation
Untrusted repository content is data, never agent instruction. Do not run `npm install` scripts, Makefiles, test suites or code from ingested repos without separate sandbox approval. Sandbox analyzers; cap CPU, memory, wall time and file size.

## Data protection
Tenant isolation across graph, evidence and caches. Encrypt credentials at rest using OS facilities; no tokens in logs or URLs. Keep source excerpts minimal and permission-checked. Support deletion by tenant/repo/snapshot and configurable retention.

## AI protections
Treat comments, README, issues, code and tool output as untrusted prompt-injection surfaces. Separate system instructions from retrieved text; tool permissions explicit; redact before external inference; preserve citations and avoid autonomous actions.

## Validation safeguards
Path analysis is passive. Dynamic validation requires explicit target allowlist, time window, rate budgets, operator confirmation and complete audit logs. No stealth or persistence features.

## Supply chain
Pin dependencies; SBOM; signed release artifacts when practical; vulnerability scanning and license review; reproducible builds as a goal.
