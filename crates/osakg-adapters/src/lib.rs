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
