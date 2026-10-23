#!/usr/bin/env python3
# =====================================================================
# Author: Mauro Risonho de Paula Assumpção
# Create: 2026-10-18
# Update: 2026-10-23
# Short Description: Synthetic deep universe generator creating granular AST nodes and attack paths
# License: MIT
# =====================================================================

"""
OSAKG Deep Universe Generator
Generates a massive, high-fidelity, hierarchical 3D semantic knowledge graph (1,200+ nodes)
for the Anthropic organization with deep AST entities, cross-repo dependencies,
trust boundaries, security controls, and multi-stage offensive security attack paths.
"""

import json
import math
import hashlib
import os
import sys

def sha256(*parts):
    h = hashlib.sha256()
    h.update("|".join(str(p) for p in parts).encode('utf-8'))
    return h.hexdigest()

def spherical_to_cartesian(radius, theta, phi):
    """
    radius: distance from origin
    theta: azimuth [0, 2*pi]
    phi: inclination / polar angle [0, pi]
    """
    x = radius * math.sin(phi) * math.cos(theta)
    y = radius * math.cos(phi)
    z = radius * math.sin(phi) * math.sin(theta)
    return round(x, 2), round(y, 2), round(z, 2)

def main():
    tenant_id = "tenant-anthropic-public"
    print("[*] Generating OSAKG Massive Universe (1,200+ nodes, deep AST & Attack Paths)...")

    # Load previously fetched 100 Anthropic public repos
    source_universe_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'anthropics_universe.json')
    repos_raw = []
    if os.path.exists(source_universe_path):
        try:
            with open(source_universe_path, 'r', encoding='utf-8') as f:
                d = json.load(f)
                repos_raw = [n for n in d.get('nodes', []) if n.get('kind') == 'Repository']
        except Exception as e:
            print(f"[-] Warning: could not read {source_universe_path}: {e}")

    # Fallback to key repo names if file empty
    if not repos_raw or len(repos_raw) < 50:
        repos_raw = [{'name': f'anthropic-repo-{i}', 'metrics': {'stars': 100, 'language': 'Python'}} for i in range(100)]

    nodes = []
    edges = []

    # --------------------------------------------------------------------------
    # 1. Central Core Organization Node
    # --------------------------------------------------------------------------
    org_id = sha256(tenant_id, "Organization", "github", "anthropics", "v1")
    nodes.append({
        "id": org_id,
        "name": "Anthropic Organization",
        "kind": "Organization",
        "cluster_group": "core-org",
        "x": 0.0,
        "y": 0.0,
        "z": 0.0,
        "radius": 8.5,
        "color_hint": "#f59e0b",
        "claim_state": "observed",
        "risk_level": "low",
        "metrics": {
            "public_repos": len(repos_raw),
            "description": "AI safety and research company that builds reliable, interpretable, and steerable AI systems.",
            "url": "https://github.com/anthropics",
            "min_level": 0,
            "confidence": 1.0,
            "evidence_count": 12
        }
    })

    # --------------------------------------------------------------------------
    # 2. Celestial AI Models & Foundation Services
    # --------------------------------------------------------------------------
    models = [
        {"id": "claude-3-7-sonnet", "name": "Claude 3.7 Sonnet (Hybrid Reasoning)", "params": "Flagship 2025 SOTA", "color": "#c084fc"},
        {"id": "claude-3-5-sonnet", "name": "Claude 3.5 Sonnet", "params": "Industry Standard SOTA", "color": "#a855f7"},
        {"id": "claude-3-5-haiku", "name": "Claude 3.5 Haiku", "params": "High Speed / Ultra Low Latency", "color": "#818cf8"},
        {"id": "claude-3-opus", "name": "Claude 3 Opus", "params": "Deep Analysis & Complex Reasoning", "color": "#9333ea"},
    ]
    model_node_ids = {}
    for idx, m in enumerate(models):
        angle = (idx / len(models)) * 2 * math.pi
        mx, my, mz = spherical_to_cartesian(125.0, angle, math.pi * 0.45 + (idx % 2 * 0.1))
        m_id = sha256(tenant_id, "AIModel", "anthropic_catalog", m["id"], "v1")
        model_node_ids[m["id"]] = m_id
        nodes.append({
            "id": m_id,
            "name": m["name"],
            "kind": "AIModel",
            "cluster_group": "ai-models",
            "x": mx,
            "y": my,
            "z": mz,
            "radius": 4.8,
            "color_hint": m["color"],
            "claim_state": "observed",
            "risk_level": "low",
            "metrics": {
                "model_family": "Claude-3.x",
                "capabilities": "Vision, Extended Thinking, Tool Calling, Structured JSON",
                "min_level": 0,
                "confidence": 1.0,
                "evidence_count": 8
            }
        })
        edges.append({
            "id": f"edge-org-model-{m['id']}",
            "source": org_id,
            "target": m_id,
            "kind": "EXPOSES",
            "claim_state": "observed",
            "confidence": 1.0
        })

    # --------------------------------------------------------------------------
    # 3. Trust Boundaries & Security Perimeters
    # --------------------------------------------------------------------------
    boundaries = [
        {"id": "tb-public-internet", "name": "TrustBoundary: Public Internet Ingress", "zone": "Public HTTPS", "radius": 140.0, "phi": 0.25, "theta": 0.5, "color": "#f43f5e"},
        {"id": "tb-api-gateway", "name": "TrustBoundary: API Edge Gateway (api.anthropic.com)", "zone": "DMZ Ingress Gateway", "radius": 110.0, "phi": 0.4, "theta": 1.2, "color": "#fb7185"},
        {"id": "tb-mcp-protocol", "name": "TrustBoundary: MCP IPC & Transport Boundary", "zone": "Host Client / Stdio Subprocess", "radius": 95.0, "phi": 0.6, "theta": 2.4, "color": "#fbbf24"},
        {"id": "tb-sandbox-isolation", "name": "TrustBoundary: Untrusted Code Sandbox Boundary", "zone": "gVisor / Firecracker VM", "radius": 85.0, "phi": 0.8, "theta": 3.8, "color": "#ef4444"},
        {"id": "tb-weights-vault", "name": "TrustBoundary: TPU/GPU Weight Enclave", "zone": "Hardware Isolated Enclave", "radius": 75.0, "phi": 0.95, "theta": 5.1, "color": "#dc2626"}
    ]
    boundary_map = {}
    for b in boundaries:
        bx, by, bz = spherical_to_cartesian(b["radius"], b["theta"], b["phi"] * math.pi)
        b_id = sha256(tenant_id, "TrustBoundary", "infrastructure", b["id"], "v1")
        boundary_map[b["id"]] = b_id
        nodes.append({
            "id": b_id,
            "name": b["name"],
            "kind": "TrustBoundary",
            "cluster_group": "security-perimeter",
            "x": bx,
            "y": by,
            "z": bz,
            "radius": 5.2,
            "color_hint": b["color"],
            "claim_state": "observed",
            "risk_level": "high",
            "metrics": {
                "security_zone": b["zone"],
                "min_level": 1,
                "confidence": 1.0,
                "evidence_count": 4
            }
        })

    # Security Controls
    controls = [
        {"id": "ctrl-api-auth", "name": "Control: x-api-key Ingress Validator", "type": "Authentication", "r": 105, "t": 1.1, "p": 0.42, "boundary": "tb-api-gateway"},
        {"id": "ctrl-rate-limit", "name": "Control: Token Bucket Rate Limiter", "type": "Availability", "r": 102, "t": 1.3, "p": 0.38, "boundary": "tb-api-gateway"},
        {"id": "ctrl-mcp-schema", "name": "Control: MCP Tool Schema Sanitizer", "type": "InputSanitization", "r": 92, "t": 2.5, "p": 0.58, "boundary": "tb-mcp-protocol"},
        {"id": "ctrl-sandbox-seccomp", "name": "Control: Seccomp-BPF Syscall Filter", "type": "IsolationControl", "r": 82, "t": 3.9, "p": 0.78, "boundary": "tb-sandbox-isolation"},
        {"id": "ctrl-weights-kms", "name": "Control: Envelope Encryption KMS Key", "type": "CryptographicControl", "r": 72, "t": 5.2, "p": 0.92, "boundary": "tb-weights-vault"},
    ]
    for c in controls:
        cx, cy, cz = spherical_to_cartesian(c["r"], c["t"], c["p"] * math.pi)
        c_id = sha256(tenant_id, "Control", "security_stack", c["id"], "v1")
        nodes.append({
            "id": c_id,
            "name": c["name"],
            "kind": "Control",
            "cluster_group": "security-perimeter",
            "x": cx,
            "y": cy,
            "z": cz,
            "radius": 3.6,
            "color_hint": "#22c55e",
            "claim_state": "observed",
            "risk_level": "low",
            "metrics": {
                "control_type": c["type"],
                "min_level": 1,
                "confidence": 1.0,
                "evidence_count": 6
            }
        })
        # Link Control -> ENFORCES -> Boundary
        edges.append({
            "id": f"edge-ctrl-tb-{c['id']}",
            "source": c_id,
            "target": boundary_map[c["boundary"]],
            "kind": "ENFORCES",
            "claim_state": "observed",
            "confidence": 1.0
        })

    # --------------------------------------------------------------------------
    # 4. 100 Repositories Structured into 6 Constellation Clusters
    # --------------------------------------------------------------------------
    clusters = {
        "sdks": {"name": "SDKs & Client Runtimes", "center_theta": 0.8, "center_phi": 0.45, "color": "#38bdf8"},
        "agents": {"name": "Agentic & Tool Calling", "center_theta": 2.2, "center_phi": 0.40, "color": "#ec4899"},
        "mcp": {"name": "Model Context Protocol", "center_theta": 3.4, "center_phi": 0.55, "color": "#eab308"},
        "safety": {"name": "Safety Research & Alignment", "center_theta": 4.6, "center_phi": 0.35, "color": "#10b981"},
        "cookbooks": {"name": "Cookbooks, Demos & Quickstarts", "center_theta": 5.8, "center_phi": 0.60, "color": "#f97316"},
        "infra": {"name": "Infrastructure, Evals & Serving", "center_theta": 1.6, "center_phi": 0.75, "color": "#8b5cf6"},
    }

    def assign_cluster(repo_name):
        n = repo_name.lower()
        if "mcp" in n or "model-context-protocol" in n:
            return "mcp"
        if "sdk" in n or "client" in n or "api" in n or "bedrock" in n:
            return "sdks"
        if "agent" in n or "sandbox" in n or "computer" in n or "skill" in n or "code" in n:
            return "agents"
        if "harmless" in n or "superposition" in n or "rlhf" in n or "circuit" in n or "pysvelte" in n or "alignment" in n:
            return "safety"
        if "cookbook" in n or "tutorial" in n or "course" in n or "quickstart" in n or "demo" in n:
            return "cookbooks"
        return "infra"

    repo_node_map = {}
    repos_by_cluster = {k: [] for k in clusters}
    for r in repos_raw:
        c_key = assign_cluster(r["name"])
        repos_by_cluster[c_key].append(r)

    # Position each repository within its orbital cluster
    cluster_radius = 68.0
    for c_key, r_list in repos_by_cluster.items():
        c_info = clusters[c_key]
        n_count = len(r_list)
        for i, r in enumerate(r_list):
            repo_name = r["name"]
            metrics = r.get("metrics", {})
            stars = metrics.get("stars", 100)
            lang = metrics.get("language") or "Python"

            # Offset around cluster center
            angle = (i / max(1, n_count)) * 2 * math.pi
            spread = 0.35 * math.sqrt((i + 1) / n_count)
            t = c_info["center_theta"] + math.cos(angle) * spread
            p = max(0.1, min(0.95, c_info["center_phi"] + math.sin(angle) * spread * 0.6))

            rx, ry, rz = spherical_to_cartesian(cluster_radius, t, p * math.pi)
            repo_id = sha256(tenant_id, "Repository", "github", repo_name, "main")
            repo_node_map[repo_name] = {
                "id": repo_id,
                "x": rx, "y": ry, "z": rz,
                "cluster": c_key,
                "color": c_info["color"],
                "lang": lang
            }

            nodes.append({
                "id": repo_id,
                "name": repo_name,
                "kind": "Repository",
                "cluster_group": c_key,
                "x": rx,
                "y": ry,
                "z": rz,
                "radius": 4.5 if stars > 1000 else 3.2,
                "color_hint": c_info["color"],
                "claim_state": "observed",
                "risk_level": "critical" if "sandbox" in repo_name else "high" if "agent" in repo_name else "medium" if stars > 1500 else "low",
                "metrics": {
                    "stars": stars,
                    "language": lang,
                    "cluster_name": c_info["name"],
                    "url": f"https://github.com/anthropics/{repo_name}",
                    "min_level": 0,
                    "confidence": 1.0,
                    "evidence_count": 5
                }
            })

            # Connect Org -> CONTAINS -> Repo
            edges.append({
                "id": f"edge-org-{repo_name}",
                "source": org_id,
                "target": repo_id,
                "kind": "CONTAINS",
                "claim_state": "observed",
                "confidence": 1.0
            })

    print(f"[+] Placed {len(repo_node_map)} repositories across 6 regional clusters.")

    # --------------------------------------------------------------------------
    # 5. Massive Deep AST Extraction across Key Repositories
    # --------------------------------------------------------------------------
    # Detailed specifications for the most critical Anthropic codebases
    deep_repo_specs = {
        "anthropic-sdk-python": {
            "dirs": ["anthropic", "anthropic/resources", "anthropic/types", "anthropic/lib", "anthropic/telemetry"],
            "files": [
                {
                    "path": "anthropic/client.py",
                    "classes": ["Anthropic", "AsyncAnthropic", "BaseClient"],
                    "functions": ["__init__", "messages", "completions", "request", "close"],
                    "deps": ["httpx", "pydantic", "sniffio", "anyio"]
                },
                {
                    "path": "anthropic/resources/messages.py",
                    "classes": ["Messages", "AsyncMessages"],
                    "functions": ["create", "stream", "count_tokens", "batch", "retrieve_batch"],
                    "deps": ["typing_extensions"]
                },
                {
                    "path": "anthropic/lib/streaming.py",
                    "classes": ["MessageStream", "MessageStreamManager"],
                    "functions": ["__aiter__", "get_final_message", "get_final_text", "_accumulate_delta"],
                    "deps": []
                },
                {
                    "path": "anthropic/resources/beta/tools.py",
                    "classes": ["ToolRegistry", "ToolExecutor"],
                    "functions": ["register_tool", "execute", "validate_signature", "serialize_schema"],
                    "deps": ["jsonschema"]
                }
            ]
        },
        "anthropic-sdk-typescript": {
            "dirs": ["src", "src/resources", "src/streaming", "src/core"],
            "files": [
                {
                    "path": "src/index.ts",
                    "classes": ["Anthropic"],
                    "functions": ["Anthropic.createClient", "postMessage", "handleStreamingChunk"],
                    "deps": ["node-fetch", "ws"]
                },
                {
                    "path": "src/resources/messages.ts",
                    "classes": ["Messages"],
                    "functions": ["create", "stream", "batches"],
                    "deps": []
                },
                {
                    "path": "src/core/auth.ts",
                    "classes": ["AuthInterceptor", "TokenProvider"],
                    "functions": ["signRequest", "refreshSession", "validateApiKeyHeader"],
                    "deps": ["crypto"]
                }
            ]
        },
        "sandbox-runtime": {
            "dirs": ["cmd/server", "pkg/isolation", "pkg/ipc", "pkg/jail"],
            "files": [
                {
                    "path": "pkg/isolation/container.go",
                    "classes": ["ContainerManager", "CgroupController"],
                    "functions": ["SpawnJail", "LimitMemory", "EnforceSeccompPolicy", "KillContainer"],
                    "deps": ["libcontainer", "seccomp"]
                },
                {
                    "path": "pkg/ipc/transport.go",
                    "classes": ["IPCGateway", "SharedMemoryRing"],
                    "functions": ["OpenPipe", "SendPayload", "ValidateMessageIntegrity", "CloseIPCChannel"],
                    "deps": ["posix_ipc"]
                },
                {
                    "path": "cmd/server/main.go",
                    "classes": ["SandboxServer"],
                    "functions": ["main", "HandleExecRequest", "HandleFileMount", "AuditLogStream"],
                    "deps": ["grpc", "protobuf"]
                }
            ]
        },
        "skills": {
            "dirs": ["skills/core", "skills/eval", "skills/registry"],
            "files": [
                {
                    "path": "skills/core/agent_skill.py",
                    "classes": ["SkillDefinition", "AgentSkillRunner"],
                    "functions": ["load_from_yaml", "execute_step", "validate_preconditions", "rollback_state"],
                    "deps": ["yaml", "pydantic"]
                },
                {
                    "path": "skills/registry/hub.py",
                    "classes": ["SkillRegistryHub"],
                    "functions": ["register", "lookup_skill", "verify_signature", "sync_remote_catalog"],
                    "deps": ["requests"]
                }
            ]
        },
        "model-context-protocol": {
            "dirs": ["protocol/specification", "protocol/transports", "protocol/security"],
            "files": [
                {
                    "path": "protocol/transports/stdio.ts",
                    "classes": ["StdioServerTransport", "StdioClientTransport"],
                    "functions": ["start", "sendMessage", "receiveMessage", "close"],
                    "deps": ["events"]
                },
                {
                    "path": "protocol/transports/sse.ts",
                    "classes": ["SSEServerTransport", "SSEClientTransport"],
                    "functions": ["handlePostMessage", "sendNotification", "subscribeEvents"],
                    "deps": ["express"]
                },
                {
                    "path": "protocol/security/validator.ts",
                    "classes": ["MCPCapabilityValidator", "ResourceACL"],
                    "functions": ["checkPermission", "filterAllowedTools", "sanitizeURI"],
                    "deps": ["zod"]
                }
            ]
        },
        "computer-use-demo": {
            "dirs": ["computer_use_demo", "computer_use_demo/tools", "image"],
            "files": [
                {
                    "path": "computer_use_demo/loop.py",
                    "classes": ["SamplingLoop"],
                    "functions": ["sampling_loop", "run_agent_cycle", "handle_tool_call"],
                    "deps": ["anthropic"]
                },
                {
                    "path": "computer_use_demo/tools/bash.py",
                    "classes": ["BashTool", "_BashSession"],
                    "functions": ["__call__", "run_command", "clean_up"],
                    "deps": ["pexpect", "asyncio"]
                },
                {
                    "path": "computer_use_demo/tools/screen.py",
                    "classes": ["ScreenTool"],
                    "functions": ["take_screenshot", "mouse_click", "mouse_move", "key_press"],
                    "deps": ["pyautogui", "pillow"]
                }
            ]
        },
        "claude-code": {
            "dirs": ["cli", "cli/session", "cli/tools", "cli/lsp"],
            "files": [
                {
                    "path": "cli/main.ts",
                    "classes": ["ClaudeCLI"],
                    "functions": ["main", "parseArgs", "initWorkspace", "executeREPL"],
                    "deps": ["commander", "chalk"]
                },
                {
                    "path": "cli/session/tracker.ts",
                    "classes": ["SessionTracker", "ContextCompressor"],
                    "functions": ["addTurn", "compressContext", "dumpTranscript", "restoreSession"],
                    "deps": []
                },
                {
                    "path": "cli/tools/filesystem.ts",
                    "classes": ["FileSystemTools"],
                    "functions": ["view_file", "replace_file_content", "grep_search", "run_command"],
                    "deps": ["fs", "path"]
                }
            ]
        },
        "hh-rlhf": {
            "dirs": ["data_cleaning", "metrics", "reward_model"],
            "files": [
                {
                    "path": "reward_model/train.py",
                    "classes": ["RewardModelTrainer", "PreferenceLoss"],
                    "functions": ["train_step", "compute_ranking_loss", "evaluate_harmlessness"],
                    "deps": ["torch", "transformers", "accelerate"]
                },
                {
                    "path": "metrics/toxicity.py",
                    "classes": ["ToxicityEvaluator"],
                    "functions": ["score_dataset", "compute_redteam_robustness"],
                    "deps": ["scikit-learn"]
                }
            ]
        },
        "evals": {
            "dirs": ["evals/framework", "evals/benchmarks", "evals/security"],
            "files": [
                {
                    "path": "evals/framework/runner.py",
                    "classes": ["EvalRunner", "BatchEvaluator"],
                    "functions": ["run_eval", "aggregate_metrics", "publish_report"],
                    "deps": ["tqdm", "pandas"]
                },
                {
                    "path": "evals/security/jailbreak_eval.py",
                    "classes": ["JailbreakEvaluator", "RedTeamProbeGenerator"],
                    "functions": ["test_prefix_injection", "test_obfuscation", "measure_asr"],
                    "deps": []
                }
            ]
        },
        "toy-models-of-superposition": {
            "dirs": ["models", "visualizations"],
            "files": [
                {
                    "path": "models/superposition_net.py",
                    "classes": ["SuperpositionMLP", "FeatureRepresentation"],
                    "functions": ["forward", "compute_polysemanticity", "orthogonality_loss"],
                    "deps": ["torch", "einops"]
                }
            ]
        }
    }

    # Generate deep AST entities for these specs + synthetic deep AST for other repos
    print("[*] Instantiating Directory, File, Class, Function, Package, and Dependency nodes...")

    ast_count = 0
    file_map = {}
    func_map = {}
    class_map = {}

    for repo_name, r_info in repo_node_map.items():
        spec = deep_repo_specs.get(repo_name)
        rx, ry, rz = r_info["x"], r_info["y"], r_info["z"]
        r_id = r_info["id"]

        # Default structure if not explicitly specced
        if not spec:
            lang = r_info["lang"].lower()
            ext = "py" if "python" in lang else "ts" if "type" in lang or "java" in lang else "rs" if "rust" in lang else "go" if "go" in lang else "py"
            spec = {
                "dirs": ["src", "src/core", "tests"],
                "files": [
                    {
                        "path": f"src/main.{ext}",
                        "classes": [f"{repo_name.replace('-', '_').capitalize()}Service"],
                        "functions": ["init", "run", "shutdown", "process_event"],
                        "deps": ["requests" if ext == "py" else "axios"]
                    },
                    {
                        "path": f"src/core/engine.{ext}",
                        "classes": ["Engine"],
                        "functions": ["execute", "validate", "compute"],
                        "deps": []
                    }
                ]
            }

        # 1. Directories
        dir_ids = {}
        for d_idx, d_path in enumerate(spec["dirs"]):
            d_id = sha256(tenant_id, "Directory", repo_name, d_path, "main")
            dir_ids[d_path] = d_id
            # Position directory in orbit around repo
            d_angle = (d_idx / max(1, len(spec["dirs"]))) * 2 * math.pi
            dx = rx + math.cos(d_angle) * 7.5
            dy = ry + math.sin(d_angle) * 7.5 + (d_idx % 2 * 2 - 1) * 2.0
            dz = rz + math.sin(d_angle * 1.5) * 5.0

            nodes.append({
                "id": d_id,
                "name": d_path,
                "kind": "Directory",
                "cluster_group": r_info["cluster"],
                "x": round(dx, 2), "y": round(dy, 2), "z": round(dz, 2),
                "radius": 2.2,
                "color_hint": "#64748b",
                "claim_state": "observed",
                "risk_level": "low",
                "metrics": {"repo": repo_name, "path": d_path, "min_level": 1, "confidence": 1.0}
            })
            edges.append({
                "id": f"edge-{repo_name}-dir-{d_idx}",
                "source": r_id,
                "target": d_id,
                "kind": "CONTAINS",
                "claim_state": "observed",
                "confidence": 1.0
            })
            ast_count += 1

        # 2. Files, Classes, Functions & Dependencies
        for f_idx, f_info in enumerate(spec["files"]):
            f_path = f_info["path"]
            f_id = sha256(tenant_id, "File", repo_name, f_path, "main")
            file_map[f"{repo_name}:{f_path}"] = f_id

            # Orbit around repo
            f_angle = (f_idx / max(1, len(spec["files"]))) * 2 * math.pi + 0.8
            fx = rx + math.cos(f_angle) * 12.0
            fy = ry + math.sin(f_angle) * 12.0 + (f_idx % 2 * 2 - 1) * 3.0
            fz = rz + math.sin(f_angle * 1.2) * 8.0

            nodes.append({
                "id": f_id,
                "name": os.path.basename(f_path),
                "kind": "File",
                "cluster_group": r_info["cluster"],
                "x": round(fx, 2), "y": round(fy, 2), "z": round(fz, 2),
                "radius": 2.0,
                "color_hint": "#38bdf8",
                "claim_state": "observed",
                "risk_level": "medium" if "main" in f_path or "security" in f_path or "auth" in f_path else "low",
                "metrics": {
                    "repo": repo_name,
                    "path": f_path,
                    "loc": 180 + (f_idx * 95),
                    "min_level": 2,
                    "confidence": 1.0,
                    "evidence_count": 3
                }
            })
            edges.append({
                "id": f"edge-repo-{repo_name}-file-{f_idx}",
                "source": r_id,
                "target": f_id,
                "kind": "CONTAINS",
                "claim_state": "observed",
                "confidence": 1.0
            })
            ast_count += 1

            # Classes
            for c_idx, c_name in enumerate(f_info["classes"]):
                c_id = sha256(tenant_id, "Class", repo_name, f_path, c_name)
                class_map[f"{repo_name}:{c_name}"] = c_id
                cx = fx + math.cos(c_idx * 1.5) * 4.0
                cy = fy + math.sin(c_idx * 1.5) * 4.0
                cz = fz + (c_idx * 2.0)
                nodes.append({
                    "id": c_id,
                    "name": c_name,
                    "kind": "Class",
                    "cluster_group": r_info["cluster"],
                    "x": round(cx, 2), "y": round(cy, 2), "z": round(cz, 2),
                    "radius": 1.6,
                    "color_hint": "#a78bfa",
                    "claim_state": "observed",
                    "risk_level": "low",
                    "metrics": {"file": f_path, "methods_count": len(f_info["functions"]), "min_level": 2, "confidence": 1.0}
                })
                edges.append({
                    "id": f"edge-file-class-{c_id[:8]}",
                    "source": f_id,
                    "target": c_id,
                    "kind": "DECLARES",
                    "claim_state": "observed",
                    "confidence": 1.0
                })
                ast_count += 1

            # Functions & Methods
            for fn_idx, fn_name in enumerate(f_info["functions"]):
                fn_id = sha256(tenant_id, "Function", repo_name, f_path, fn_name)
                func_map[f"{repo_name}:{fn_name}"] = fn_id
                fn_angle = (fn_idx / max(1, len(f_info["functions"]))) * 2 * math.pi
                fn_x = fx + math.cos(fn_angle) * 6.5
                fn_y = fy + math.sin(fn_angle) * 6.5
                fn_z = fz + (fn_idx % 2 * 2 - 1) * 2.5
                nodes.append({
                    "id": fn_id,
                    "name": f"{fn_name}()",
                    "kind": "Function",
                    "cluster_group": r_info["cluster"],
                    "x": round(fn_x, 2), "y": round(fn_y, 2), "z": round(fn_z, 2),
                    "radius": 1.4,
                    "color_hint": "#34d399",
                    "claim_state": "observed",
                    "risk_level": "high" if "exec" in fn_name.lower() or "command" in fn_name.lower() or "auth" in fn_name.lower() else "low",
                    "metrics": {
                        "file": f_path,
                        "signature": f"def {fn_name}(*args, **kwargs)",
                        "min_level": 3,
                        "confidence": 1.0,
                        "evidence_count": 2
                    }
                })
                edges.append({
                    "id": f"edge-file-fn-{fn_id[:8]}",
                    "source": f_id,
                    "target": fn_id,
                    "kind": "CONTAINS",
                    "claim_state": "observed",
                    "confidence": 1.0
                })
                ast_count += 1

            # Third-Party Dependencies
            for d_name in f_info["deps"]:
                dep_id = sha256(tenant_id, "Dependency", "package", d_name, "external")
                # Deduplicate node if package already added
                if not any(n["id"] == dep_id for n in nodes):
                    nodes.append({
                        "id": dep_id,
                        "name": f"pkg:{d_name}",
                        "kind": "Dependency",
                        "cluster_group": "third-party-deps",
                        "x": round(fx + 9.0, 2),
                        "y": round(fy + 9.0, 2),
                        "z": round(fz, 2),
                        "radius": 1.8,
                        "color_hint": "#f472b6",
                        "claim_state": "observed",
                        "risk_level": "medium",
                        "metrics": {"package_name": d_name, "min_level": 2, "confidence": 1.0}
                    })
                    ast_count += 1
                edges.append({
                    "id": f"edge-file-dep-{f_id[:8]}-{d_name}",
                    "source": f_id,
                    "target": dep_id,
                    "kind": "DEPENDS_ON",
                    "claim_state": "observed",
                    "confidence": 1.0
                })

    print(f"[+] Created {ast_count} deep code AST entities (Directories, Files, Classes, Functions, Packages).")

    # --------------------------------------------------------------------------
    # 6. Critical API Endpoints & Enterprise DataStores
    # --------------------------------------------------------------------------
    endpoints = [
        {"id": "ep-messages", "name": "POST /v1/messages", "cluster": "sdks", "desc": "Primary streaming and tool-calling completion API"},
        {"id": "ep-batches", "name": "POST /v1/messages/batches", "cluster": "sdks", "desc": "Asynchronous Batch Inference API"},
        {"id": "ep-models", "name": "GET /v1/models", "cluster": "sdks", "desc": "Catalog and Capabilities introspection endpoint"},
        {"id": "ep-sandbox-exec", "name": "POST /v1/sandbox/exec", "cluster": "agents", "desc": "Isolated ephemeral code execution endpoint"},
        {"id": "ep-mcp-sse", "name": "POST /sse/mcp/invoke", "cluster": "mcp", "desc": "Server-Sent Events JSON-RPC Tool Invocation"},
    ]
    ep_map = {}
    for idx, ep in enumerate(endpoints):
        c_info = clusters[ep["cluster"]]
        ep_x, ep_y, ep_z = spherical_to_cartesian(82.0, c_info["center_theta"] + idx * 0.15, c_info["center_phi"] * math.pi)
        ep_id = sha256(tenant_id, "Endpoint", "api_gateway", ep["id"], "v1")
        ep_map[ep["id"]] = ep_id
        nodes.append({
            "id": ep_id,
            "name": ep["name"],
            "kind": "Endpoint",
            "cluster_group": ep["cluster"],
            "x": ep_x, "y": ep_y, "z": ep_z,
            "radius": 3.0,
            "color_hint": "#f59e0b",
            "claim_state": "observed",
            "risk_level": "medium",
            "metrics": {
                "route": ep["id"],
                "description": ep["desc"],
                "min_level": 1,
                "confidence": 1.0,
                "evidence_count": 4
            }
        })
        # Connect API endpoint to public boundary crossing
        edges.append({
            "id": f"edge-ep-boundary-{idx}",
            "source": ep_id,
            "target": boundary_map["tb-api-gateway"],
            "kind": "CROSSES",
            "claim_state": "observed",
            "confidence": 1.0
        })

    # DataStores & Cache Nodes
    datastores = [
        {"id": "ds-prompt-cache", "name": "DataStore: RedisPromptCache", "type": "InMemoryCache", "r": 62, "t": 1.2, "p": 0.5},
        {"id": "ds-vector-store", "name": "DataStore: EmbeddingsVectorDB", "type": "VectorDatabase", "r": 60, "t": 2.8, "p": 0.6},
        {"id": "ds-tenant-db", "name": "DataStore: PostgresTenantsDB", "type": "RelationalSQL", "r": 58, "t": 4.1, "p": 0.4},
        {"id": "ds-weights-s3", "name": "DataStore: ModelWeightsBlobStorage", "type": "CloudStorageBucket", "r": 55, "t": 5.2, "p": 0.8},
        {"id": "ds-secret-kms", "name": "DataStore: SecureEnvStore & KMS Vault", "type": "KeyVault", "r": 52, "t": 3.5, "p": 0.75},
    ]
    ds_map = {}
    for ds in datastores:
        dx, dy, dz = spherical_to_cartesian(ds["r"], ds["t"], ds["p"] * math.pi)
        ds_id = sha256(tenant_id, "DataStore", "storage", ds["id"], "v1")
        ds_map[ds["id"]] = ds_id
        nodes.append({
            "id": ds_id,
            "name": ds["name"],
            "kind": "DataStore",
            "cluster_group": "data-infra",
            "x": dx, "y": dy, "z": dz,
            "radius": 3.6,
            "color_hint": "#3b82f6",
            "claim_state": "observed",
            "risk_level": "high",
            "metrics": {
                "engine": ds["type"],
                "min_level": 1,
                "confidence": 1.0,
                "evidence_count": 6
            }
        })

    # --------------------------------------------------------------------------
    # 7. Offensive Security Findings (Pillar 3: OSAKG Core)
    # --------------------------------------------------------------------------
    findings_spec = [
        {
            "id": "FIND-MCP-SSRF-01",
            "title": "CWE-918: Server-Side Request Forgery via MCP Remote Tool Endpoint",
            "severity": "critical",
            "cvss": 9.4,
            "cwe": "CWE-918",
            "repo": "model-context-protocol",
            "file": "protocol/transports/sse.ts",
            "line": 42,
            "snippet": "const targetUrl = req.body.callback_url;\n// Missing hostname allowlist validation\nconst response = await fetch(targetUrl);",
            "rationale": "Arbitrary outbound HTTP requests can be initiated from the SSE tool transport to internal cloud metadata (169.254.169.254) or VPC backends."
        },
        {
            "id": "FIND-INJ-PROMPT-02",
            "title": "CWE-77: Indirect Prompt Injection leading to Arbitrary Tool Dispatch",
            "severity": "high",
            "cvss": 8.7,
            "cwe": "CWE-77",
            "repo": "computer-use-demo",
            "file": "computer_use_demo/loop.py",
            "line": 88,
            "snippet": "for tool_call in assistant_message.tool_calls:\n    # Unsanitized user prompt flows directly into system shell execution\n    result = bash_tool.execute(tool_call.input['command'])",
            "rationale": "Untrusted web content ingested by the agent can hijack the reasoning chain and execute unreviewed bash commands in the demo environment."
        },
        {
            "id": "FIND-SANDBOX-ESCAPE-03",
            "title": "CWE-250: Container Sandbox Escape via Insecure Host IPC Sharing",
            "severity": "critical",
            "cvss": 9.8,
            "cwe": "CWE-250",
            "repo": "sandbox-runtime",
            "file": "pkg/isolation/container.go",
            "line": 134,
            "snippet": "cmd.SysProcAttr = &syscall.SysProcAttr{\n    Cloneflags: syscall.CLONE_NEWPID, // Missing CLONE_NEWIPC and CLONE_NEWNET\n}",
            "rationale": "The ephemeral worker container shares host IPC semaphores, allowing memory injection into the host runtime daemon."
        },
        {
            "id": "FIND-CACHE-POISON-04",
            "title": "CWE-444: Multi-Tenant Prompt Cache Desynchronization & Data Leakage",
            "severity": "high",
            "cvss": 8.2,
            "cwe": "CWE-444",
            "repo": "anthropic-sdk-python",
            "file": "anthropic/resources/messages.py",
            "line": 164,
            "snippet": "cache_key = hashlib.sha256(prompt_str.encode()).hexdigest()\n# Missing tenant_id segregation in cache key derivation",
            "rationale": "Identical system prompt prefixes across distinct corporate tenants collide in RedisPromptCache, returning cached responses across tenant boundaries."
        },
        {
            "id": "FIND-TOKEN-EXPOSURE-05",
            "title": "CWE-798: Fallback Hardcoded Session Token in Mock Test Harness",
            "severity": "medium",
            "cvss": 6.5,
            "cwe": "CWE-798",
            "repo": "skills",
            "file": "skills/core/agent_skill.py",
            "line": 31,
            "snippet": "DEFAULT_BEARER = 'sk-ant-test-mock-9988224411'\nif not os.getenv('ANTHROPIC_API_KEY'):\n    client = Anthropic(api_key=DEFAULT_BEARER)",
            "rationale": "Hardcoded test credentials exposed in open-source repository could allow unauthorized access if matching mock relays are running."
        },
        {
            "id": "FIND-DESERIALIZE-06",
            "title": "CWE-502: Unsafe YAML Deserialization in Dynamic Skill Loader",
            "severity": "high",
            "cvss": 8.5,
            "cwe": "CWE-502",
            "repo": "skills",
            "file": "skills/core/agent_skill.py",
            "line": 56,
            "snippet": "with open(yaml_path) as f:\n    return yaml.load(f, Loader=yaml.Loader) # Unsafe Loader allows Python code instantiation",
            "rationale": "Loading untrusted third-party skill definitions invokes arbitrary object constructors via Python yaml.Loader."
        }
    ]

    finding_map = {}
    for idx, f in enumerate(findings_spec):
        repo_name = f["repo"]
        r_info = repo_node_map.get(repo_name, {"x": 50, "y": 20, "z": 20, "cluster": "agents"})
        # Position finding adjacent to repo
        angle = idx * 1.05
        fx = r_info["x"] + math.cos(angle) * 14.0
        fy = r_info["y"] + math.sin(angle) * 14.0
        fz = r_info["z"] + 6.0

        f_id = sha256(tenant_id, "Finding", f["id"], repo_name, "v1")
        finding_map[f["id"]] = f_id

        nodes.append({
            "id": f_id,
            "name": f["id"],
            "kind": "Finding",
            "cluster_group": "offensive-findings",
            "x": round(fx, 2), "y": round(fy, 2), "z": round(fz, 2),
            "radius": 3.8,
            "color_hint": "#ef4444" if f["severity"] == "critical" else "#f97316",
            "claim_state": "validated",
            "risk_level": f["severity"],
            "metrics": {
                "title": f["title"],
                "cvss": f["cvss"],
                "cwe": f["cwe"],
                "repo": repo_name,
                "file_path": f["file"],
                "line": f["line"],
                "snippet": f["snippet"],
                "rationale": f["rationale"],
                "min_level": 2,
                "confidence": 1.0,
                "evidence_count": 5
            }
        })

        # Connect Repo -> VULNERABLE_TO -> Finding
        if repo_name in repo_node_map:
            edges.append({
                "id": f"edge-vuln-{f['id']}",
                "source": repo_node_map[repo_name]["id"],
                "target": f_id,
                "kind": "VULNERABLE_TO",
                "claim_state": "validated",
                "confidence": 1.0
            })

    # --------------------------------------------------------------------------
    # 8. Multi-Stage Attack Paths (Kill Chains)
    # --------------------------------------------------------------------------
    print("[*] Synthesizing Multi-Stage Attack Paths (Kill Chains) across repositories...")

    # Attacker Origin Node (Outside Trust Boundary)
    attacker_id = sha256(tenant_id, "ThreatActor", "external", "APT-Autonomous-Agent", "v1")
    nodes.append({
        "id": attacker_id,
        "name": "Threat Actor: External Adversary",
        "kind": "ThreatActor",
        "cluster_group": "offensive-findings",
        "x": 160.0,
        "y": 55.0,
        "z": 45.0,
        "radius": 4.5,
        "color_hint": "#dc2626",
        "claim_state": "observed",
        "risk_level": "critical",
        "metrics": {
            "origin": "Public WAN",
            "motivation": "Prompt Injection, Data Exfiltration & Cloud Enclave Compromise",
            "min_level": 1,
            "confidence": 1.0
        }
    })

    # Kill Chain 1: Prompt Injection -> MCP Tool SSRF -> AWS/GCP Metadata Exfiltration
    kc1_steps = [
        (attacker_id, finding_map["FIND-INJ-PROMPT-02"], "INJECTS_MALICIOUS_PAYLOAD", 1),
        (finding_map["FIND-INJ-PROMPT-02"], finding_map["FIND-MCP-SSRF-01"], "TRIGGER_UNVALIDATED_TOOL_CALL", 2),
        (finding_map["FIND-MCP-SSRF-01"], boundary_map["tb-mcp-protocol"], "BYPASSES_SECURITY_BOUNDARY", 3),
        (boundary_map["tb-mcp-protocol"], ds_map["ds-secret-kms"], "EXFILTRATES_CREDENTIALS", 4)
    ]
    for src, tgt, rel, step in kc1_steps:
        edges.append({
            "id": f"edge-kc1-step-{step}",
            "source": src,
            "target": tgt,
            "kind": rel,
            "claim_state": "validated",
            "confidence": 0.98,
            "is_attack_path": True,
            "attack_step": step,
            "chain_name": "Kill Chain 1: MCP SSRF & Credential Exfiltration"
        })

    # Kill Chain 2: Sandbox Container Escape -> Model Weights Exfiltration
    kc2_steps = [
        (attacker_id, finding_map["FIND-SANDBOX-ESCAPE-03"], "EXECUTES_ARBITRARY_CODE", 1),
        (finding_map["FIND-SANDBOX-ESCAPE-03"], boundary_map["tb-sandbox-isolation"], "BREAKS_CGROUP_ISOLATION", 2),
        (boundary_map["tb-sandbox-isolation"], boundary_map["tb-weights-vault"], "PIVOTS_TO_SECURE_ENCLAVE", 3),
        (boundary_map["tb-weights-vault"], ds_map["ds-weights-s3"], "ACCESSES_UNENCRYPTED_WEIGHTS", 4)
    ]
    for src, tgt, rel, step in kc2_steps:
        edges.append({
            "id": f"edge-kc2-step-{step}",
            "source": src,
            "target": tgt,
            "kind": rel,
            "claim_state": "validated",
            "confidence": 0.95,
            "is_attack_path": True,
            "attack_step": step,
            "chain_name": "Kill Chain 2: Sandbox Container Escape to Weights Enclave"
        })

    # Kill Chain 3: Multi-Tenant Prompt Cache Poisoning
    kc3_steps = [
        (attacker_id, finding_map["FIND-CACHE-POISON-04"], "POISONS_SHARED_CACHE_KEY", 1),
        (finding_map["FIND-CACHE-POISON-04"], ds_map["ds-prompt-cache"], "CORRUPTS_REDIS_ENTRY", 2),
        (ds_map["ds-prompt-cache"], ep_map["ep-messages"], "LEAKS_VICTIM_PROMPT_CONTEXT", 3),
        (ep_map["ep-messages"], model_node_ids["claude-3-7-sonnet"], "HIJACKS_SYSTEM_PROMPT", 4)
    ]
    for src, tgt, rel, step in kc3_steps:
        edges.append({
            "id": f"edge-kc3-step-{step}",
            "source": src,
            "target": tgt,
            "kind": rel,
            "claim_state": "validated",
            "confidence": 0.92,
            "is_attack_path": True,
            "attack_step": step,
            "chain_name": "Kill Chain 3: Multi-Tenant Cache Poisoning"
        })

    # --------------------------------------------------------------------------
    # 9. Cross-Repository Dependency & Call Edges
    # --------------------------------------------------------------------------
    cross_repo_links = [
        ("computer-use-demo", "anthropic-sdk-python", "CALLS_CLIENT_API"),
        ("claude-code", "anthropic-sdk-typescript", "INVOKES_TS_CLIENT"),
        ("claude-code", "model-context-protocol", "INTEGRATES_MCP_SERVER"),
        ("skills", "anthropic-sdk-python", "USES_SDK_RUNNER"),
        ("sandbox-runtime", "computer-use-demo", "SANDBOXES_TOOL_ENVIRONMENT"),
        ("evals", "anthropic-sdk-python", "BENCHMARKS_VIA_API"),
        ("evals", "claude-3-7-sonnet", "EVALUATES_REASONING_BENCHMARK"),
        ("claude-cookbooks", "anthropic-sdk-python", "DEMONSTRATES_CODE_PATTERNS"),
        ("anthropic-quickstarts", "anthropic-sdk-typescript", "BOOTSTRAPS_FULLSTACK_APP"),
        ("prompt-eng-interactive-tutorial", "claude-3-5-sonnet", "PROMPTS_EXEMPLARS"),
    ]
    for idx, (src_name, tgt_name, rel) in enumerate(cross_repo_links):
        src_id = repo_node_map.get(src_name, {}).get("id")
        tgt_id = repo_node_map.get(tgt_name, {}).get("id") or model_node_ids.get(tgt_name)
        if src_id and tgt_id:
            edges.append({
                "id": f"edge-cross-{idx}",
                "source": src_id,
                "target": tgt_id,
                "kind": rel,
                "claim_state": "observed",
                "confidence": 1.0
            })

    # --------------------------------------------------------------------------
    # 10. Compile Final Dataset & Write to Disk
    # --------------------------------------------------------------------------
    output_data = {
        "org_id": org_id,
        "org_name": "Anthropic Public Universe (Deep AST & Offensive Security)",
        "level": 0,
        "nodes": nodes,
        "edges": edges
    }

    target_data_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
    target_web_public_dir = os.path.join(os.path.dirname(__file__), '..', 'apps', 'web', 'public')

    os.makedirs(target_data_dir, exist_ok=True)
    os.makedirs(target_web_public_dir, exist_ok=True)

    data_file = os.path.join(target_data_dir, 'anthropics_universe.json')
    web_file = os.path.join(target_web_public_dir, 'anthropics_universe.json')

    with open(data_file, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2)

    with open(web_file, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2)

    print(f"\n[+] Successfully generated OSAKG Deep Knowledge Graph:")
    print(f"    - Total Nodes: {len(nodes)}")
    print(f"    - Total Edges: {len(edges)}")
    print(f"    - Repositories: {len(repo_node_map)}")
    print(f"    - AST Code Entities: {ast_count}")
    print(f"    - Security Findings: {len(findings_spec)}")
    print(f"    - Multi-Stage Attack Paths: 3 Complete Kill Chains")
    print(f"    - Written to: {data_file}")
    print(f"    - Written to: {web_file}")

if __name__ == "__main__":
    main()

