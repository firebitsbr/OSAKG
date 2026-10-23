# DATA_SOURCES.md — Connectors and analyzers

## Inputs
GitHub REST/GraphQL metadata and Git clones (authorized); GitLab and local Git later. Prefer pinned commit SHA snapshots and incremental updates. Record API rate-limit behavior.

## Initial parsers
Rust and TypeScript with tree-sitter. Normalize symbols, imports, calls, endpoints and package manifests into canonical DTOs. Document language-specific blind spots.

## Optional adapters
Joern (CPG/dataflow), Opengrep (SAST/taint), OSV-Scanner (dependency advisories). Each adapter reports version, command, inputs, timeouts, outputs and uncertainty. Validate licenses and compatibility before bundling.

## Avoid
Executing repository build steps as part of passive indexing. Treating regex-only endpoint detection as complete coverage. Treating package dependency as proof of runtime call.

## Privacy
Do not send source to remote AI tools by default. Preserve GitHub access boundaries and retention policies.
