# SCOPE.md — Authorization and boundaries

## Default mode
Offline/local, read-only, synthetic-fixture mode. No real organization is authorized by this document.

## Scope record (fill before real ingestion)
- Organization/repository URLs:
- Owner/authorizer:
- Approval reference and expiration:
- Allowed branches/commit ranges:
- Allowed data classes:
- Allowed analysis types: passive only by default
- Approved storage and retention:
- Explicitly excluded targets:
- Allowed external services:
- Incident/escalation contact:

## Non-negotiables
No assumptions that public visibility equals permission for active testing. Clone/index only approved repositories; honor API limits and access controls. Do not scan production infrastructure based solely on repository endpoints. Never ingest or display raw secrets as ordinary graph properties. Mask findings and avoid storing credential values.

## Modes
`fixture`: synthetic only; `passive`: authorized source/metadata analysis; `validation`: separately approved isolated tests with bounded targets and budgets. Default to `fixture`.

## Stop conditions
Missing authorization, out-of-scope discovery, accidental secret exposure, unapproved data export, suspicious access, or failed privacy controls → stop relevant operation, preserve safe audit record, notify operator.
