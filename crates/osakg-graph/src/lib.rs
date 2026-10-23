// =====================================================================
// Author: Mauro Risonho de Paula Assumpção
// Create: 2026-10-18
// Update: 2026-10-23
// Short Description: Petgraph wrapper, spatial indexing, and semantic zoom query layer
// License: MIT
// =====================================================================

use osakg_core::{
    GraphEdge, GraphNode, NeighborhoodResponse, NodeId, NodeKind, Result, UniverseEdgeSpatial,
    UniverseNodeSpatial, UniverseTileResponse,
};
use std::collections::{HashMap, HashSet, VecDeque};
use std::sync::{Arc, RwLock};

pub trait GraphStore: Send + Sync {
    fn upsert_node(&self, node: GraphNode) -> Result<()>;
    fn get_node(&self, tenant_id: &str, id: &NodeId) -> Result<Option<GraphNode>>;
    fn upsert_edge(&self, edge: GraphEdge) -> Result<()>;
    fn get_neighborhood(
        &self,
        tenant_id: &str,
        root: &NodeId,
        depth: u32,
        limit: usize,
    ) -> Result<NeighborhoodResponse>;
    fn get_universe_tiles(
        &self,
        tenant_id: &str,
        org_id: &str,
        level: u32,
    ) -> Result<UniverseTileResponse>;
    fn list_nodes(&self, tenant_id: &str) -> Result<Vec<GraphNode>>;
    fn list_edges(&self, tenant_id: &str) -> Result<Vec<GraphEdge>>;
}

#[derive(Default, Clone)]
pub struct InMemoryGraphStore {
    nodes: Arc<RwLock<HashMap<String, HashMap<NodeId, GraphNode>>>>,
    edges: Arc<RwLock<HashMap<String, HashMap<String, GraphEdge>>>>,
}

impl InMemoryGraphStore {
    pub fn new() -> Self {
        Self {
            nodes: Arc::new(RwLock::new(HashMap::new())),
            edges: Arc::new(RwLock::new(HashMap::new())),
        }
    }
}

impl GraphStore for InMemoryGraphStore {
    fn upsert_node(&self, node: GraphNode) -> Result<()> {
        let mut all_nodes = self.nodes.write().unwrap();
        let tenant_map = all_nodes.entry(node.tenant_id.clone()).or_default();
        tenant_map.insert(node.id.clone(), node);
        Ok(())
    }

    fn get_node(&self, tenant_id: &str, id: &NodeId) -> Result<Option<GraphNode>> {
        let all_nodes = self.nodes.read().unwrap();
        if let Some(tenant_map) = all_nodes.get(tenant_id) {
            Ok(tenant_map.get(id).cloned())
        } else {
            Ok(None)
        }
    }

    fn upsert_edge(&self, edge: GraphEdge) -> Result<()> {
        let mut all_edges = self.edges.write().unwrap();
        let tenant_map = all_edges.entry(edge.tenant_id.clone()).or_default();
        tenant_map.insert(edge.id.clone(), edge);
        Ok(())
    }

    fn list_nodes(&self, tenant_id: &str) -> Result<Vec<GraphNode>> {
        let all_nodes = self.nodes.read().unwrap();
        if let Some(tenant_map) = all_nodes.get(tenant_id) {
            Ok(tenant_map.values().cloned().collect())
        } else {
            Ok(Vec::new())
        }
    }

    fn list_edges(&self, tenant_id: &str) -> Result<Vec<GraphEdge>> {
        let all_edges = self.edges.read().unwrap();
        if let Some(tenant_map) = all_edges.get(tenant_id) {
            Ok(tenant_map.values().cloned().collect())
        } else {
            Ok(Vec::new())
        }
    }

