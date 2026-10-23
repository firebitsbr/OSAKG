use osakg_core::{ClaimState, EdgeKind, GraphEdge, NodeId, Result};
use osakg_graph::GraphStore;

pub struct CrossRepoFusion;

impl CrossRepoFusion {
    pub fn match_explicit_dependency<G: GraphStore>(
        store: &G,
        tenant_id: &str,
        source_repo: &NodeId,
        target_repo: &NodeId,
        package_name: &str,
    ) -> Result<()> {
        let edge = GraphEdge::new(
            tenant_id,
            EdgeKind::DependsOn,
            source_repo.clone(),
            target_repo.clone(),
            ClaimState::Observed,
            1.0,
            vec![],
            serde_json::json!({ "package": package_name }),
        );
        store.upsert_edge(edge)
    }
}
