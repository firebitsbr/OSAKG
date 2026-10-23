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
