use crate::evidence::ClaimState;
use crate::id::NodeId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub enum NodeKind {
    Organization,
    Repository,
    Snapshot,
    Directory,
    File,
    Symbol,
    Function,
    Class,
    Package,
    Dependency,
    Endpoint,
    Service,
    Identity,
    Permission,
    DataAsset,
    DataStore,
    TrustBoundary,
    AIModel,
    AIAgent,
    Tool,
    Retriever,
    Finding,
    Evidence,
    Control,
}

impl std::fmt::Display for NodeKind {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{:?}", self)
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct GraphNode {
    pub id: NodeId,
    pub tenant_id: String,
    pub kind: NodeKind,
    pub canonical_source: String,
    pub qualified_name: String,
    pub display_name: String,
    pub commit_or_snapshot: String,
    pub claim_state: ClaimState,
    pub confidence: f32,
    pub evidence_ids: Vec<String>,
    pub properties: serde_json::Value,
}

impl GraphNode {
    #[allow(clippy::too_many_arguments)]
    pub fn new(
        tenant_id: impl Into<String>,
        kind: NodeKind,
        canonical_source: impl Into<String>,
        qualified_name: impl Into<String>,
        display_name: impl Into<String>,
        commit_or_snapshot: impl Into<String>,
        claim_state: ClaimState,
        confidence: f32,
        evidence_ids: Vec<String>,
        properties: serde_json::Value,
    ) -> Self {
        let tenant = tenant_id.into();
        let source = canonical_source.into();
        let qname = qualified_name.into();
        let commit = commit_or_snapshot.into();
        let id = NodeId::new(&tenant, &kind.to_string(), &source, &qname, &commit);
        Self {
            id,
            tenant_id: tenant,
            kind,
            canonical_source: source,
            qualified_name: qname,
            display_name: display_name.into(),
            commit_or_snapshot: commit,
            claim_state,
            confidence,
            evidence_ids,
            properties,
        }
    }
}
