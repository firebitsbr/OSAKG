use osakg_core::{CandidatePath, NodeId, PathQueryResponse, Result};
use osakg_graph::GraphStore;

pub struct AttackPathEngine<G: GraphStore> {
    graph: G,
}

impl<G: GraphStore> AttackPathEngine<G> {
    pub fn new(graph: G) -> Self {
        Self { graph }
    }

    pub fn find_candidate_paths(
        &self,
        tenant_id: &str,
        source: &NodeId,
        target: &NodeId,
        max_hops: u32,
    ) -> Result<PathQueryResponse> {
        let neighborhood = self
            .graph
            .get_neighborhood(tenant_id, source, max_hops, 50)?;

        let mut paths = Vec::new();
        // Check if target is reached in neighborhood
        if neighborhood.nodes.iter().any(|n| &n.id == target) {
            paths.push(CandidatePath {
                nodes: neighborhood.nodes.clone(),
                edges: neighborhood.edges.clone(),
                confidence: 0.8,
                risk_summary: "Candidate path discovered via bounded graph exploration".into(),
            });
        }

        Ok(PathQueryResponse {
            source: source.clone(),
            target: target.clone(),
            max_hops,
            paths,
        })
    }
}
