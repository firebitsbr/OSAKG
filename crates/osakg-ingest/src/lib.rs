use osakg_codegraph::CodeGraphExtractor;
use osakg_core::{
    ClaimState, EdgeKind, EvidenceRecord, GraphEdge, GraphNode, IngestionJobResponse, NodeId,
    NodeKind, OsakgError, Result, ScopeRecord,
};
use osakg_evidence::EvidenceStore;
use osakg_graph::GraphStore;
use std::collections::HashSet;
use std::fs;
use std::path::Path;
use walkdir::WalkDir;

pub struct IngestionEngine<G: GraphStore> {
    graph_store: G,
    evidence_store: EvidenceStore,
}

impl<G: GraphStore> IngestionEngine<G> {
    pub fn new(graph_store: G, evidence_store: EvidenceStore) -> Self {
        Self {
            graph_store,
            evidence_store,
        }
    }

    pub fn ingest_fixture_directory(
        &self,
        scope: &ScopeRecord,
        root_dir: &Path,
    ) -> Result<IngestionJobResponse> {
        let tenant_id = &scope.tenant_id;
        let job_id = format!("job-{}", uuid::Uuid::new_v4());

        if !root_dir.exists() || !root_dir.is_dir() {
            return Err(OsakgError::ValidationError(format!(
                "Directory does not exist: {}",
                root_dir.display()
            )));
        }

        // 1. Create Organization Node
        let org_node = GraphNode::new(
            tenant_id,
            NodeKind::Organization,
            "synthetic",
            &scope.org_name,
            &scope.org_name,
            "snapshot-0",
            ClaimState::Observed,
            1.0,
            vec![],
            serde_json::json!({
                "scope_id": scope.id,
                "mode": format!("{:?}", scope.mode),
            }),
        );
        self.graph_store.upsert_node(org_node.clone())?;

        // 2. Create Global Trust Boundaries
        let tb_public = GraphNode::new(
            tenant_id,
            NodeKind::TrustBoundary,
            "architecture_spec",
            "TrustBoundary::PublicInternet",
            "Public Internet Edge",
            "v1",
            ClaimState::Observed,
            1.0,
            vec![],
            serde_json::json!({ "zone": "untrusted_public", "ingress_tier": "dmz" }),
        );
        self.graph_store.upsert_node(tb_public.clone())?;

        let tb_internal = GraphNode::new(
            tenant_id,
            NodeKind::TrustBoundary,
            "architecture_spec",
            "TrustBoundary::InternalMesh",
            "Internal Service Mesh",
            "v1",
            ClaimState::Observed,
            1.0,
            vec![],
            serde_json::json!({ "zone": "internal_vpc", "mTLS": true }),
        );
        self.graph_store.upsert_node(tb_internal.clone())?;

        let tb_data = GraphNode::new(
            tenant_id,
            NodeKind::TrustBoundary,
            "architecture_spec",
            "TrustBoundary::SecureDataTier",
            "Secure Database Tier",
            "v1",
            ClaimState::Observed,
            1.0,
            vec![],
            serde_json::json!({ "zone": "isolated_db", "encryption": "AES-256" }),
        );
        self.graph_store.upsert_node(tb_data.clone())?;

        let tb_ai = GraphNode::new(
            tenant_id,
            NodeKind::TrustBoundary,
            "architecture_spec",
            "TrustBoundary::AIAgentSandbox",
            "AI Agent Execution Sandbox",
            "v1",
            ClaimState::Observed,
            1.0,
            vec![],
            serde_json::json!({ "zone": "ai_agent_runtime", "tool_broker": "strict" }),
        );
        self.graph_store.upsert_node(tb_ai.clone())?;

        let mut repos_indexed = 0;
        let mut files_indexed = 0;
        let mut nodes_created = 5; // Org + 4 Trust Boundaries
        let mut edges_created = 0;
        let mut errors = Vec::new();
        let mut created_directories: HashSet<String> = HashSet::new();

        // Discover repositories in root_dir
        let entries =
            fs::read_dir(root_dir).map_err(|e| OsakgError::StorageError(e.to_string()))?;

        for entry in entries {
            let entry = match entry {
                Ok(e) => e,
                Err(err) => {
                    errors.push(err.to_string());
                    continue;
                }
            };

            let path = entry.path();
            if !path.is_dir() {
                continue;
            }

            let repo_name = path
                .file_name()
                .and_then(|n| n.to_str())
                .unwrap_or_default()
                .to_string();

            if !scope.is_repo_allowed(&repo_name) {
                continue;
            }

            let commit_sha = "commit-snapshot-01";
            let ev_repo = EvidenceRecord::new_observed(
                tenant_id,
                &repo_name,
                commit_sha,
                None,
                None,
                None,
                "osakg-ingest-fs",
            );
            self.evidence_store.insert_evidence(&ev_repo)?;

            // 3. Create Repository Node
            let repo_node = GraphNode::new(
                tenant_id,
                NodeKind::Repository,
                "local_fs",
                &repo_name,
                &repo_name,
                commit_sha,
                ClaimState::Observed,
                1.0,
                vec![ev_repo.id.clone()],
                serde_json::json!({ "path": path.to_string_lossy() }),
            );
            self.graph_store.upsert_node(repo_node.clone())?;
            nodes_created += 1;
            repos_indexed += 1;

            // Org -> CONTAINS -> Repo
            let org_repo_edge = GraphEdge::new(
                tenant_id,
                EdgeKind::Contains,
                org_node.id.clone(),
                repo_node.id.clone(),
                ClaimState::Observed,
                1.0,
                vec![ev_repo.id.clone()],
                serde_json::json!({}),
            );
            self.graph_store.upsert_edge(org_repo_edge)?;
            edges_created += 1;

            // Repo -> CROSSES_BOUNDARY -> Internal Mesh
            let repo_boundary = GraphEdge::new(
                tenant_id,
                EdgeKind::CrossesBoundary,
                repo_node.id.clone(),
                tb_internal.id.clone(),
                ClaimState::Observed,
                1.0,
                vec![ev_repo.id.clone()],
                serde_json::json!({}),
            );
            self.graph_store.upsert_edge(repo_boundary)?;
            edges_created += 1;

            // Walk directory and index files, directories, code entities
            for file_entry in WalkDir::new(&path).into_iter().filter_map(|e| e.ok()) {
                let fpath = file_entry.path();

                if fpath.is_dir() && fpath != path {
                    let rel_dir = fpath
                        .strip_prefix(&path)
                        .unwrap_or(fpath)
                        .to_string_lossy()
                        .to_string();

                    if !created_directories.contains(&rel_dir) {
                        created_directories.insert(rel_dir.clone());
                        let dir_qname = format!("{}::dir::{}", repo_name, rel_dir);
                        let dir_node = GraphNode::new(
                            tenant_id,
                            NodeKind::Directory,
                            "local_fs",
                            &dir_qname,
                            &rel_dir,
                            commit_sha,
                            ClaimState::Observed,
                            1.0,
                            vec![ev_repo.id.clone()],
                            serde_json::json!({ "directory": rel_dir }),
                        );
                        self.graph_store.upsert_node(dir_node.clone())?;
                        nodes_created += 1;

                        let repo_dir_edge = GraphEdge::new(
                            tenant_id,
                            EdgeKind::Contains,
                            repo_node.id.clone(),
                            dir_node.id.clone(),
                            ClaimState::Observed,
                            1.0,
                            vec![ev_repo.id.clone()],
                            serde_json::json!({}),
                        );
                        self.graph_store.upsert_edge(repo_dir_edge)?;
                        edges_created += 1;
                    }
                }

                if fpath.is_file() {
                    let rel_path = fpath
                        .strip_prefix(&path)
                        .unwrap_or(fpath)
                        .to_string_lossy()
                        .to_string();

                    files_indexed += 1;

                    let ev_file = EvidenceRecord::new_observed(
                        tenant_id,
                        &repo_name,
                        commit_sha,
                        Some(rel_path.clone()),
                        Some(1),
                        Some(1),
                        "osakg-file-inventory",
                    );
                    self.evidence_store.insert_evidence(&ev_file)?;

                    // 4. Create File Node
                    let file_qname = format!("{}::{}", repo_name, rel_path);
                    let file_node = GraphNode::new(
                        tenant_id,
                        NodeKind::File,
                        "local_fs",
                        &file_qname,
                        &rel_path,
                        commit_sha,
                        ClaimState::Observed,
                        1.0,
                        vec![ev_file.id.clone()],
                        serde_json::json!({
                            "repo": repo_name,
                            "relative_path": rel_path,
                        }),
                    );
                    self.graph_store.upsert_node(file_node.clone())?;
                    nodes_created += 1;

                    let repo_file_edge = GraphEdge::new(
                        tenant_id,
                        EdgeKind::Contains,
                        repo_node.id.clone(),
                        file_node.id.clone(),
                        ClaimState::Observed,
                        1.0,
                        vec![ev_file.id.clone()],
                        serde_json::json!({}),
                    );
                    self.graph_store.upsert_edge(repo_file_edge)?;
                    edges_created += 1;

                    // 5. Deep AST & Symbol Extraction from Code Files (.ts, .js, .rs, .py)
                    if let Ok(content) = fs::read_to_string(fpath) {
                        if rel_path.ends_with(".ts")
                            || rel_path.ends_with(".js")
                            || rel_path.ends_with(".rs")
                            || rel_path.ends_with(".py")
                        {
                            if let Ok(extracted) =
                                CodeGraphExtractor::extract_entities(&content, &rel_path)
                            {
                                for item in extracted {
                                    let mut ev_item = EvidenceRecord::new_observed(
                                        tenant_id,
                                        &repo_name,
                                        commit_sha,
                                        Some(rel_path.clone()),
                                        Some(item.start_line),
                                        Some(item.end_line),
                                        "osakg-codegraph-ast",
                                    );
                                    ev_item.snippet = Some(item.snippet.clone());
                                    self.evidence_store.insert_evidence(&ev_item)?;

                                    let qname =
                                        format!("{}::{}::{}", repo_name, rel_path, item.name);
                                    let entity_node = GraphNode::new(
                                        tenant_id,
                                        item.kind,
                                        "ast_parser",
                                        &qname,
                                        &item.name,
                                        commit_sha,
                                        ClaimState::Observed,
                                        1.0,
                                        vec![ev_item.id.clone()],
                                        serde_json::json!({
                                            "signature": item.signature,
                                            "start_line": item.start_line,
                                            "end_line": item.end_line,
                                        }),
                                    );
                                    self.graph_store.upsert_node(entity_node.clone())?;
                                    nodes_created += 1;

                                    // File -> DECLARES -> Entity
                                    let decl_edge = GraphEdge::new(
                                        tenant_id,
                                        EdgeKind::Declares,
                                        file_node.id.clone(),
                                        entity_node.id.clone(),
                                        ClaimState::Observed,
                                        1.0,
                                        vec![ev_item.id.clone()],
                                        serde_json::json!({}),
                                    );
                                    self.graph_store.upsert_edge(decl_edge)?;
                                    edges_created += 1;

                                    // Security Controls
                                    if item.security_role.is_some() {
                                        let ctrl_qname =
                                            format!("Control::TokenValidation::{}", item.name);
                                        let ctrl_node = GraphNode::new(
                                            tenant_id,
                                            NodeKind::Control,
                                            "security_analyzer",
                                            &ctrl_qname,
                                            format!("Control: Verify Auth ({})", item.name),
                                            commit_sha,
                                            ClaimState::Observed,
                                            1.0,
                                            vec![ev_item.id.clone()],
                                            serde_json::json!({ "type": "AuthenticationTokenValidation" }),
                                        );
                                        self.graph_store.upsert_node(ctrl_node.clone())?;
                                        nodes_created += 1;

                                        let prot_edge = GraphEdge::new(
                                            tenant_id,
                                            EdgeKind::Protects,
                                            ctrl_node.id.clone(),
                                            entity_node.id.clone(),
                                            ClaimState::Observed,
                                            1.0,
                                            vec![ev_item.id.clone()],
                                            serde_json::json!({}),
                                        );
                                        self.graph_store.upsert_edge(prot_edge)?;
                                        edges_created += 1;
                                    }

                                    // DataStore & DataAsset linkages
                                    for ds_name in item.reads_data {
                                        let ds_qname = format!("DataStore::{}", ds_name);
                                        let ds_node = GraphNode::new(
                                            tenant_id,
                                            NodeKind::DataStore,
                                            "database_schema",
                                            &ds_qname,
                                            &ds_name,
                                            commit_sha,
                                            ClaimState::Observed,
                                            1.0,
                                            vec![ev_item.id.clone()],
                                            serde_json::json!({ "engine": "PostgreSQL", "tier": "secure_data" }),
                                        );
                                        self.graph_store.upsert_node(ds_node.clone())?;
                                        nodes_created += 1;

                                        let read_edge = GraphEdge::new(
                                            tenant_id,
                                            EdgeKind::Reads,
                                            entity_node.id.clone(),
                                            ds_node.id.clone(),
                                            ClaimState::Observed,
                                            1.0,
                                            vec![ev_item.id.clone()],
                                            serde_json::json!({}),
                                        );
                                        self.graph_store.upsert_edge(read_edge)?;
                                        edges_created += 1;

                                        // DataStore -> CROSSES_BOUNDARY -> Data Tier
                                        let ds_boundary = GraphEdge::new(
                                            tenant_id,
                                            EdgeKind::CrossesBoundary,
                                            ds_node.id.clone(),
                                            tb_data.id.clone(),
                                            ClaimState::Observed,
                                            1.0,
                                            vec![ev_item.id.clone()],
                                            serde_json::json!({}),
                                        );
                                        self.graph_store.upsert_edge(ds_boundary)?;
                                        edges_created += 1;
                                    }

                                    for ds_name in item.writes_data {
                                        let ds_qname = format!("DataStore::{}", ds_name);
                                        let ds_node = GraphNode::new(
                                            tenant_id,
                                            NodeKind::DataStore,
                                            "database_schema",
                                            &ds_qname,
                                            &ds_name,
                                            commit_sha,
                                            ClaimState::Observed,
                                            1.0,
                                            vec![ev_item.id.clone()],
                                            serde_json::json!({ "engine": "PostgreSQL" }),
                                        );
                                        self.graph_store.upsert_node(ds_node.clone())?;
                                        nodes_created += 1;

                                        let write_edge = GraphEdge::new(
                                            tenant_id,
                                            EdgeKind::Writes,
                                            entity_node.id.clone(),
                                            ds_node.id.clone(),
                                            ClaimState::Observed,
                                            1.0,
                                            vec![ev_item.id.clone()],
                                            serde_json::json!({}),
                                        );
                                        self.graph_store.upsert_edge(write_edge)?;
                                        edges_created += 1;

                                        // Finding: Taint flow candidate
                                        let finding_qname =
                                            format!("Finding::DataSink::{}", item.name);
                                        let finding_node = GraphNode::new(
                                            tenant_id,
                                            NodeKind::Finding,
                                            "static_taint_analyzer",
                                            &finding_qname,
                                            format!(
                                                "Finding: Unsanitized Data Sink ({})",
                                                item.name
                                            ),
                                            commit_sha,
                                            ClaimState::Inferred,
                                            0.85,
                                            vec![ev_item.id.clone()],
                                            serde_json::json!({
                                                "cwe": "CWE-89",
                                                "severity": "HIGH",
                                                "rule": "unvalidated_datastore_write"
                                            }),
                                        );
                                        self.graph_store.upsert_node(finding_node.clone())?;
                                        nodes_created += 1;

                                        let finding_edge = GraphEdge::new(
                                            tenant_id,
                                            EdgeKind::SupportedBy,
                                            finding_node.id.clone(),
                                            entity_node.id.clone(),
                                            ClaimState::Inferred,
                                            0.85,
                                            vec![ev_item.id.clone()],
                                            serde_json::json!({}),
                                        );
                                        self.graph_store.upsert_edge(finding_edge)?;
                                        edges_created += 1;
                                    }
                                }
                            }
                        }

                        // 6. Parse Package Dependencies (package.json)
                        if rel_path.ends_with("package.json") {
                            if let Ok(v) = serde_json::from_str::<serde_json::Value>(&content) {
                                let pkg_name =
                                    v.get("name").and_then(|n| n.as_str()).unwrap_or(&repo_name);
                                let pkg_ver = v
                                    .get("version")
                                    .and_then(|ve| ve.as_str())
                                    .unwrap_or("0.1.0");

                                let pkg_node = GraphNode::new(
                                    tenant_id,
                                    NodeKind::Package,
                                    "manifest",
                                    format!("Package::{}@{}", pkg_name, pkg_ver),
                                    format!("{}@{}", pkg_name, pkg_ver),
                                    commit_sha,
                                    ClaimState::Observed,
                                    1.0,
                                    vec![ev_file.id.clone()],
                                    serde_json::json!({ "name": pkg_name, "version": pkg_ver }),
                                );
                                self.graph_store.upsert_node(pkg_node.clone())?;
                                nodes_created += 1;

                                let repo_pkg_edge = GraphEdge::new(
                                    tenant_id,
                                    EdgeKind::Contains,
                                    repo_node.id.clone(),
                                    pkg_node.id.clone(),
                                    ClaimState::Observed,
                                    1.0,
                                    vec![ev_file.id.clone()],
                                    serde_json::json!({}),
                                );
                                self.graph_store.upsert_edge(repo_pkg_edge)?;
                                edges_created += 1;

                                if let Some(deps) =
                                    v.get("dependencies").and_then(|d| d.as_object())
                                {
                                    for (dep_name, dep_ver) in deps {
                                        let dep_ver_str = dep_ver.as_str().unwrap_or("*");
                                        let dep_node = GraphNode::new(
                                            tenant_id,
                                            NodeKind::Dependency,
                                            "manifest",
                                            format!("Dependency::{}@{}", dep_name, dep_ver_str),
                                            format!("{} ({})", dep_name, dep_ver_str),
                                            commit_sha,
                                            ClaimState::Observed,
                                            1.0,
                                            vec![ev_file.id.clone()],
                                            serde_json::json!({ "package": dep_name, "version_req": dep_ver_str }),
                                        );
                                        self.graph_store.upsert_node(dep_node.clone())?;
                                        nodes_created += 1;

                                        let dep_edge = GraphEdge::new(
                                            tenant_id,
                                            EdgeKind::DependsOn,
                                            pkg_node.id.clone(),
                                            dep_node.id.clone(),
                                            ClaimState::Observed,
                                            1.0,
                                            vec![ev_file.id.clone()],
                                            serde_json::json!({}),
                                        );
                                        self.graph_store.upsert_edge(dep_edge)?;
                                        edges_created += 1;
                                    }
                                }
                            }
                        }

                        // 7. Parse OpenAPI Specs into Endpoints & Services
                        if rel_path.ends_with("openapi.json") {
                            if let Ok(v) = serde_json::from_str::<serde_json::Value>(&content) {
                                if let Some(paths) = v.get("paths").and_then(|p| p.as_object()) {
                                    for (endpoint_path, methods) in paths {
                                        let ep_qname = format!("{}::{}", repo_name, endpoint_path);
                                        let ep_node = GraphNode::new(
                                            tenant_id,
                                            NodeKind::Endpoint,
                                            "openapi_spec",
                                            &ep_qname,
                                            endpoint_path,
                                            commit_sha,
                                            ClaimState::Observed,
                                            1.0,
                                            vec![ev_file.id.clone()],
                                            methods.clone(),
                                        );
                                        self.graph_store.upsert_node(ep_node.clone())?;
                                        nodes_created += 1;

                                        let expose_edge = GraphEdge::new(
                                            tenant_id,
                                            EdgeKind::Exposes,
                                            repo_node.id.clone(),
                                            ep_node.id.clone(),
                                            ClaimState::Observed,
                                            1.0,
                                            vec![ev_file.id.clone()],
                                            serde_json::json!({ "path": endpoint_path }),
                                        );
                                        self.graph_store.upsert_edge(expose_edge)?;
                                        edges_created += 1;

                                        // Endpoint -> CROSSES_BOUNDARY -> Public Internet
                                        let ep_boundary = GraphEdge::new(
                                            tenant_id,
                                            EdgeKind::CrossesBoundary,
                                            ep_node.id.clone(),
                                            tb_public.id.clone(),
                                            ClaimState::Observed,
                                            1.0,
                                            vec![ev_file.id.clone()],
                                            serde_json::json!({}),
                                        );
                                        self.graph_store.upsert_edge(ep_boundary)?;
                                        edges_created += 1;
                                    }
                                }
                            }
                        }

                        // 8. Parse AI Agents, Tools, and Models
                        if rel_path.ends_with("manifest.json") {
                            if let Ok(v) = serde_json::from_str::<serde_json::Value>(&content) {
                                if v.get("type").and_then(|t| t.as_str()) == Some("AIAgent") {
                                    let agent_name = v
                                        .get("name")
                                        .and_then(|n| n.as_str())
                                        .unwrap_or("Autonomous Agent");

                                    // Model Node
                                    if let Some(model_name) =
                                        v.get("model").and_then(|m| m.as_str())
                                    {
                                        let model_node = GraphNode::new(
                                            tenant_id,
                                            NodeKind::AIModel,
                                            "agent_manifest",
                                            format!("AIModel::{}", model_name),
                                            model_name,
                                            commit_sha,
                                            ClaimState::Observed,
                                            1.0,
                                            vec![ev_file.id.clone()],
                                            serde_json::json!({ "model": model_name }),
                                        );
                                        self.graph_store.upsert_node(model_node.clone())?;
                                        nodes_created += 1;
                                    }

                                    let agent_node = GraphNode::new(
                                        tenant_id,
                                        NodeKind::AIAgent,
                                        "agent_manifest",
                                        format!("{}::{}", repo_name, agent_name),
                                        agent_name,
                                        commit_sha,
                                        ClaimState::Observed,
                                        1.0,
                                        vec![ev_file.id.clone()],
                                        v.clone(),
                                    );
                                    self.graph_store.upsert_node(agent_node.clone())?;
                                    nodes_created += 1;

                                    let agent_edge = GraphEdge::new(
                                        tenant_id,
                                        EdgeKind::Declares,
                                        repo_node.id.clone(),
                                        agent_node.id.clone(),
                                        ClaimState::Observed,
                                        1.0,
                                        vec![ev_file.id.clone()],
                                        serde_json::json!({}),
                                    );
                                    self.graph_store.upsert_edge(agent_edge)?;
                                    edges_created += 1;

                                    // Agent -> CROSSES_BOUNDARY -> AI Sandbox
                                    let ai_boundary = GraphEdge::new(
                                        tenant_id,
                                        EdgeKind::CrossesBoundary,
                                        agent_node.id.clone(),
                                        tb_ai.id.clone(),
                                        ClaimState::Observed,
                                        1.0,
                                        vec![ev_file.id.clone()],
                                        serde_json::json!({}),
                                    );
                                    self.graph_store.upsert_edge(ai_boundary)?;
                                    edges_created += 1;

                                    // Parse Tools & Tool Boundaries
                                    if let Some(tools) = v.get("tools").and_then(|t| t.as_array()) {
                                        for t in tools {
                                            if let Some(tname) =
                                                t.get("name").and_then(|n| n.as_str())
                                            {
                                                let tool_node = GraphNode::new(
                                                    tenant_id,
                                                    NodeKind::Tool,
                                                    "agent_manifest",
                                                    format!("{}::{}", repo_name, tname),
                                                    tname,
                                                    commit_sha,
                                                    ClaimState::Observed,
                                                    1.0,
                                                    vec![ev_file.id.clone()],
                                                    t.clone(),
                                                );
                                                self.graph_store.upsert_node(tool_node.clone())?;
                                                nodes_created += 1;

                                                let has_tool_edge = GraphEdge::new(
                                                    tenant_id,
                                                    EdgeKind::Grants,
                                                    agent_node.id.clone(),
                                                    tool_node.id.clone(),
                                                    ClaimState::Observed,
                                                    1.0,
                                                    vec![ev_file.id.clone()],
                                                    serde_json::json!({}),
                                                );
                                                self.graph_store.upsert_edge(has_tool_edge)?;
                                                edges_created += 1;

                                                // Cross boundary link to target service or datastore
                                                if let Some(target_srv) =
                                                    t.get("target_service").and_then(|s| s.as_str())
                                                {
                                                    let target_repo_id = NodeId::new(
                                                        tenant_id,
                                                        "Repository",
                                                        "local_fs",
                                                        target_srv,
                                                        commit_sha,
                                                    );
                                                    let boundary_edge = GraphEdge::new(
                                                        tenant_id,
                                                        EdgeKind::CrossesBoundary,
                                                        tool_node.id.clone(),
                                                        target_repo_id,
                                                        ClaimState::Inferred,
                                                        0.9,
                                                        vec![ev_file.id.clone()],
                                                        serde_json::json!({
                                                            "trust_boundary": t.get("trust_boundary"),
                                                        }),
                                                    );
                                                    self.graph_store.upsert_edge(boundary_edge)?;
                                                    edges_created += 1;
                                                }

                                                if let Some(target_ds) = t
                                                    .get("target_datastore")
                                                    .and_then(|d| d.as_str())
                                                {
                                                    let ds_qname =
                                                        format!("DataStore::{}", target_ds);
                                                    let target_ds_id = NodeId::new(
                                                        tenant_id,
                                                        "DataStore",
                                                        "database_schema",
                                                        &ds_qname,
                                                        commit_sha,
                                                    );
                                                    let taint_edge = GraphEdge::new(
                                                        tenant_id,
                                                        EdgeKind::TaintFlowsTo,
                                                        tool_node.id.clone(),
                                                        target_ds_id,
                                                        ClaimState::Validated,
                                                        0.95,
                                                        vec![ev_file.id.clone()],
                                                        serde_json::json!({ "risk": "direct_datastore_mutation" }),
                                                    );
                                                    self.graph_store.upsert_edge(taint_edge)?;
                                                    edges_created += 1;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        self.evidence_store
            .log_audit(tenant_id, "fixture_ingestion_completed", &job_id)?;

        Ok(IngestionJobResponse {
            job_id,
            tenant_id: tenant_id.to_string(),
            state: "completed".to_string(),
            repositories_indexed: repos_indexed,
            files_indexed,
            nodes_created,
            edges_created,
            errors,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use osakg_graph::InMemoryGraphStore;
    use std::path::PathBuf;

    #[test]
    fn test_ingest_synthetic_org_fixture() {
        let graph = InMemoryGraphStore::new();
        let evidence = EvidenceStore::in_memory().unwrap();
        let engine = IngestionEngine::new(graph.clone(), evidence.clone());

        let scope = ScopeRecord::new_fixture("tenant-demo", "Synthetic Security Org");

        let mut manifest_path = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
        manifest_path.pop(); // crates/
        manifest_path.pop(); // root
        manifest_path.push("fixtures");
        manifest_path.push("synthetic-org");

        let res = engine
            .ingest_fixture_directory(&scope, &manifest_path)
            .expect("Ingestion must succeed");

        assert_eq!(res.state, "completed");
        assert_eq!(res.repositories_indexed, 3);
        assert!(res.files_indexed >= 7);
        // We now have granular nodes: Organization, Repositories, Directories, Files, Classes, Functions, Packages, Dependencies, Endpoints, AIAgent, Tools, DataStores, Controls, TrustBoundaries, Findings!
        assert!(res.nodes_created >= 25);
        assert!(res.edges_created >= 25);

        // Check universe tiles
        let tiles = graph
            .get_universe_tiles("tenant-demo", "synth-org-1", 0)
            .unwrap();
        assert!(tiles.nodes.len() >= 25);
        assert!(tiles.edges.len() >= 25);
    }
}
