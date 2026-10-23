// =====================================================================
// Author: Mauro Risonho de Paula Assumpção
// Create: 2026-10-18
// Update: 2026-10-23
// Short Description: Deterministic identifier generation using SHA-256 for nodes and edges
// License: MIT
// =====================================================================

use sha2::{Digest, Sha256};
use std::fmt;

#[derive(Debug, Clone, PartialEq, Eq, Hash, serde::Serialize, serde::Deserialize)]
pub struct NodeId(String);

impl NodeId {
    pub fn new(
        tenant_id: &str,
        kind: &str,
        canonical_source: &str,
        qualified_name: &str,
        commit_or_snapshot: &str,
    ) -> Self {
        let mut hasher = Sha256::new();
        hasher.update(tenant_id.as_bytes());
        hasher.update(b"|");
        hasher.update(kind.as_bytes());
        hasher.update(b"|");
        hasher.update(canonical_source.as_bytes());
        hasher.update(b"|");
        hasher.update(qualified_name.as_bytes());
        hasher.update(b"|");
        hasher.update(commit_or_snapshot.as_bytes());
        let hash = format!("{:x}", hasher.finalize());
        NodeId(hash)
    }

    pub fn from_raw(raw: impl Into<String>) -> Self {
        NodeId(raw.into())
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl fmt::Display for NodeId {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_stable_node_id_is_deterministic() {
        let id1 = NodeId::new("tenant-a", "Repository", "local", "repo-auth", "v1.0.0");
        let id2 = NodeId::new("tenant-a", "Repository", "local", "repo-auth", "v1.0.0");
        let id3 = NodeId::new("tenant-b", "Repository", "local", "repo-auth", "v1.0.0");

        assert_eq!(id1, id2);
        assert_ne!(id1, id3);
        assert_eq!(id1.as_str().len(), 64);
    }
}
