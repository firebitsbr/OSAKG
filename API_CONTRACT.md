<!--
=====================================================================
Author: Mauro Risonho de Paula Assumpção
Create: 2026-10-18
Update: 2026-10-23
Short Description: REST, WebSocket, and Tauri IPC contract specification for backend and frontend communication
License: MIT
=====================================================================
-->

# API_CONTRACT.md — Initial HTTP interface

All endpoints are versioned under `/api/v1`; local bind default `127.0.0.1`; auth/tenant authorization required before remote deployment.

- `GET /health` → status and schema version.
- `POST /scopes` → create approved scope record (no implicit authorization).
- `POST /ingestions` → submit fixture or approved repo snapshot; return job ID.
- `GET /ingestions/{id}` → state, progress, errors.
- `GET /organizations` → authorized organizations.
- `GET /graph/neighborhood?node_id=&depth=&limit=` → bounded nodes/edges with evidence state.
- `GET /graph/paths?source=&target=&max_hops=` → candidate paths and constraints.
- `GET /evidence/{id}` → provenance with access controls.
- `GET /universe/tiles?org_id=&level=&viewport=` → clustered spatial subgraph.

## Pagination and safety
Cursor pagination, request size limits, query budgets, tenant filtering, stable IDs, error codes and cancellation. Graph queries must have bounded depth and result size.

## Schema
Use JSON Schema/OpenAPI generated or validated from typed Rust DTOs. Never leak secrets, credentials or internal filesystem paths in API errors.
