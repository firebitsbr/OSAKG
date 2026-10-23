use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, Default)]
#[serde(rename_all = "snake_case")]
pub enum AnalysisMode {
    #[default]
    Fixture,
    Passive,
    Validation,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ScopeRecord {
    pub id: String,
    pub tenant_id: String,
    pub org_name: String,
    pub mode: AnalysisMode,
    pub authorizer: String,
    pub approved_repos: Vec<String>,
    pub allowed_data_classes: Vec<String>,
    pub allowed_analysis_types: Vec<String>,
    pub created_at: DateTime<Utc>,
    pub expires_at: Option<DateTime<Utc>>,
}

impl ScopeRecord {
    pub fn new_fixture(tenant_id: impl Into<String>, org_name: impl Into<String>) -> Self {
        Self {
            id: format!("scope-{}", uuid::Uuid::new_v4()),
            tenant_id: tenant_id.into(),
            org_name: org_name.into(),
            mode: AnalysisMode::Fixture,
            authorizer: "local-synthetic-fixture".to_string(),
            approved_repos: vec![
                "repo-auth".to_string(),
                "repo-billing".to_string(),
                "repo-ai-agent".to_string(),
            ],
            allowed_data_classes: vec!["synthetic-ast".to_string(), "synthetic-spec".to_string()],
            allowed_analysis_types: vec!["passive-code-graph".to_string()],
            created_at: Utc::now(),
            expires_at: None,
        }
    }

    pub fn new_passive(
        tenant_id: impl Into<String>,
        org_name: impl Into<String>,
        authorizer: impl Into<String>,
        approved_repos: Vec<String>,
    ) -> Self {
        Self {
            id: format!("scope-{}", uuid::Uuid::new_v4()),
            tenant_id: tenant_id.into(),
            org_name: org_name.into(),
            mode: AnalysisMode::Passive,
            authorizer: authorizer.into(),
            approved_repos,
            allowed_data_classes: vec!["public-ast".to_string(), "metadata".to_string()],
            allowed_analysis_types: vec!["passive-code-graph".to_string()],
            created_at: Utc::now(),
            expires_at: None,
        }
    }

    pub fn is_repo_allowed(&self, repo_name: &str) -> bool {
        self.approved_repos
            .iter()
            .any(|r| r == "*" || r == repo_name)
    }
}
