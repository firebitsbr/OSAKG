#!/usr/bin/env bash
# =====================================================================
# Author: Mauro Risonho de Paula Assumpção
# Create: 2026-10-18
# Update: 2026-10-23
# Short Description: Comprehensive verification script executing format, lint, test, and build suites
# License: MIT
# =====================================================================

set -euo pipefail

echo "=== [1/5] Cargo Format Check ==="
cargo fmt --check || (echo "Running cargo fmt..." && cargo fmt)

echo "=== [2/5] Cargo Clippy ==="
cargo clippy --workspace --all-targets -- -D warnings

echo "=== [3/5] Cargo Tests ==="
cargo test --workspace

echo "=== [4/5] Web Client Typecheck & Build ==="
npm --prefix apps/web run typecheck
npm --prefix apps/web run build

echo "=== [5/5] Web Client Tests ==="
npm --prefix apps/web run test

echo "=== All Milestone 0 verification checks passed! ==="

