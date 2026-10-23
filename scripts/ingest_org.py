#!/usr/bin/env python3
# =====================================================================
# Author: Mauro Risonho de Paula Assumpção
# Create: 2026-10-18
# Update: 2026-10-23
# Short Description: Generic GitHub Organization repository ingestion pipeline for OSAKG
# License: MIT
# =====================================================================

"""
OSAKG Universal Organization Ingestion Pipeline
Fetches all public repositories from any specified GitHub organization or user,
constructs deterministic SHA-256 nodes, edges, packages, trust boundaries,
security findings, and computes a 3D Google-Earth celestial sphere topology.
"""

import argparse
import hashlib
import json
import math
import os
import sys
import urllib.request
import urllib.error

def sha256(*parts):
    h = hashlib.sha256()
    h.update("|".join(str(p) for p in parts).encode('utf-8'))
    return h.hexdigest()

def fetch_json(url, token=None):
    headers = {
        'User-Agent': 'OSAKG-Offensive-Security-Graph/0.3.0',
        'Accept': 'application/vnd.github.v3+json'
    }
    if token:
        headers['Authorization'] = f'Bearer {token}'

    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            return json.loads(resp.read().decode('utf-8')), resp.status
    except urllib.error.HTTPError as e:
        return None, e.code
    except Exception as e:
        print(f"[-] Network error fetching {url}: {e}", file=sys.stderr)
        return None, 500

def get_org_repos(org, token=None, max_repos=100):
    repos = []
    page = 1
    is_user_endpoint = False

    print(f"[*] Discovering repositories for target: '{org}'...")

    while len(repos) < max_repos:
        per_page = min(100, max_repos - len(repos))
        if not is_user_endpoint:
            url = f"https://api.github.com/orgs/{org}/repos?per_page={per_page}&page={page}"
        else:
            url = f"https://api.github.com/users/{org}/repos?per_page={per_page}&page={page}"

        data, status = fetch_json(url, token)

        if status == 404 and not is_user_endpoint:
            # Fallback to users endpoint
            print(f"[*] Target '{org}' not found as Organization. Trying GitHub Users endpoint...")
            is_user_endpoint = True
            page = 1
            continue

        if not data or not isinstance(data, list) or len(data) == 0:
            break

        repos.extend(data)
        print(f"    Page {page}: fetched {len(data)} repos (total: {len(repos)})")
        if len(data) < per_page:
            break
        page += 1

    return repos[:max_repos]

