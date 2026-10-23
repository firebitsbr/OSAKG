// =====================================================================
// Author: Mauro Risonho de Paula Assumpção
// Create: 2026-10-18
// Update: 2026-10-23
// Short Description: Graph edge definitions, relationship types, and directional attributes
// License: MIT
// =====================================================================

use crate::evidence::ClaimState;
use crate::id::NodeId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum EdgeKind {
    Contains,
    Declares,
    Imports,
    Calls,
    DependsOn,
    Exposes,
    RoutesTo,
    Publishes,
    Consumes,
    Reads,
    Writes,
    Grants,
    CrossesBoundary,
    TaintFlowsTo,
    Protects,
    MayReach,
    SupportedBy,
    Refutes,
}

impl std::fmt::Display for EdgeKind {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            EdgeKind::Contains => write!(f, "CONTAINS"),
            EdgeKind::Declares => write!(f, "DECLARES"),
            EdgeKind::Imports => write!(f, "IMPORTS"),
            EdgeKind::Calls => write!(f, "CALLS"),
            EdgeKind::DependsOn => write!(f, "DEPENDS_ON"),
            EdgeKind::Exposes => write!(f, "EXPOSES"),
            EdgeKind::RoutesTo => write!(f, "ROUTES_TO"),
            EdgeKind::Publishes => write!(f, "PUBLISHES"),
            EdgeKind::Consumes => write!(f, "CONSUMES"),
            EdgeKind::Reads => write!(f, "READS"),
            EdgeKind::Writes => write!(f, "WRITES"),
            EdgeKind::Grants => write!(f, "GRANTS"),
            EdgeKind::CrossesBoundary => write!(f, "CROSSES_BOUNDARY"),
            EdgeKind::TaintFlowsTo => write!(f, "TAINT_FLOWS_TO"),
            EdgeKind::Protects => write!(f, "PROTECTS"),
            EdgeKind::MayReach => write!(f, "MAY_REACH"),
            EdgeKind::SupportedBy => write!(f, "SUPPORTED_BY"),
            EdgeKind::Refutes => write!(f, "REFUTES"),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct GraphEdge {
    pub id: String,
    pub tenant_id: String,
    pub kind: EdgeKind,
    pub source: NodeId,
    pub target: NodeId,
    pub claim_state: ClaimState,
    pub confidence: f32,
    pub evidence_ids: Vec<String>,
    pub properties: serde_json::Value,
}

impl GraphEdge {
    #[allow(clippy::too_many_arguments)]
    pub fn new(
        tenant_id: impl Into<String>,
        kind: EdgeKind,
        source: NodeId,
        target: NodeId,
        claim_state: ClaimState,
        confidence: f32,
        evidence_ids: Vec<String>,
        properties: serde_json::Value,
    ) -> Self {
        let tenant = tenant_id.into();
        let id = format!("{}:{}:{}:{}", tenant, kind, source, target);
        Self {
            id,
            tenant_id: tenant,
            kind,
            source,
            target,
            claim_state,
            confidence,
            evidence_ids,
            properties,
        }
    }
}
