// =====================================================================
// Author: Mauro Risonho de Paula Assumpção
// Create: 2026-10-18
// Update: 2026-10-23
// Short Description: Scanner adapter abstractions and output normalization parsers
// License: MIT
// =====================================================================

pub struct OpengrepAdapter;
pub struct OsvScannerAdapter;
pub struct JoernAdapter;

impl OpengrepAdapter {
    pub fn is_available() -> bool {
        false
    }
}

impl OsvScannerAdapter {
    pub fn is_available() -> bool {
        false
    }
}

impl JoernAdapter {
    pub fn is_available() -> bool {
        false
    }
}