    fn get_neighborhood(
        &self,
        tenant_id: &str,
        root: &NodeId,
        depth: u32,
        limit: usize,
    ) -> Result<NeighborhoodResponse> {
        let all_nodes = self.nodes.read().unwrap();
        let all_edges = self.edges.read().unwrap();

        let tenant_nodes = all_nodes.get(tenant_id);
        let tenant_edges = all_edges.get(tenant_id);

        let mut collected_nodes: HashMap<NodeId, GraphNode> = HashMap::new();
        let mut collected_edges: HashMap<String, GraphEdge> = HashMap::new();

        if let Some(nodes) = tenant_nodes {
            if let Some(root_node) = nodes.get(root) {
                collected_nodes.insert(root.clone(), root_node.clone());

                let mut queue = VecDeque::new();
                queue.push_back((root.clone(), 0u32));
                let mut visited = HashSet::new();
                visited.insert(root.clone());

                if let Some(edges) = tenant_edges {
                    while let Some((curr, curr_depth)) = queue.pop_front() {
                        if curr_depth >= depth || collected_nodes.len() >= limit {
                            continue;
                        }

                        for edge in edges.values() {
                            if edge.source == curr {
                                collected_edges.insert(edge.id.clone(), edge.clone());
                                if !visited.contains(&edge.target) && collected_nodes.len() < limit
                                {
                                    if let Some(target_node) = nodes.get(&edge.target) {
                                        visited.insert(edge.target.clone());
                                        collected_nodes
                                            .insert(edge.target.clone(), target_node.clone());
                                        queue.push_back((edge.target.clone(), curr_depth + 1));
                                    }
                                }
                            } else if edge.target == curr {
                                collected_edges.insert(edge.id.clone(), edge.clone());
                                if !visited.contains(&edge.source) && collected_nodes.len() < limit
                                {
                                    if let Some(source_node) = nodes.get(&edge.source) {
                                        visited.insert(edge.source.clone());
                                        collected_nodes
                                            .insert(edge.source.clone(), source_node.clone());
                                        queue.push_back((edge.source.clone(), curr_depth + 1));
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        Ok(NeighborhoodResponse {
            root_id: root.clone(),
            depth,
            nodes: collected_nodes.into_values().collect(),
            edges: collected_edges.into_values().collect(),
        })
    }

    fn get_universe_tiles(
        &self,
        tenant_id: &str,
        org_id: &str,
        _level: u32,
    ) -> Result<UniverseTileResponse> {
        let nodes = self.list_nodes(tenant_id)?;
        let edges = self.list_edges(tenant_id)?;

        // Filter repos / components for spatial clustering
        let mut spatial_nodes = Vec::new();
        let total = nodes.len().max(1);

        // Fibonacci sphere projection algorithm for deterministic 3D sphere layout
        let sphere_radius = 50.0f32;
        let phi = std::f32::consts::PI * (3.0 - (5.0f32).sqrt()); // golden angle

        for (idx, node) in nodes.iter().enumerate() {
            let y = 1.0 - (idx as f32 / (total as f32 - 1.0).max(1.0)) * 2.0; // from 1 to -1
            let radius_at_y = (1.0 - y * y).max(0.0).sqrt();
            let theta = phi * idx as f32;

            let x = theta.cos() * radius_at_y;
            let z = theta.sin() * radius_at_y;

            let (color_hint, base_radius, min_level) = match node.kind {
                NodeKind::Organization => ("#f59e0b", 5.5, 0),
                NodeKind::Repository => ("#3b82f6", 4.2, 0),
                NodeKind::TrustBoundary => ("#f43f5e", 4.0, 0),
                NodeKind::AIAgent => ("#ec4899", 3.8, 0),
                NodeKind::Service => ("#10b981", 3.2, 1),
                NodeKind::Package => ("#059669", 3.0, 1),
                NodeKind::DataStore | NodeKind::DataAsset => ("#0891b2", 3.6, 1),
                NodeKind::Endpoint => ("#8b5cf6", 2.8, 1),
                NodeKind::AIModel => ("#a855f7", 3.0, 1),
                NodeKind::Directory => ("#6366f1", 2.8, 2),
                NodeKind::File => ("#06b6d4", 2.4, 2),
                NodeKind::Control => ("#22c55e", 2.8, 2),
                NodeKind::Class => ("#818cf8", 2.2, 3),
                NodeKind::Function => ("#38bdf8", 2.0, 3),
                NodeKind::Dependency => ("#84cc16", 2.0, 3),
                NodeKind::Tool => ("#f97316", 2.5, 3),
                NodeKind::Finding => ("#ef4444", 3.2, 3),
                _ => ("#64748b", 2.0, 3),
            };

            let risk_level = if node.kind == NodeKind::Finding {
                "critical".to_string()
            } else if node.kind == NodeKind::AIAgent || node.qualified_name.contains("billing") {
                "high".to_string()
            } else if node.kind == NodeKind::Control {
                "low".to_string()
            } else {
                "medium".to_string()
            };

            spatial_nodes.push(UniverseNodeSpatial {
                id: node.id.clone(),
                name: node.display_name.clone(),
                kind: node.kind,
                cluster_group: node.canonical_source.clone(),
                x: x * sphere_radius,
                y: y * sphere_radius,
                z: z * sphere_radius,
                radius: base_radius,
                color_hint: color_hint.to_string(),
                claim_state: node.claim_state,
                risk_level,
                metrics: serde_json::json!({
                    "evidence_count": node.evidence_ids.len(),
                    "confidence": node.confidence,
                    "min_level": min_level,
                }),
            });
        }

        let spatial_edges = edges
            .iter()
            .map(|e| UniverseEdgeSpatial {
                id: e.id.clone(),
                source: e.source.clone(),
                target: e.target.clone(),
                kind: e.kind.to_string(),
                claim_state: e.claim_state,
                confidence: e.confidence,
            })
            .collect();

        Ok(UniverseTileResponse {
            org_id: org_id.to_string(),
            org_name: "Synthetic Security Organization".to_string(),
            level: _level,
            nodes: spatial_nodes,
            edges: spatial_edges,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use osakg_core::ClaimState;

    #[test]
    fn test_in_memory_graph_store_neighborhood() {
        let store = InMemoryGraphStore::new();
        let node_a = GraphNode::new(
            "tenant-1",
            NodeKind::Repository,
            "local",
            "repo-auth",
            "repo-auth",
            "v1",
            ClaimState::Observed,
            1.0,
            vec!["ev-1".into()],
            serde_json::json!({}),
        );
        let node_b = GraphNode::new(
            "tenant-1",
            NodeKind::Repository,
            "local",
            "repo-billing",
            "repo-billing",
            "v1",
            ClaimState::Observed,
            1.0,
            vec!["ev-2".into()],
            serde_json::json!({}),
        );
        let edge = GraphEdge::new(
            "tenant-1",
            osakg_core::EdgeKind::Calls,
            node_b.id.clone(),
            node_a.id.clone(),
            ClaimState::Inferred,
            0.85,
            vec!["ev-3".into()],
            serde_json::json!({}),
        );

        store.upsert_node(node_a.clone()).unwrap();
        store.upsert_node(node_b.clone()).unwrap();
        store.upsert_edge(edge).unwrap();

        let nb = store
            .get_neighborhood("tenant-1", &node_b.id, 1, 10)
            .unwrap();
        assert_eq!(nb.nodes.len(), 2);
        assert_eq!(nb.edges.len(), 1);
    }
}
