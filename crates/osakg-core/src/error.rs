// =====================================================================
// Author: Mauro Risonho de Paula Assumpção
// Create: 2026-10-18
// Update: 2026-10-23
// Short Description: Unified error types and result aliases for OSAKG crates
// License: MIT
// =====================================================================

use thiserror::Error;

#[derive(Error, Debug)]
pub enum OsakgError {
    #[error("Scope authorization violation: {0}")]
    ScopeViolation(String),

    #[error("Invalid claim state transition: {0}")]
    InvalidClaimTransition(String),

    #[error("Graph validation error: {0}")]
    ValidationError(String),

    #[error("Storage error: {0}")]
    StorageError(String),

    #[error("Serialization error: {0}")]
    SerializationError(#[from] serde_json::Error),
}

pub type Result<T> = std::result::Result<T, OsakgError>;
