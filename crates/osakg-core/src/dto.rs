use crate::edge::GraphEdge;
use crate::evidence::ClaimState;
use crate::id::NodeId;
use crate::node::{GraphNode, NodeKind};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct HealthResponse {
    pub status: String,
    pub schema_version: String,
    pub service: String,
    pub offline_fixture_mode: bool,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct NeighborhoodResponse {
    pub root_id: NodeId,
    pub depth: u32,
    pub nodes: Vec<GraphNode>,
    pub edges: Vec<GraphEdge>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct CandidatePath {
    pub nodes: Vec<GraphNode>,
    pub edges: Vec<GraphEdge>,
    pub confidence: f32,
    pub risk_summary: String,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct PathQueryResponse {
    pub source: NodeId,
    pub target: NodeId,
    pub max_hops: u32,
    pub paths: Vec<CandidatePath>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct UniverseNodeSpatial {
    pub id: NodeId,
    pub name: String,
    pub kind: NodeKind,
    pub cluster_group: String,
    pub x: f32,
    pub y: f32,
    pub z: f32,
    pub radius: f32,
    pub color_hint: String,
    pub claim_state: ClaimState,
    pub risk_level: String,
    pub metrics: serde_json::Value,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct UniverseEdgeSpatial {
    pub id: String,
    pub source: NodeId,
    pub target: NodeId,
    pub kind: String,
    pub claim_state: ClaimState,
    pub confidence: f32,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct UniverseTileResponse {
    pub org_id: String,
    pub org_name: String,
    pub level: u32,
    pub nodes: Vec<UniverseNodeSpatial>,
    pub edges: Vec<UniverseEdgeSpatial>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct IngestionJobResponse {
    pub job_id: String,
    pub tenant_id: String,
    pub state: String,
    pub repositories_indexed: usize,
    pub files_indexed: usize,
    pub nodes_created: usize,
    pub edges_created: usize,
    pub errors: Vec<String>,
}