def build_osakg_universe(org_name, repos, tenant_id=None):
    if not tenant_id:
        tenant_id = f"tenant-{org_name.lower()}-public"

    nodes = []
    edges = []

    # 1. Central Organization Node (L0)
    org_id = sha256(tenant_id, "Organization", "github", org_name, "v1")
    nodes.append({
        "id": org_id,
        "name": org_name,
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
            "description": f"OSAKG ingested knowledge graph for {org_name}",
            "url": f"https://github.com/{org_name}",
            "min_level": 0
        }
    })

    # 2. Celestial Trust Boundaries
    boundaries = [
        {"id": "tb-public-ingress", "name": "TrustBoundary: Public Internet Edge", "zone": "Untrusted Public Ingress", "x": 0, "y": 85, "z": 0, "color": "#f43f5e"},
        {"id": "tb-internal-mesh", "name": f"TrustBoundary: {org_name} Internal Mesh", "zone": "Authenticated Core Services", "x": 0, "y": -85, "z": 0, "color": "#ef4444"},
        {"id": "tb-data-tier", "name": "TrustBoundary: Secure Data & Secrets Tier", "zone": "Isolated Storage & Key Vault", "x": 90, "y": 0, "z": 0, "color": "#f59e0b"}
    ]
    for b in boundaries:
        b_node_id = sha256(tenant_id, "TrustBoundary", "perimeter", b["id"], "v1")
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
            "risk_level": "medium",
            "metrics": {"security_zone": b["zone"], "min_level": 0}
        })

    # 3. Security Controls
    controls = [
        {"id": "ctrl-auth", "name": "Control: Identity & Access Gate", "type": "Authentication", "x": 30, "y": 65, "z": 20},
        {"id": "ctrl-audit", "name": "Control: Provenance Audit Ledger", "type": "IntegrityAudit", "x": -30, "y": 65, "z": 20}
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
            "radius": 3.5,
            "color_hint": "#22c55e",
            "claim_state": "observed",
            "risk_level": "low",
            "metrics": {"control_type": c["type"], "min_level": 1}
        })

    # 4. Position Repositories on Fibonacci Celestial Sphere (Radius 70.0)
    sphere_radius = 70.0
    phi_golden = math.pi * (3.0 - math.sqrt(5.0))
    total_repos = max(1, len(repos))

    repo_id_map = {}
    repos_by_lang = {}

    for idx, r in enumerate(repos):
        name = r.get("name", f"repo-{idx}")
        lang = r.get("language") or "Config"
        stars = r.get("stargazers_count", 0)
        forks = r.get("forks_count", 0)
        issues = r.get("open_issues_count", 0)
        archived = r.get("archived", False)
        default_branch = r.get("default_branch", "main")
        description = r.get("description") or f"Repository {name}"

        # Fibonacci spherical coordinate distribution
        y = 1.0 - (idx / max(1, total_repos - 1)) * 2.0
        rad_at_y = math.sqrt(max(0.0, 1.0 - y * y))
        theta = phi_golden * idx

        rx = round(math.cos(theta) * rad_at_y * sphere_radius, 2)
        ry = round(y * sphere_radius, 2)
        rz = round(math.sin(theta) * rad_at_y * sphere_radius, 2)

        color = (
            "#3b82f6" if lang == "Python"
            else "#38bdf8" if lang in ["TypeScript", "JavaScript"]
            else "#f59e0b" if lang == "Rust"
            else "#10b981" if lang == "Go"
            else "#a855f7" if lang in ["Jupyter Notebook", "Julia"]
            else "#ec4899" if lang in ["Ruby", "PHP"]
            else "#06b6d4" if lang in ["C", "C++", "C#"]
            else "#64748b"
        )

        risk = "critical" if archived and issues > 20 else "high" if archived or issues > 50 else "medium" if stars > 1000 else "low"

        repo_node_id = sha256(tenant_id, "Repository", "github", name, default_branch)
        repo_id_map[name] = (repo_node_id, rx, ry, rz)
        repos_by_lang.setdefault(lang, []).append((name, repo_node_id))

        nodes.append({
            "id": repo_node_id,
            "name": name,
            "kind": "Repository",
            "cluster_group": f"lang-{lang.lower().replace(' ', '-')}",
            "x": rx,
            "y": ry,
            "z": rz,
            "radius": 4.5 if stars > 500 else 3.2,
            "color_hint": color,
            "claim_state": "observed",
            "risk_level": risk,
            "metrics": {
                "stars": stars,
                "forks": forks,
                "open_issues": issues,
                "language": lang,
                "archived": archived,
                "default_branch": default_branch,
                "html_url": r.get("html_url", f"https://github.com/{org_name}/{name}"),
                "description": description,
                "min_level": 0
            }
        })

        # Edge: Org -> CONTAINS -> Repo
        edges.append({
            "id": f"edge-org-{name}",
            "source": org_id,
            "target": repo_node_id,
            "kind": "CONTAINS",
            "claim_state": "observed",
            "confidence": 1.0
        })

        # Edge: Repo -> CrossesBoundary -> Internal Mesh
        edges.append({
            "id": f"edge-boundary-{name}",
            "source": repo_node_id,
            "target": sha256(tenant_id, "TrustBoundary", "perimeter", "tb-internal-mesh", "v1"),
            "kind": "CROSSES_BOUNDARY",
            "claim_state": "observed",
            "confidence": 1.0
        })

        # 5. Extract L2 Package & Microservice Component
        pkg_manager = (
            "cargo" if lang == "Rust"
            else "npm" if lang in ["TypeScript", "JavaScript"]
            else "pypi" if lang == "Python"
            else "go" if lang == "Go"
            else "generic"
        )
        pkg_node_id = sha256(tenant_id, "Package", pkg_manager, f"{org_name}/{name}", "pkg")
        nodes.append({
            "id": pkg_node_id,
            "name": f"pkg:{name}",
            "kind": "Package",
            "cluster_group": f"lang-{lang.lower().replace(' ', '-')}",
            "x": round(rx * 0.92, 2),
            "y": round(ry * 0.92 + 2.0, 2),
            "z": round(rz * 0.92, 2),
            "radius": 2.6,
            "color_hint": "#059669",
            "claim_state": "inferred",
            "risk_level": "low",
            "metrics": {
                "package_manager": pkg_manager,
                "language": lang,
                "repo": name,
                "min_level": 1
            }
        })

        edges.append({
            "id": f"edge-repo-pkg-{name}",
            "source": repo_node_id,
            "target": pkg_node_id,
            "kind": "CONTAINS",
            "claim_state": "inferred",
            "confidence": 0.95
        })

        # 6. Extract Security Finding if Archived or High Issues
        if archived:
            finding_id = sha256(tenant_id, "Finding", "policy", f"{org_name}/{name}/archived", "v1")
            nodes.append({
                "id": finding_id,
                "name": f"Archived Unmaintained: {name}",
                "kind": "Finding",
                "cluster_group": "vulnerabilities",
                "x": round(rx * 1.08, 2),
                "y": round(ry * 1.08 + 3.0, 2),
                "z": round(rz * 1.08, 2),
                "radius": 3.0,
                "color_hint": "#ef4444",
                "claim_state": "observed",
                "risk_level": "medium",
                "metrics": {
                    "cvss": 5.3,
                    "cwe": "CWE-1104",
                    "description": "Repository is archived on GitHub; security vulnerabilities will not receive patches.",
                    "min_level": 2
                }
            })
            edges.append({
                "id": f"edge-finding-{name}",
                "source": repo_node_id,
                "target": finding_id,
                "kind": "EXPOSES",
                "claim_state": "observed",
                "confidence": 1.0
            })

    # 7. Cross-repository Heuristic Connections (Rule 6 & 7: ClaimState::Inferred)
    for lang, r_list in repos_by_lang.items():
        if len(r_list) > 1 and lang != "Config":
            for i in range(len(r_list) - 1):
                src_name, src_id = r_list[i]
                dst_name, dst_id = r_list[i + 1]
                edges.append({
                    "id": f"edge-dep-{src_name}-{dst_name}",
                    "source": src_id,
                    "target": dst_id,
                    "kind": "DEPENDS_ON",
                    "claim_state": "inferred",
                    "confidence": 0.70
                })

    universe = {
        "org_id": org_id,
        "org_name": org_name,
        "level": 0,
        "nodes": nodes,
        "edges": edges,
        "metadata": {
            "total_nodes": len(nodes),
            "total_edges": len(edges),
            "repositories_indexed": len(repos),
            "generator": "osakg-universal-ingest",
            "version": "0.3.0"
        }
    }
    return universe

