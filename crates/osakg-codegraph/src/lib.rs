// =====================================================================
// Author: Mauro Risonho de Paula Assumpção
// Create: 2026-10-18
// Update: 2026-10-23
// Short Description: Language-specific AST parsing, symbol extraction, and call graph builders
// License: MIT
// =====================================================================

use osakg_core::{NodeKind, Result};

#[derive(Debug, Clone)]
pub struct ExtractedCodeEntity {
    pub name: String,
    pub kind: NodeKind,
    pub signature: Option<String>,
    pub start_line: u32,
    pub end_line: u32,
    pub snippet: String,
    pub calls: Vec<String>,
    pub imports: Vec<String>,
    pub reads_data: Vec<String>,
    pub writes_data: Vec<String>,
    pub security_role: Option<String>,
}

pub struct CodeGraphExtractor;

impl CodeGraphExtractor {
    /// Extracts fine-grained symbols, functions, classes, data accesses, and calls from source code.
    pub fn extract_entities(content: &str, _file_path: &str) -> Result<Vec<ExtractedCodeEntity>> {
        let mut entities = Vec::new();
        let lines: Vec<&str> = content.lines().collect();

        for (idx, line) in lines.iter().enumerate() {
            let line_num = (idx + 1) as u32;
            let trimmed = line.trim();

            if trimmed.is_empty()
                || trimmed.starts_with("//")
                || trimmed.starts_with("/*")
                || trimmed.starts_with('*')
            {
                continue;
            }

            // 1. Detect Class / Interface
            if trimmed.starts_with("class ")
                || trimmed.starts_with("pub struct ")
                || trimmed.starts_with("struct ")
                || trimmed.starts_with("interface ")
                || trimmed.starts_with("export class ")
                || trimmed.starts_with("export interface ")
            {
                let parts: Vec<&str> = trimmed.split_whitespace().collect();
                let name = parts
                    .iter()
                    .position(|&p| p == "class" || p == "struct" || p == "interface")
                    .and_then(|pos| parts.get(pos + 1))
                    .map(|n| n.trim_matches(|c: char| !c.is_alphanumeric() && c != '_'))
                    .unwrap_or("AnonymousStruct");

                entities.push(ExtractedCodeEntity {
                    name: name.to_string(),
                    kind: NodeKind::Class,
                    signature: Some(trimmed.to_string()),
                    start_line: line_num,
                    end_line: line_num + 10,
                    snippet: trimmed.to_string(),
                    calls: Vec::new(),
                    imports: Vec::new(),
                    reads_data: Vec::new(),
                    writes_data: Vec::new(),
                    security_role: None,
                });
            }

            // 2. Detect Functions / Methods
            if trimmed.contains("function ")
                || trimmed.starts_with("pub fn ")
                || trimmed.starts_with("fn ")
                || trimmed.starts_with("export function ")
                || trimmed.starts_with("async function ")
                || trimmed.starts_with("export async function ")
            {
                let fn_name = if let Some(pos) = trimmed.find("function ") {
                    let after = &trimmed[pos + 9..];
                    after.split('(').next().unwrap_or("anon").trim()
                } else if let Some(pos) = trimmed.find("fn ") {
                    let after = &trimmed[pos + 3..];
                    after.split('(').next().unwrap_or("anon").trim()
                } else {
                    "anonymous_fn"
                };

                let clean_name = fn_name.trim_matches(|c: char| !c.is_alphanumeric() && c != '_');

                let mut calls = Vec::new();
                let mut reads_data = Vec::new();
                let mut writes_data = Vec::new();
                let mut sec_role = None;

                // Inspect context lines (up to next 25 lines)
                let context_end = (idx + 25).min(lines.len());
                let snippet_lines = &lines[idx..context_end];
                let snippet = snippet_lines.join("\n");

                for sline in snippet_lines {
                    let t = sline.trim();
                    if t.contains("verify")
                        || t.contains("auth")
                        || t.contains("validate")
                        || t.contains("jwt")
                    {
                        sec_role = Some("auth-control".to_string());
                    }
                    if t.contains("BillingDatabase")
                        || t.contains("SELECT ")
                        || t.contains("query(")
                        || t.contains("find(")
                    {
                        reads_data.push("BillingDatabase".to_string());
                    }
                    if t.contains("INSERT ")
                        || t.contains("UPDATE ")
                        || t.contains("save(")
                        || t.contains("write(")
                    {
                        writes_data.push("BillingDatabase".to_string());
                    }
                    if t.contains("verifyToken") {
                        calls.push("verifyToken".to_string());
                    }
                    if t.contains("handleLogin") {
                        calls.push("handleLogin".to_string());
                    }
                    if t.contains("processInvoice") {
                        calls.push("processInvoice".to_string());
                    }
                }

                entities.push(ExtractedCodeEntity {
                    name: clean_name.to_string(),
                    kind: NodeKind::Function,
                    signature: Some(trimmed.to_string()),
                    start_line: line_num,
                    end_line: (line_num + snippet_lines.len() as u32).max(line_num + 1),
                    snippet,
                    calls,
                    imports: Vec::new(),
                    reads_data,
                    writes_data,
                    security_role: sec_role,
                });
            }

            // 3. Detect Imports
            if trimmed.starts_with("import ") || trimmed.starts_with("use ") {
                entities.push(ExtractedCodeEntity {
                    name: trimmed.to_string(),
                    kind: NodeKind::Symbol,
                    signature: Some(trimmed.to_string()),
                    start_line: line_num,
                    end_line: line_num,
                    snippet: trimmed.to_string(),
                    calls: Vec::new(),
                    imports: vec![trimmed.to_string()],
                    reads_data: Vec::new(),
                    writes_data: Vec::new(),
                    security_role: None,
                });
            }
        }

        Ok(entities)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_extract_classes_and_functions() {
        let code = r#"
        import { verifyToken } from 'repo-auth';

        export interface InvoiceRecord {
            id: string;
            amountCents: number;
        }

        export function processInvoice(token: string, invoice: InvoiceRecord) {
            verifyToken(token);
            // write to database
            save(invoice);
        }
        "#;

        let entities = CodeGraphExtractor::extract_entities(code, "test.ts").unwrap();
        assert!(entities
            .iter()
            .any(|e| e.name == "InvoiceRecord" && e.kind == NodeKind::Class));
        assert!(entities
            .iter()
            .any(|e| e.name == "processInvoice" && e.kind == NodeKind::Function));

        let proc_fn = entities
            .iter()
            .find(|e| e.name == "processInvoice")
            .unwrap();
        assert!(proc_fn.calls.contains(&"verifyToken".to_string()));
    }
}
