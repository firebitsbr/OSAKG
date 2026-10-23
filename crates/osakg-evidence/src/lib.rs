// =====================================================================
// Author: Mauro Risonho de Paula Assumpção
// Create: 2026-10-18
// Update: 2026-10-23
// Short Description: Evidence recording, validation ledger, and confidence computation
// License: MIT
// =====================================================================

use chrono::Utc;
use osakg_core::{ClaimState, EvidenceRecord, OsakgError, Result};
use rusqlite::{params, Connection};
use std::sync::{Arc, Mutex};

#[derive(Clone)]
pub struct EvidenceStore {
    conn: Arc<Mutex<Connection>>,
}

impl EvidenceStore {
    pub fn in_memory() -> Result<Self> {
        let conn =
            Connection::open_in_memory().map_err(|e| OsakgError::StorageError(e.to_string()))?;
        let store = Self {
            conn: Arc::new(Mutex::new(conn)),
        };
        store.run_migrations()?;
        Ok(store)
    }

    pub fn open_file(path: &str) -> Result<Self> {
        let conn = Connection::open(path).map_err(|e| OsakgError::StorageError(e.to_string()))?;
        let store = Self {
            conn: Arc::new(Mutex::new(conn)),
        };
        store.run_migrations()?;
        Ok(store)
    }

    pub fn run_migrations(&self) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute_batch(
            "
            CREATE TABLE IF NOT EXISTS evidence (
                id TEXT PRIMARY KEY,
                tenant_id TEXT NOT NULL,
                source_repo TEXT NOT NULL,
                commit_sha TEXT NOT NULL,
                file_path TEXT,
                start_line INTEGER,
                end_line INTEGER,
                analyzer TEXT NOT NULL,
                analyzer_version TEXT NOT NULL,
                detected_at TEXT NOT NULL,
                claim_state TEXT NOT NULL,
                confidence REAL NOT NULL,
                evidence_ids TEXT NOT NULL,
                snippet TEXT,
                rationale TEXT
            );

            CREATE INDEX IF NOT EXISTS idx_evidence_tenant ON evidence (tenant_id);
            CREATE INDEX IF NOT EXISTS idx_evidence_repo ON evidence (tenant_id, source_repo);

            CREATE TABLE IF NOT EXISTS audit_log (
                id TEXT PRIMARY KEY,
                tenant_id TEXT NOT NULL,
                action TEXT NOT NULL,
                details TEXT NOT NULL,
                recorded_at TEXT NOT NULL
            );
            ",
        )
        .map_err(|e| OsakgError::StorageError(e.to_string()))?;
        Ok(())
    }

    pub fn insert_evidence(&self, ev: &EvidenceRecord) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        let evidence_ids_json = serde_json::to_string(&ev.evidence_ids)?;
        let claim_str = ev.claim_state.to_string();
        let detected_str = ev.detected_at.to_rfc3339();

        conn.execute(
            "INSERT OR REPLACE INTO evidence (
                id, tenant_id, source_repo, commit_sha, file_path, start_line, end_line,
                analyzer, analyzer_version, detected_at, claim_state, confidence, evidence_ids,
                snippet, rationale
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)",
            params![
                ev.id,
                ev.tenant_id,
                ev.source_repo,
                ev.commit_sha,
                ev.file_path,
                ev.start_line,
                ev.end_line,
                ev.analyzer,
                ev.analyzer_version,
                detected_str,
                claim_str,
                ev.confidence,
                evidence_ids_json,
                ev.snippet,
                ev.rationale,
            ],
        )
        .map_err(|e| OsakgError::StorageError(e.to_string()))?;

        Ok(())
    }

    pub fn get_evidence(&self, tenant_id: &str, id: &str) -> Result<Option<EvidenceRecord>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn
            .prepare(
                "SELECT id, tenant_id, source_repo, commit_sha, file_path, start_line, end_line,
                        analyzer, analyzer_version, detected_at, claim_state, confidence, evidence_ids,
                        snippet, rationale
                 FROM evidence
                 WHERE tenant_id = ?1 AND id = ?2",
            )
            .map_err(|e| OsakgError::StorageError(e.to_string()))?;

        let mut rows = stmt
            .query(params![tenant_id, id])
            .map_err(|e| OsakgError::StorageError(e.to_string()))?;

        if let Some(row) = rows
            .next()
            .map_err(|e| OsakgError::StorageError(e.to_string()))?
        {
            let id: String = row.get(0).unwrap();
            let tenant: String = row.get(1).unwrap();
            let repo: String = row.get(2).unwrap();
            let commit: String = row.get(3).unwrap();
            let file_path: Option<String> = row.get(4).unwrap();
            let start_line: Option<u32> = row.get(5).unwrap();
            let end_line: Option<u32> = row.get(6).unwrap();
            let analyzer: String = row.get(7).unwrap();
            let analyzer_version: String = row.get(8).unwrap();
            let detected_str: String = row.get(9).unwrap();
            let claim_str: String = row.get(10).unwrap();
            let confidence: f32 = row.get(11).unwrap();
            let evidence_ids_json: String = row.get(12).unwrap();
            let snippet: Option<String> = row.get(13).unwrap();
            let rationale: Option<String> = row.get(14).unwrap();

            let detected_at = chrono::DateTime::parse_from_rfc3339(&detected_str)
                .map(|dt| dt.with_timezone(&Utc))
                .unwrap_or_else(|_| Utc::now());

            let claim_state = match claim_str.as_str() {
                "observed" => ClaimState::Observed,
                "inferred" => ClaimState::Inferred,
                "validated" => ClaimState::Validated,
                "refuted" => ClaimState::Refuted,
                _ => ClaimState::Inferred,
            };

            let evidence_ids: Vec<String> =
                serde_json::from_str(&evidence_ids_json).unwrap_or_default();

            Ok(Some(EvidenceRecord {
                id,
                tenant_id: tenant,
                source_repo: repo,
                commit_sha: commit,
                file_path,
                start_line,
                end_line,
                analyzer,
                analyzer_version,
                detected_at,
                claim_state,
                confidence,
                evidence_ids,
                snippet,
                rationale,
            }))
        } else {
            Ok(None)
        }
    }

    pub fn log_audit(&self, tenant_id: &str, action: &str, details: &str) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        let id = format!("aud-{}", uuid::Uuid::new_v4());
        let recorded_at = Utc::now().to_rfc3339();

        conn.execute(
            "INSERT INTO audit_log (id, tenant_id, action, details, recorded_at) VALUES (?1, ?2, ?3, ?4, ?5)",
            params![id, tenant_id, action, details, recorded_at],
        )
        .map_err(|e| OsakgError::StorageError(e.to_string()))?;

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_evidence_sqlite_store_and_tenant_isolation() {
        let store = EvidenceStore::in_memory().expect("in-memory db must initialize");
        let mut ev1 = EvidenceRecord::new_observed(
            "tenant-alpha",
            "repo-auth",
            "sha123",
            Some("src/index.ts".into()),
            Some(10),
            Some(20),
            "osakg-ast",
        );
        ev1.snippet = Some("function handleLogin()".into());

        store.insert_evidence(&ev1).unwrap();

        // Alpha tenant can see it
        let found = store.get_evidence("tenant-alpha", &ev1.id).unwrap();
        assert!(found.is_some());
        assert_eq!(
            found.unwrap().snippet,
            Some("function handleLogin()".into())
        );

        // Beta tenant cannot see alpha tenant's evidence (Tenant Isolation)
        let isolated = store.get_evidence("tenant-beta", &ev1.id).unwrap();
        assert!(isolated.is_none());
    }
}