def main():
    parser = argparse.ArgumentParser(description="OSAKG Universal Organization Ingestion Pipeline")
    parser.add_argument("--org", required=True, help="GitHub Organization or User account name (e.g. anthropics, pallets, torvalds)")
    parser.add_argument("--token", default=os.getenv("GITHUB_TOKEN"), help="GitHub Personal Access Token (optional, avoids rate limits)")
    parser.add_argument("--max-repos", type=int, default=100, help="Maximum number of repositories to ingest (default: 100)")
    parser.add_argument("--output", help="Custom output JSON path (default: data/<org>_universe.json and apps/web/public/<org>_universe.json)")
    args = parser.parse_args()

    org = args.org.strip()
    token = args.token

    repos = get_org_repos(org, token=token, max_repos=args.max_repos)
    if not repos:
        print(f"[-] No repositories found for target '{org}' (or rate limit reached).", file=sys.stderr)
        sys.exit(1)

    print(f"[+] Successfully fetched {len(repos)} repositories from GitHub.")
    universe = build_osakg_universe(org, repos)

    print(f"[+] Ingestion complete: {len(universe['nodes'])} nodes and {len(universe['edges'])} edges generated.")

    # Determine output destinations
    destinations = []
    if args.output:
        destinations.append(args.output)
    else:
        root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        destinations.append(os.path.join(root_dir, "data", f"{org.lower()}_universe.json"))
        destinations.append(os.path.join(root_dir, "apps", "web", "public", f"{org.lower()}_universe.json"))

    for dest in destinations:
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        with open(dest, "w", encoding="utf-8") as f:
            json.dump(universe, f, indent=2, ensure_ascii=False)
        print(f"[+] Saved universe dataset to: {dest}")

if __name__ == "__main__":
    main()

