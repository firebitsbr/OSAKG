// =====================================================================
// Author: Mauro Risonho de Paula Assumpção
// Create: 2026-10-18
// Update: 2026-10-23
// Short Description: REST router definitions, WebSocket stream handlers, and state management
// License: MIT
// =====================================================================

use axum::{
    extract::{Path as AxumPath, Query, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use osakg_core::{HealthResponse, NodeId, ScopeRecord};
use osakg_evidence::EvidenceStore;
use osakg_graph::{GraphStore, InMemoryGraphStore};
use osakg_ingest::IngestionEngine;
use serde::Deserialize;
use std::path::PathBuf;
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};

#[derive(Clone)]
pub struct AppState {
    pub graph: InMemoryGraphStore,
    pub evidence: EvidenceStore,
    pub tenant_id: String,
}

#[derive(Deserialize)]
pub struct NeighborhoodQuery {
    pub node_id: String,
    pub depth: Option<u32>,
    pub limit: Option<usize>,
}

#[derive(Deserialize)]
pub struct UniverseQuery {
    pub org_id: Option<String>,
    pub level: Option<u32>,
    pub viewport: Option<String>,
}

#[derive(Deserialize)]
pub struct IngestionRequest {
    pub path: Option<String>,
    pub org_name: Option<String>,
    pub approved_repos: Option<Vec<String>>,
}

pub fn create_router(state: AppState) -> Router {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    Router::new()
        .route("/health", get(health_handler))
        .route("/api/v1/health", get(health_handler))
        .route("/api/v1/scopes", post(create_scope_handler))
        .route("/api/v1/ingestions", post(ingest_handler))
        .route("/api/v1/organizations", get(list_organizations_handler))
        .route("/api/v1/graph/neighborhood", get(neighborhood_handler))
        .route("/api/v1/evidence/:id", get(evidence_handler))
        .route("/api/v1/universe/tiles", get(universe_tiles_handler))
        .layer(cors)
        .with_state(Arc::new(state))
}

async fn health_handler() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "healthy".to_string(),
        schema_version: "0.1.0".to_string(),
        service: "osakg-api".to_string(),
        offline_fixture_mode: true,
    })
}

async fn create_scope_handler(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<serde_json::Value>,
) -> impl IntoResponse {
    let org_name = payload
        .get("org_name")
        .and_then(|v| v.as_str())
        .unwrap_or("Synthetic Organization");
    let scope = ScopeRecord::new_fixture(&state.tenant_id, org_name);
    (StatusCode::CREATED, Json(scope))
}

async fn ingest_handler(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<IngestionRequest>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let org_name = payload
        .org_name
        .unwrap_or_else(|| "Synthetic Security Org".to_string());

    let (scope, target_path) = if let Some(p) = payload.path {
        let approved = payload
            .approved_repos
            .unwrap_or_else(|| vec!["*".to_string()]);
        let s =
            ScopeRecord::new_passive(&state.tenant_id, org_name, "authorized-operator", approved);
        (s, PathBuf::from(p))
    } else {
        let mut p = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
        p.pop(); // crates/
        p.pop(); // root
        p.push("fixtures");
        p.push("synthetic-org");
        let s = ScopeRecord::new_fixture(&state.tenant_id, org_name);
        (s, p)
    };

    let engine = IngestionEngine::new(state.graph.clone(), state.evidence.clone());
    let res = engine
        .ingest_fixture_directory(&scope, &target_path)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok((StatusCode::ACCEPTED, Json(res)))
}

async fn list_organizations_handler(
    State(state): State<Arc<AppState>>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let nodes = state
        .graph
        .list_nodes(&state.tenant_id)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let orgs: Vec<_> = nodes
        .into_iter()
        .filter(|n| n.kind == osakg_core::NodeKind::Organization)
        .collect();

    Ok(Json(orgs))
}

async fn neighborhood_handler(
    State(state): State<Arc<AppState>>,
    Query(query): Query<NeighborhoodQuery>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let root_id = NodeId::from_raw(&query.node_id);
    let depth = query.depth.unwrap_or(1);
    let limit = query.limit.unwrap_or(50);

    let res = state
        .graph
        .get_neighborhood(&state.tenant_id, &root_id, depth, limit)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(res))
}

async fn evidence_handler(
    State(state): State<Arc<AppState>>,
    AxumPath(id): AxumPath<String>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let ev = state
        .evidence
        .get_evidence(&state.tenant_id, &id)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    match ev {
        Some(record) => Ok(Json(record)),
        None => Err((StatusCode::NOT_FOUND, "Evidence not found".into())),
    }
}

async fn universe_tiles_handler(
    State(state): State<Arc<AppState>>,
    Query(query): Query<UniverseQuery>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let org_id = query.org_id.unwrap_or_else(|| "default-org".to_string());
    let level = query.level.unwrap_or(0);

    let tiles = state
        .graph
        .get_universe_tiles(&state.tenant_id, &org_id, level)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    if tiles.nodes.is_empty() {
        for path in &[
            "data/anthropics_universe.json",
            "../data/anthropics_universe.json",
            "apps/web/public/anthropics_universe.json",
        ] {
            if let Ok(bytes) = std::fs::read(path) {
                if let Ok(data) = serde_json::from_slice::<serde_json::Value>(&bytes) {
                    return Ok(Json(data));
                }
            }
        }
    }

    Ok(Json(serde_json::to_value(tiles).unwrap_or_default()))
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::http::Request;
    use tower::ServiceExt;

    #[tokio::test]
    async fn test_health_endpoint() {
        let state = AppState {
            graph: InMemoryGraphStore::new(),
            evidence: EvidenceStore::in_memory().unwrap(),
            tenant_id: "test-tenant".into(),
        };
        let app = create_router(state);

        let response = app
            .oneshot(
                Request::builder()
                    .uri("/health")
                    .body(axum::body::Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);
    }
}
