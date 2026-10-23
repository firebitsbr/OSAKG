use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ClaimState {
    Observed,
    Inferred,
    Validated,
    Refuted,
}

impl std::fmt::Display for ClaimState {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ClaimState::Observed => write!(f, "observed"),
            ClaimState::Inferred => write!(f, "inferred"),
            ClaimState::Validated => write!(f, "validated"),
            ClaimState::Refuted => write!(f, "refuted"),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct EvidenceRecord {
    pub id: String,
    pub tenant_id: String,
    pub source_repo: String,
    pub commit_sha: String,
    pub file_path: Option<String>,
    pub start_line: Option<u32>,
    pub end_line: Option<u32>,
    pub analyzer: String,
    pub analyzer_version: String,
    pub detected_at: DateTime<Utc>,
    pub claim_state: ClaimState,
    pub confidence: f32,
    pub evidence_ids: Vec<String>,
    pub snippet: Option<String>,
    pub rationale: Option<String>,
}

impl EvidenceRecord {
    pub fn new_observed(
        tenant_id: impl Into<String>,
        source_repo: impl Into<String>,
        commit_sha: impl Into<String>,
        file_path: Option<String>,
        start_line: Option<u32>,
        end_line: Option<u32>,
        analyzer: impl Into<String>,
    ) -> Self {
        let tenant = tenant_id.into();
        let repo = source_repo.into();
        let commit = commit_sha.into();
        let id = format!("ev-{}", uuid::Uuid::new_v4());
        Self {
            id,
            tenant_id: tenant,
            source_repo: repo,
            commit_sha: commit,
            file_path,
            start_line,
            end_line,
            analyzer: analyzer.into(),
            analyzer_version: "0.1.0".to_string(),
            detected_at: Utc::now(),
            claim_state: ClaimState::Observed,
            confidence: 1.0,
            evidence_ids: Vec::new(),
            snippet: None,
            rationale: None,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_evidence_creation() {
        let ev = EvidenceRecord::new_observed(
            "tenant-1",
            "repo-auth",
            "abc1234",
            Some("src/index.ts".into()),
            Some(1),
            Some(10),
            "osakg-ingest",
        );
        assert_eq!(ev.claim_state, ClaimState::Observed);
        assert_eq!(ev.confidence, 1.0);
        assert!(ev.id.starts_with("ev-"));
    }
}
