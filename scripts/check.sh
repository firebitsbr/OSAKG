#!/usr/bin/env bash
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

