// =====================================================================
// Author: Mauro Risonho de Paula Assumpção
// Create: 2026-10-18
// Update: 2026-10-23
// Short Description: OSAKG core domain library root aggregating models and traits
// License: MIT
// =====================================================================

pub mod dto;
pub mod edge;
pub mod error;
pub mod evidence;
pub mod id;
pub mod node;
pub mod scope;

pub use dto::*;
pub use edge::{EdgeKind, GraphEdge};
pub use error::{OsakgError, Result};
pub use evidence::{ClaimState, EvidenceRecord};
pub use id::NodeId;
pub use node::{GraphNode, NodeKind};
pub use scope::{AnalysisMode, ScopeRecord};
