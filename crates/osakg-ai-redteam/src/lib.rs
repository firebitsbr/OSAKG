use osakg_core::Result;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct AIAgentRiskEvaluation {
    pub agent_id: String,
    pub has_unbounded_tool_execution: bool,
    pub reaches_sensitive_data: bool,
    pub cross_boundary_calls: Vec<String>,
}

pub struct AIRedTeamAnalyzer;

impl AIRedTeamAnalyzer {
    pub fn evaluate_agent(manifest: &serde_json::Value) -> Result<AIAgentRiskEvaluation> {
        let agent_id = manifest
            .get("agent_id")
            .and_then(|v| v.as_str())
            .unwrap_or("unknown")
            .to_string();

        let mut cross_boundary_calls = Vec::new();
        let mut reaches_sensitive = false;

        if let Some(tools) = manifest.get("tools").and_then(|t| t.as_array()) {
            for tool in tools {
                if let Some(tb) = tool.get("trust_boundary").and_then(|b| b.as_str()) {
                    cross_boundary_calls.push(tb.to_string());
                }
                if let Some(ds) = tool.get("target_datastore").and_then(|d| d.as_str()) {
                    if ds.contains("Database") || ds.contains("Billing") {
                        reaches_sensitive = true;
                    }
                }
            }
        }

        Ok(AIAgentRiskEvaluation {
            agent_id,
            has_unbounded_tool_execution: cross_boundary_calls.len() > 1,
            reaches_sensitive_data: reaches_sensitive,
            cross_boundary_calls,
        })
    }
}
