// =====================================================================
// Author: Mauro Risonho de Paula Assumpção
// Create: 2026-10-18
// Update: 2026-10-23
// Short Description: Native entrypoint initializing the Tauri 2 runtime and IPC bridge
// License: MIT
// =====================================================================

// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use osakg_core::{
    EvidenceRecord, HealthResponse, IngestionJobResponse, NeighborhoodResponse, NodeId,
    ScopeRecord, UniverseTileResponse,
};
use osakg_evidence::EvidenceStore;
use osakg_graph::{GraphStore, InMemoryGraphStore};
use osakg_ingest::IngestionEngine;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use tauri::State;

struct AppState {
    graph: InMemoryGraphStore,
    evidence: EvidenceStore,
    tenant_id: String,
}

#[tauri::command]
fn get_health() -> HealthResponse {
    HealthResponse {
        status: "healthy".to_string(),
        schema_version: "0.1.0".to_string(),
        service: "osakg-desktop".to_string(),
        offline_fixture_mode: true,
    }
}

#[tauri::command]
fn get_universe_tiles(
    state: State<'_, Arc<Mutex<AppState>>>,
    org_id: Option<String>,
    level: Option<u32>,
) -> Result<UniverseTileResponse, String> {
    let s = state.lock().map_err(|e| e.to_string())?;
    let org = org_id.unwrap_or_else(|| "default-org".to_string());
    let lvl = level.unwrap_or(0);
    s.graph
        .get_universe_tiles(&s.tenant_id, &org, lvl)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn get_neighborhood(
    state: State<'_, Arc<Mutex<AppState>>>,
    node_id: String,
    depth: Option<u32>,
    limit: Option<usize>,
) -> Result<NeighborhoodResponse, String> {
    let s = state.lock().map_err(|e| e.to_string())?;
    let root = NodeId::from_raw(node_id);
    let d = depth.unwrap_or(1);
    let lim = limit.unwrap_or(50);
    s.graph
        .get_neighborhood(&s.tenant_id, &root, d, lim)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn get_evidence(
    state: State<'_, Arc<Mutex<AppState>>>,
    id: String,
) -> Result<Option<EvidenceRecord>, String> {
    let s = state.lock().map_err(|e| e.to_string())?;
    s.evidence
        .get_evidence(&s.tenant_id, &id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn ingest_fixtures(
    state: State<'_, Arc<Mutex<AppState>>>,
    org_name: Option<String>,
) -> Result<IngestionJobResponse, String> {
    let s = state.lock().map_err(|e| e.to_string())?;
    let name = org_name.unwrap_or_else(|| "Synthetic Security Org".to_string());
    let scope = ScopeRecord::new_fixture(&s.tenant_id, name);

    let mut path = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    path.pop(); // src-tauri
    path.pop(); // desktop
    path.pop(); // apps
    path.push("fixtures");
    path.push("synthetic-org");

    let engine = IngestionEngine::new(s.graph.clone(), s.evidence.clone());
    engine
        .ingest_fixture_directory(&scope, &path)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn ingest_github_org(
    state: State<'_, Arc<Mutex<AppState>>>,
    org_name: String,
    repos_json: Vec<serde_json::Value>,
) -> Result<IngestionJobResponse, String> {
    let s = state.lock().map_err(|e| e.to_string())?;
    let scope = ScopeRecord::new_passive(
        &s.tenant_id,
        &org_name,
        "desktop-operator",
        vec!["*".to_string()],
    );
    let engine = IngestionEngine::new(s.graph.clone(), s.evidence.clone());
    engine
        .ingest_github_repositories(&scope, &org_name, &repos_json)
        .map_err(|e| e.to_string())
}

fn main() {
    let graph = InMemoryGraphStore::new();
    let evidence = EvidenceStore::in_memory().expect("SQLite in-memory init failed");
    let tenant_id = "tenant-desktop-local".to_string();

    // Auto-ingest synthetic fixtures on startup for local fixture mode
    let scope = ScopeRecord::new_fixture(&tenant_id, "Synthetic Security Org");
    let mut fixture_path = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    fixture_path.pop();
    fixture_path.pop();
    fixture_path.pop();
    fixture_path.push("fixtures");
    fixture_path.push("synthetic-org");

    if fixture_path.exists() {
        let engine = IngestionEngine::new(graph.clone(), evidence.clone());
        let _ = engine.ingest_fixture_directory(&scope, &fixture_path);
    }

    let state = Arc::new(Mutex::new(AppState {
        graph,
        evidence,
        tenant_id,
    }));

    tauri::Builder::default()
        .manage(state)
        .invoke_handler(tauri::generate_handler![
            get_health,
            get_universe_tiles,
            get_neighborhood,
            get_evidence,
            ingest_fixtures,
            ingest_github_org
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
