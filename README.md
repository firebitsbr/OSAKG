# OSAKG — Offensive Security Adversarial Knowledge Graph

An authorization-first, evidence-driven, multi-repository knowledge graph for code intelligence, attack-surface discovery, cross-repository dataflow, AI red teaming and interactive 3D exploration.

## Status
Architecture and implementation specification v0.1. This bundle is a **development harness**, not a finished application. All example vulnerabilities, graph paths and metrics are synthetic until validated.

## Development environment
- VS Code with OpenCode and Antigravity extensions.
- Rust stable workspace for API, ingestion, graph fusion, analysis and path reasoning.
- Tauri 2 desktop shell with React/TypeScript + Three.js UI.
- FalkorDB graph storage; SQLite evidence metadata.
- Optional external scanners: Joern, Opengrep, OSV-Scanner, with adapters and version pinning.

## Quickstart & Execution

### 1. Comandos Rápidos com Make
O projeto inclui um [`Makefile`](file:///home/test/Downloads/Github/Grafos/Makefile) completo:
```bash
make help          # Exibe todos os comandos disponíveis
make check         # Executa a suíte completa de validação (fmt, clippy, testes e build)
make test          # Executa todos os testes (Rust e frontend)
make dev-web       # Inicia o visualizador 3D (Vite) em http://localhost:5173
make dev-server    # Inicia o servidor HTTP Axum em http://127.0.0.1:3030
make dev-desktop   # Inicia a aplicação Desktop Tauri 2
make build         # Compila backend e bundle do frontend
make clean         # Limpa arquivos de build
```

### 2. Verification Suite Manual
```bash
./scripts/check.sh
```

### 2. Standalone Web Client (Interactive 3D Universe)
```bash
npm --prefix apps/web run dev
```
Navigate to `http://localhost:5173`. Works offline with rich synthetic fixtures and simulated 3D universe.

### 3. Backend HTTP API Server (Axum)
```bash
cargo run --bin osakg-server
```
Runs at `http://127.0.0.1:3030`. Conforms to `API_CONTRACT.md`.

### 4. Tauri 2 Desktop Shell
```bash
npm run desktop:dev
# or for release build
npm run desktop:build
```

## Core invariant
A graph connection is not proof of exploitability. Every security claim must have provenance, confidence, preconditions and validation state.

## Project map
See `ROADMAP.md`, `GRAPH_SCHEMA.md`, `UNIVERSE_3D.md`, `SECURITY.md`, `TESTING.md`, `AI_REDTEAM.md`, `DATA_SOURCES.md`, `API_CONTRACT.md`, `DECISIONS.md`, `TASKS.md` and `PROMPTS/`.
