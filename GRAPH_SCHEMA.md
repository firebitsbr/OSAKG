# GRAPH_SCHEMA.md — Canonical evidence graph v0.1

## Identity
Node ID = stable hash(`tenant_id`, `kind`, `canonical_source`, `qualified_name`, `commit_or_snapshot`). Distinguish logical identity from version-specific identity. Every record is tenant-scoped.

## Nodes
`Organization`, `Repository`, `Snapshot`, `Directory`, `File`, `Symbol`, `Function`, `Class`, `Package`, `Dependency`, `Endpoint`, `Service`, `Identity`, `Permission`, `DataAsset`, `DataStore`, `TrustBoundary`, `AIModel`, `AIAgent`, `Tool`, `Retriever`, `Finding`, `Evidence`, `Control`.

## Edges
`CONTAINS`, `DECLARES`, `IMPORTS`, `CALLS`, `DEPENDS_ON`, `EXPOSES`, `ROUTES_TO`, `PUBLISHES`, `CONSUMES`, `READS`, `WRITES`, `GRANTS`, `CROSSES_BOUNDARY`, `TAINT_FLOWS_TO`, `PROTECTS`, `MAY_REACH`, `SUPPORTED_BY`, `REFUTES`.

## Mandatory evidence fields
`tenant_id`, `source_repo`, `commit_sha`, `file_path` (where applicable), `start_line`, `end_line`, `analyzer`, `analyzer_version`, `detected_at`, `claim_state`, `confidence`, `evidence_ids`.

## Claim states
`observed`: directly parsed/recorded; `inferred`: heuristic; `validated`: supported by authorized test; `refuted`: disproved by evidence. Never silently promote inferred to validated.

## Cross-repo linking
Match through explicit package coordinates, pinned dependencies, OpenAPI specs, event schema identifiers, service discovery manifests and IaC references. Name similarity alone yields a low-confidence candidate, never a confirmed call edge.

## Example synthetic path
`public endpoint → handler → internal service → data store`. A route is only a *candidate risk* until authentication, authorization, reachability and relevant controls are evaluated.

## Schema evolution
Version node/edge contracts; additive migrations first; validate referential integrity and tenant isolation.
