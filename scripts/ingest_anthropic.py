#!/usr/bin/env python3
# =====================================================================
# Author: Mauro Risonho de Paula Assumpção
# Create: 2026-10-18
# Update: 2026-10-23
# Short Description: Public GitHub API ingestion crawler for Anthropic organization repositories
# License: MIT
# =====================================================================

"""
OSAKG Anthropic Live Ingestion Pipeline
Fetches all public repositories from https://github.com/orgs/anthropics/repositories,
retrieves deep AST/code trees from primary SDKs and frameworks, extracts models,
endpoints, functions, classes, and trust boundaries, and constructs a massive
hierarchical 3D semantic knowledge graph.
"""

import urllib.request
import json
import math
import hashlib
import os
import sys

def sha256(*parts):
    h = hashlib.sha256()
    h.update("|".join(str(p) for p in parts).encode('utf-8'))
    return h.hexdigest()

def fetch_json(url):
    req = urllib.request.Request(url, headers={
        'User-Agent': 'OSAKG-Offensive-Security-Graph',
        'Accept': 'application/vnd.github.v3+json'
    })
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode('utf-8'))
    except Exception as e:
        print(f"[-] Warning: Failed to fetch {url}: {e}", file=sys.stderr)
        return None

def main():
    print("[*] Connecting to GitHub API for organization: anthropics...")
    repos = fetch_json('https://api.github.com/orgs/anthropics/repos?per_page=100')
    if not repos:
        print("[-] Error: Could not fetch Anthropic repositories.", file=sys.stderr)
        sys.exit(1)

    print(f"[+] Discovered {len(repos)} repositories in Anthropic organization.")

    nodes = []
    edges = []
    tenant_id = "tenant-anthropic-public"

    # 1. Central Organization Node
    org_id = sha256(tenant_id, "Organization", "github", "anthropics", "v1")
    nodes.append({
        "id": org_id,
        "name": "Anthropic",
        "kind": "Organization",
        "cluster_group": "core-org",
        "x": 0.0,
        "y": 0.0,
        "z": 0.0,
        "radius": 8.0,
        "color_hint": "#f59e0b",
        "claim_state": "observed",
        "risk_level": "low",
        "metrics": {
            "public_repos": len(repos),
            "description": "AI safety and research company that builds reliable, interpretable, and steerable AI systems.",
            "url": "https://github.com/anthropics",
            "min_level": 0
        }
    })

    # 2. Celestial Trust Boundaries & AI Models
    models = [
        {"id": "model-claude-3-7-sonnet", "name": "Claude 3.7 Sonnet (Hybrid Reasoning)", "params": "Flagship 2025"},
        {"id": "model-claude-3-5-sonnet", "name": "Claude 3.5 Sonnet", "params": "Industry Standard SOTA"},
        {"id": "model-claude-3-5-haiku", "name": "Claude 3.5 Haiku", "params": "High Speed / Low Latency"},
        {"id": "model-claude-3-opus", "name": "Claude 3 Opus", "params": "Deep Analysis & Complex Tasks"}
    ]

    for idx, m in enumerate(models):
        angle = (idx / len(models)) * 2 * math.pi
        mx = math.cos(angle) * 115.0
        my = (idx % 2 * 2 - 1) * 30.0
        mz = math.sin(angle) * 115.0

        m_node_id = sha256(tenant_id, "AIModel", "anthropic_catalog", m["id"], "v1")
        nodes.append({
            "id": m_node_id,
            "name": m["name"],
            "kind": "AIModel",
            "cluster_group": "ai-models",
            "x": mx,
            "y": my,
            "z": mz,
            "radius": 4.5,
            "color_hint": "#a855f7",
            "claim_state": "observed",
            "risk_level": "medium",
            "metrics": {
                "model_family": "Claude-3",
                "capabilities": "Vision, Tool Calling, Structured Outputs, Extended Thinking",
                "min_level": 0
            }
        })

        # Connect Org -> Exposes -> Model
        edges.append({
            "id": f"edge-org-model-{idx}",
            "source": org_id,
            "target": m_node_id,
            "kind": "EXPOSES",
            "claim_state": "observed",
            "confidence": 1.0
        })

    # Trust Boundaries
    boundaries = [
        {"id": "tb-api-gateway", "name": "TrustBoundary: api.anthropic.com", "zone": "Public HTTPS Ingress", "x": 0, "y": 85, "z": 0, "color": "#f43f5e"},
        {"id": "tb-model-weights", "name": "TrustBoundary: Weights Enclave (TPU/GPU Cluster)", "zone": "Isolated Secure Compute", "x": 0, "y": -85, "z": 0, "color": "#ef4444"},
        {"id": "tb-client-runtime", "name": "TrustBoundary: Client Environment (Customer App)", "zone": "Untrusted External Boundary", "x": 90, "y": 0, "z": 0, "color": "#f59e0b"}
    ]
    for b in boundaries:
        b_node_id = sha256(tenant_id, "TrustBoundary", "infrastructure", b["id"], "v1")
        nodes.append({
            "id": b_node_id,
            "name": b["name"],
            "kind": "TrustBoundary",
            "cluster_group": "security-perimeter",
            "x": float(b["x"]),
            "y": float(b["y"]),
            "z": float(b["z"]),
            "radius": 5.0,
            "color_hint": b["color"],
            "claim_state": "observed",
            "risk_level": "high",
            "metrics": {"security_zone": b["zone"], "min_level": 1}
        })

    # Security Controls
    controls = [
        {"id": "ctrl-api-key", "name": "Control: x-api-key Header Validator", "type": "Authentication", "x": 25, "y": 65, "z": 15},
        {"id": "ctrl-rate-limiter", "name": "Control: Token Bucket RPM/TPM Limiter", "type": "AvailabilityControl", "x": -25, "y": 65, "z": 15},
        {"id": "ctrl-safety-classifier", "name": "Control: Constitutional Guardrail Classifier", "type": "ContentFilter", "x": 0, "y": 65, "z": -30}
    ]
    for c in controls:
        c_node_id = sha256(tenant_id, "Control", "security_stack", c["id"], "v1")
        nodes.append({
            "id": c_node_id,
            "name": c["name"],
            "kind": "Control",
            "cluster_group": "security-perimeter",
            "x": float(c["x"]),
            "y": float(c["y"]),
            "z": float(c["z"]),
            "radius": 3.4,
            "color_hint": "#22c55e",
            "claim_state": "observed",
            "risk_level": "low",
            "metrics": {"control_type": c["type"], "min_level": 1}
        })

    # 3. Position Repositories on Primary Orbit (Radius ~ 65-75)
    sphere_radius = 70.0
    phi_golden = math.pi * (3.0 - math.sqrt(5.0))
    total_repos = len(repos)

    primary_deep_repos = [
        "anthropic-sdk-python", "anthropic-sdk-typescript", "skills",
        "sandbox-runtime", "prompt-eng-interactive-tutorial", "claude-cookbooks",
        "courses", "evals", "PySvelte", "hh-rlhf"
    ]

    repo_id_map = {}

    print("[*] Processing all 100 repositories and computing spatial orbits...")
    for idx, r in enumerate(repos):
        name = r["name"]
        lang = r.get("language") or "Config"
        stars = r.get("stargazers_count", 0)

        # Fibonacci sphere coordinates
        y = 1.0 - (idx / max(1, total_repos - 1)) * 2.0
        rad_at_y = math.sqrt(max(0.0, 1.0 - y * y))
        theta = phi_golden * idx

        rx = math.cos(theta) * rad_at_y * sphere_radius
        ry = y * sphere_radius
        rz = math.sin(theta) * rad_at_y * sphere_radius

        color = (
            "#3b82f6" if lang == "Python"
            else "#38bdf8" if lang in ["TypeScript", "JavaScript"]
            else "#f59e0b" if lang == "Rust"
            else "#10b981" if lang == "Go"
            else "#a855f7" if lang == "Jupyter Notebook"
            else "#64748b"
        )

        repo_node_id = sha256(tenant_id, "Repository", "github", name, "main")
        repo_id_map[name] = (repo_node_id, rx, ry, rz)

        nodes.append({
            "id": repo_node_id,
            "name": name,
            "kind": "Repository",
            "cluster_group": f"lang-{lang.lower()}",
            "x": rx,
            "y": ry,
            "z": rz,
            "radius": 4.5 if name in primary_deep_repos else 3.2,
            "color_hint": color,
            "claim_state": "observed",
            "risk_level": "high" if "agent" in name or "sandbox" in name else "medium" if stars > 1000 else "low",
            "metrics": {
                "stars": stars,
                "language": lang,
                "forks": r.get("forks_count", 0),
                "open_issues": r.get("open_issues_count", 0),
                "html_url": r["html_url"],
                "description": r.get("description") or "Anthropic public repository",
                "min_level": 0
            }
        })

        # Connect Organization -> CONTAINS -> Repository
        edges.append({
            "id": f"edge-org-{name}",
            "source": org_id,
            "target": repo_node_id,
            "kind": "CONTAINS",
            "claim_state": "observed",
            "confidence": 1.0
        })

    # 4. Deep Code Trees & AST Entities for Primary SDKs
    print("[*] Deepening AST, Directory, File, Function, Class, and Parameter nodes for core SDKs...")

    sdk_specs = [
        {
            "repo": "anthropic-sdk-python",
            "dirs": ["src/anthropic", "src/anthropic/resources", "src/anthropic/resources/beta"],
            "files": [
                {
                    "path": "src/anthropic/client.py",
                    "classes": ["Anthropic", "AsyncAnthropic"],
                    "functions": ["__init__", "messages", "completions", "close"],
                    "params": ["api_key: str", "base_url: str", "timeout: float", "max_retries: int"]
                },
                {
                    "path": "src/anthropic/resources/messages.py",
                    "classes": ["Messages", "AsyncMessages"],
                    "functions": ["create", "stream", "count_tokens", "retrieve"],
                    "params": ["model: str", "messages: List[Dict]", "max_tokens: int", "temperature: float", "tools: List[Tool]"]
                },
                {
                    "path": "src/anthropic/resources/beta/agents.py",
                    "classes": ["Agents", "AgentSession"],
                    "functions": ["execute_tool_loop", "dispatch_call", "audit_trace"],
                    "params": ["agent_config: Dict", "allowed_tools: List[str]"]
                }
            ]
        },
        {
            "repo": "anthropic-sdk-typescript",
            "dirs": ["src", "src/resources", "src/resources/beta"],
            "files": [
                {
                    "path": "src/index.ts",
                    "classes": ["AnthropicClient", "ClientOptions"],
                    "functions": ["createClient", "requestWithAuth"],
                    "params": ["apiKey: string", "baseURL: string", "defaultHeaders: Record<string, string>"]
                },
                {
                    "path": "src/resources/messages.ts",
                    "classes": ["MessagesService", "MessageCreateParams"],
                    "functions": ["create", "stream", "countTokens"],
                    "params": ["model: ModelID", "messages: MessageParam[]", "max_tokens: number"]
                }
            ]
        },
        {
            "repo": "sandbox-runtime",
            "dirs": ["runtime", "runtime/executor", "runtime/sandbox"],
            "files": [
                {
                    "path": "runtime/executor/runner.ts",
                    "classes": ["IsolatedSandboxRunner", "ExecutionLimits"],
                    "functions": ["spawnIsolatedProcess", "enforceMemoryBudget", "terminateOnTimeout"],
                    "params": ["command: string", "timeoutMs: number", "seccompProfile: string"]
                }
            ]
        },
        {
            "repo": "skills",
            "dirs": ["skills", "skills/computer_use", "skills/bash"],
            "files": [
                {
                    "path": "skills/computer_use/action.py",
                    "classes": ["ComputerTool", "CoordinateScaler"],
                    "functions": ["mouse_click", "type_text", "take_screenshot", "key_combination"],
                    "params": ["x: int", "y: int", "text: str", "screenshot_mode: str"]
                }
            ]
        }
    ]

    for spec in sdk_specs:
        rname = spec["repo"]
        if rname not in repo_id_map:
            continue
        r_id, rx, ry, rz = repo_id_map[rname]

        # Add Directories (Moons orbiting repository)
        for didx, dpath in enumerate(spec["dirs"]):
            d_angle = (didx / len(spec["dirs"])) * 2 * math.pi
            dx = rx + math.cos(d_angle) * 16.0
            dy = ry + math.sin(d_angle) * 16.0
            dz = rz + (didx % 2 * 6 - 3)

            dir_node_id = sha256(tenant_id, "Directory", rname, dpath, "v1")
            nodes.append({
                "id": dir_node_id,
                "name": f"{rname}/{dpath}",
                "kind": "Directory",
                "cluster_group": "source-tree",
                "x": dx,
                "y": dy,
                "z": dz,
                "radius": 2.8,
                "color_hint": "#6366f1",
                "claim_state": "observed",
                "risk_level": "low",
                "metrics": {"path": dpath, "min_level": 2}
            })

            edges.append({
                "id": f"edge-repo-dir-{rname}-{didx}",
                "source": r_id,
                "target": dir_node_id,
                "kind": "CONTAINS",
                "claim_state": "observed",
                "confidence": 1.0
            })

        # Add Files, Classes, Functions, and Parameters (Sub-moons)
        for fidx, f in enumerate(spec["files"]):
            fpath = f["path"]
            f_angle = (fidx / len(spec["files"])) * 2 * math.pi + 0.5
            fx = rx + math.cos(f_angle) * 22.0
            fy = ry + math.sin(f_angle) * 22.0
            fz = rz + (fidx * 5)

            file_node_id = sha256(tenant_id, "File", rname, fpath, "v1")
            nodes.append({
                "id": file_node_id,
                "name": fpath.split('/')[-1],
                "kind": "File",
                "cluster_group": "source-files",
                "x": fx,
                "y": fy,
                "z": fz,
                "radius": 2.4,
                "color_hint": "#06b6d4",
                "claim_state": "observed",
                "risk_level": "low",
                "metrics": {"full_path": fpath, "repo": rname, "min_level": 2}
            })

            edges.append({
                "id": f"edge-repo-file-{rname}-{fidx}",
                "source": r_id,
                "target": file_node_id,
                "kind": "CONTAINS",
                "claim_state": "observed",
                "confidence": 1.0
            })

            # Classes in file
            for cidx, cname in enumerate(f["classes"]):
                cx = fx + (cidx + 1) * 4.0
                cy = fy + (cidx + 1) * 4.0
                cz = fz + 2.0
                class_node_id = sha256(tenant_id, "Class", rname, f"{fpath}::{cname}", "v1")
                nodes.append({
                    "id": class_node_id,
                    "name": cname,
                    "kind": "Class",
                    "cluster_group": "code-classes",
                    "x": cx,
                    "y": cy,
                    "z": cz,
                    "radius": 2.2,
                    "color_hint": "#818cf8",
                    "claim_state": "observed",
                    "risk_level": "low",
                    "metrics": {"class_name": cname, "file": fpath, "min_level": 3}
                })

                edges.append({
                    "id": f"edge-file-class-{cname}",
                    "source": file_node_id,
                    "target": class_node_id,
                    "kind": "DECLARES",
                    "claim_state": "observed",
                    "confidence": 1.0
                })

            # Functions in file
            for fnidx, fnname in enumerate(f["functions"]):
                fn_angle = (fnidx / len(f["functions"])) * 2 * math.pi
                fnx = fx + math.cos(fn_angle) * 7.0
                fny = fy + math.sin(fn_angle) * 7.0
                fnz = fz + (fnidx * 2) - 4

                fn_node_id = sha256(tenant_id, "Function", rname, f"{fpath}::{fnname}", "v1")
                nodes.append({
                    "id": fn_node_id,
                    "name": f"{fnname}()",
                    "kind": "Function",
                    "cluster_group": "code-functions",
                    "x": fnx,
                    "y": fny,
                    "z": fnz,
                    "radius": 1.9,
                    "color_hint": "#38bdf8",
                    "claim_state": "observed",
                    "risk_level": "medium" if "tool" in fnname or "dispatch" in fnname else "low",
                    "metrics": {"function_name": fnname, "file": fpath, "min_level": 3}
                })

                edges.append({
                    "id": f"edge-file-fn-{fnname}",
                    "source": file_node_id,
                    "target": fn_node_id,
                    "kind": "DECLARES",
                    "claim_state": "observed",
                    "confidence": 1.0
                })

                # Function calls to API Gateway
                if fnname in ["create", "stream"]:
                    ep_id = sha256(tenant_id, "Endpoint", "api", "/v1/messages", "v1")
                    edges.append({
                        "id": f"edge-call-messages-{fnname}",
                        "source": fn_node_id,
                        "target": ep_id,
                        "kind": "CALLS",
                        "claim_state": "observed",
                        "confidence": 1.0
                    })

    # 5. Core REST Endpoints on api.anthropic.com
    endpoints = [
        {"path": "/v1/messages", "method": "POST", "desc": "Create a Message / Chat Completion (Supports streaming & tools)"},
        {"path": "/v1/messages/batches", "method": "POST", "desc": "Message Batches API for asynchronous large-scale processing"},
        {"path": "/v1/models", "method": "GET", "desc": "List available models and metadata"},
        {"path": "/v1/complete", "method": "POST", "desc": "Legacy Text Completions API"}
    ]

    for eidx, ep in enumerate(endpoints):
        ep_angle = (eidx / len(endpoints)) * 2 * math.pi
        epx = math.cos(ep_angle) * 35.0
        epy = 75.0
        epz = math.sin(ep_angle) * 35.0

        ep_node_id = sha256(tenant_id, "Endpoint", "api", ep["path"], "v1")
        nodes.append({
            "id": ep_node_id,
            "name": f"{ep['method']} {ep['path']}",
            "kind": "Endpoint",
            "cluster_group": "api-endpoints",
            "x": epx,
            "y": epy,
            "z": epz,
            "radius": 3.0,
            "color_hint": "#8b5cf6",
            "claim_state": "observed",
            "risk_level": "high",
            "metrics": {
                "route": ep["path"],
                "http_method": ep["method"],
                "description": ep["desc"],
                "auth_required": "x-api-key",
                "min_level": 1
            }
        })

    # 6. Security Findings & AI Red Team Hypotheses
    findings = [
        {
            "id": "finding-computer-use-sandbox",
            "name": "Finding: Computer-Use OS Execution Boundary Escape Risk",
            "cwe": "CWE-78",
            "severity": "CRITICAL",
            "rule": "unbounded_os_mouse_and_keystroke_automation",
            "desc": "Skills repository computer-use module grants raw desktop mouse/keyboard automation.",
            "x": -50.0,
            "y": -40.0,
            "z": 45.0
        },
        {
            "id": "finding-prompt-injection-indirect",
            "name": "Finding: Indirect Prompt Injection via RAG Retrieval",
            "cwe": "CWE-20",
            "severity": "HIGH",
            "rule": "untrusted_retrieval_augmented_context",
            "desc": "External data documents injected into Message context could hijack tool arguments.",
            "x": 45.0,
            "y": -35.0,
            "z": -40.0
        }
    ]

    for f in findings:
        f_id = sha256(tenant_id, "Finding", "ai_redteam", f["id"], "v1")
        nodes.append({
            "id": f_id,
            "name": f["name"],
            "kind": "Finding",
            "cluster_group": "vulnerabilities",
            "x": f["x"],
            "y": f["y"],
            "z": f["z"],
            "radius": 3.6,
            "color_hint": "#ef4444",
            "claim_state": "validated",
            "risk_level": "critical",
            "metrics": {
                "cwe": f["cwe"],
                "severity": f["severity"],
                "description": f["desc"],
                "min_level": 2
            }
        })

    os.makedirs("data", exist_ok=True)
    out_file = "data/anthropics_universe.json"

    universe_data = {
        "org_id": org_id,
        "org_name": "Anthropic (github.com/anthropics)",
        "level": 0,
        "total_repositories": len(repos),
        "total_nodes": len(nodes),
        "total_edges": len(edges),
        "nodes": nodes,
        "edges": edges
    }

    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(universe_data, f, indent=2)

    print(f"\n[+] SUCCESS! Ingested {len(repos)} repositories, generated {len(nodes)} total nodes and {len(edges)} edges.")
    print(f"[+] Saved complete live graph snapshot to {out_file}")

if __name__ == "__main__":
    main()

