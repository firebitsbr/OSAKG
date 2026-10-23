# TESTING.md — Quality and security verification

## Test pyramid
Unit: parsers, stable IDs, confidence states, path constraints.
Integration: fixture → ingestion → storage → query.
E2E: desktop launch → select org → zoom repo → file → function → evidence.
Security: tenant isolation, path traversal, symlink escape, parser denial-of-service, prompt injection in repository text, secret redaction, query budgets.
Performance: indexing throughput, graph query p50/p95, memory and frame times.

## Synthetic ground truth
Include: legitimate API cross-repo link; ambiguous service-name collision; blocked authorization path; unsanitized synthetic taint flow; secret-shaped dummy token; benign control; AI agent tool boundary. Never use real credentials.

## CI
`cargo fmt --check`
`cargo clippy --workspace --all-targets -- -D warnings`
`cargo test --workspace`
`npm ci && npm run lint && npm run typecheck && npm test && npm run build` (after frontend scaffold)
`cargo audit` if installed

## Evidence
Store exact test commands, versions, platform, timestamps and exit codes. Fail closed when a security gate fails. Do not fabricate benchmark figures.
