export type ClaimState = 'observed' | 'inferred' | 'validated' | 'refuted';

export interface UniverseNodeSpatial {
  id: string;
  name: string;
  kind: string;
  cluster_group: string;
  x: number;
  y: number;
  z: number;
  radius: number;
  color_hint: string;
  claim_state: ClaimState;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  metrics: {
    evidence_count?: number;
    confidence?: number;
    [key: string]: unknown;
  };
}

export interface UniverseEdgeSpatial {
  id: string;
  source: string;
  target: string;
  kind: string;
  claim_state: ClaimState;
  confidence: number;
}

export interface UniverseTileResponse {
  org_id: string;
  org_name: string;
  level: number;
  nodes: UniverseNodeSpatial[];
  edges: UniverseEdgeSpatial[];
}

export interface EvidenceRecord {
  id: string;
  tenant_id: string;
  source_repo: string;
  commit_sha: string;
  file_path?: string;
  start_line?: number;
  end_line?: number;
  analyzer: string;
  analyzer_version: string;
  detected_at: string;
  claim_state: ClaimState;
  confidence: number;
  evidence_ids: string[];
  snippet?: string;
  rationale?: string;
}

export interface GraphNode {
  id: string;
  tenant_id: string;
  kind: string;
  canonical_source: string;
  qualified_name: string;
  display_name: string;
  commit_or_snapshot: string;
  claim_state: ClaimState;
  confidence: number;
  evidence_ids: string[];
  properties: Record<string, unknown>;
}

export interface GraphEdge {
  id: string;
  tenant_id: string;
  kind: string;
  source: string;
  target: string;
  claim_state: ClaimState;
  confidence: number;
  evidence_ids: string[];
  properties: Record<string, unknown>;
}

export interface NeighborhoodResponse {
  root_id: string;
  depth: number;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

