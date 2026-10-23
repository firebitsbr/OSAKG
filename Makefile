# =====================================================================
# Author: Mauro Risonho de Paula Assumpção
# Create: 2026-10-18
# Update: 2026-10-23
# Short Description: Top-level orchestration Makefile for building, testing, linting, and running OSAKG
# License: MIT
# =====================================================================

# ==============================================================================
# OSAKG — Offensive Security Knowledge Graph Makefile
# ==============================================================================
SHELL := /bin/bash
.DEFAULT_GOAL := help

# Colors for terminal output
CYAN   := \033[36m
GREEN  := \033[32m
YELLOW := \033[33m
RED    := \033[31m
RESET  := \033[0m

.PHONY: help install check fmt fmt-check lint test test-backend test-frontend \
        build build-release dev-web dev-server dev-desktop build-desktop clean fixtures-test

help: ## Exibe esta lista de comandos disponíveis
	@echo -e "$(CYAN)OSAKG — Comandos de Desenvolvimento e Automação$(RESET)"
	@echo -e "Uso: make $(YELLOW)<alvo>$(RESET)\n"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-18s$(RESET) %s\n", $$1, $$2}'

# ------------------------------------------------------------------------------
# Dependências e Configuração
# ------------------------------------------------------------------------------
install: ## Instala dependências do frontend (apps/web)
	@echo -e "$(CYAN)[*] Instalando dependências npm...$(RESET)"
	npm --prefix apps/web install

# ------------------------------------------------------------------------------
# Formatação e Análise Estática (Linting)
# ------------------------------------------------------------------------------
fmt: ## Aplica a formatação em todo o código Rust
	@echo -e "$(CYAN)[*] Formatando código Rust (cargo fmt)...$(RESET)"
	cargo fmt

fmt-check: ## Verifica a formatação do código Rust sem alterar arquivos
	@echo -e "$(CYAN)[*] Verificando formatação Rust...$(RESET)"
	cargo fmt --check

lint: ## Executa clippy no workspace Rust e linter no frontend
	@echo -e "$(CYAN)[*] Executando cargo clippy...$(RESET)"
	cargo clippy --workspace --all-targets -- -D warnings
	@echo -e "$(CYAN)[*] Executando typecheck no frontend...$(RESET)"
	npm --prefix apps/web run typecheck

# ------------------------------------------------------------------------------
# Testes
# ------------------------------------------------------------------------------
test: test-backend test-frontend ## Executa todos os testes (backend e frontend)

test-backend: ## Executa os testes unitários e de integração Rust
	@echo -e "$(CYAN)[*] Executando testes Rust no workspace...$(RESET)"
	cargo test --workspace

test-frontend: ## Executa testes do frontend
	@echo -e "$(CYAN)[*] Executando testes no frontend...$(RESET)"
	npm --prefix apps/web run test

fixtures-test: ## Valida o pipeline de ingestão nas fixtures sintéticas
	@echo -e "$(CYAN)[*] Validando ingestão de fixtures sintéticas...$(RESET)"
	cargo test -p osakg-ingest test_ingest_synthetic_org_fixture -- --nocapture

# ------------------------------------------------------------------------------
# Verificação Completa de Qualidade (CI / Harness)
# ------------------------------------------------------------------------------
check: ## Executa a suíte completa de verificação (fmt, clippy, testes e build)
	@echo -e "$(GREEN)[*] Iniciando suíte unificada de validação...$(RESET)"
	./scripts/check.sh

# ------------------------------------------------------------------------------
# Compilação e Build
# ------------------------------------------------------------------------------
build: ## Compila o workspace Rust (debug) e o bundle do frontend
	@echo -e "$(CYAN)[*] Compilando workspace Rust...$(RESET)"
	cargo build --workspace
	@echo -e "$(CYAN)[*] Construindo bundle do frontend (Vite)...$(RESET)"
	npm --prefix apps/web run build

build-release: ## Compila o backend e frontend com otimizações de produção
	@echo -e "$(CYAN)[*] Compilando workspace Rust em modo release...$(RESET)"
	cargo build --workspace --release
	@echo -e "$(CYAN)[*] Construindo bundle do frontend para produção...$(RESET)"
	npm --prefix apps/web run build

build-desktop: build ## Constrói o pacote executável do Desktop Tauri 2
	@echo -e "$(CYAN)[*] Compilando pacote Desktop Tauri 2...$(RESET)"
	npm run desktop:build

# ------------------------------------------------------------------------------
# Execução e Servidores de Desenvolvimento
# ------------------------------------------------------------------------------
dev: dev-web ## Inicia a aplicação web completa imediatamente (Three.js 3D)

run: dev-web ## Atalho para make dev

generate: ## Regenera o universo massivo de 1.600+ nós com AST e Attack Paths
	@echo -e "$(CYAN)[*] Gerando grafo de nós profundo (AST + Kill Chains)...$(RESET)"
	python3 scripts/generate_deep_universe.py

dev-web: ## Inicia o servidor de desenvolvimento do frontend (Three.js 3D)
	@echo -e "$(GREEN)[*] Iniciando cliente web em http://localhost:5173...$(RESET)"
	npm --prefix apps/web run dev

dev-server: ## Inicia o servidor de API HTTP Axum localmente na porta 3030
	@echo -e "$(GREEN)[*] Iniciando servidor de API em http://127.0.0.1:3030...$(RESET)"
	cargo run --bin osakg-server

dev-desktop: ## Inicia o shell desktop Tauri 2 em modo de desenvolvimento
	@echo -e "$(GREEN)[*] Iniciando desktop shell Tauri 2...$(RESET)"
	npm run desktop:dev

# ------------------------------------------------------------------------------
# Limpeza
# ------------------------------------------------------------------------------
clean: ## Remove arquivos gerados de build (target/ e dist/)
	@echo -e "$(YELLOW)[*] Limpando artefatos de build...$(RESET)"
	cargo clean
	rm -rf apps/web/dist
	@echo -e "$(GREEN)[+] Limpeza concluída.$(RESET)"

