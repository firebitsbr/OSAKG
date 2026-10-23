import React from 'react';
import { UniverseNodeSpatial, UniverseEdgeSpatial, ClaimState } from '../types';
import { NodeColors, UITheme } from '../theme';

interface Graph2DProps {
  nodes: UniverseNodeSpatial[];
  edges: UniverseEdgeSpatial[];
  selectedNode: UniverseNodeSpatial | null;
  onSelectNode: (node: UniverseNodeSpatial) => void;
  filterClaim: ClaimState | 'all';
  theme: UITheme;
  nodeColors: NodeColors;
}

export const Graph2D: React.FC<Graph2DProps> = ({
  nodes,
  edges,
  selectedNode,
  onSelectNode,
  filterClaim,
  theme,
  nodeColors,
}) => {
  const visibleNodes = nodes.filter(
    (n) => filterClaim === 'all' || n.claim_state === filterClaim
  );
  const nodeMap = new Map(visibleNodes.map((n) => [n.id, n]));

  // Project 3D coordinates (x, y, z) into 2D canvas space (w, h)
  const width = 1000;
  const height = 700;
  const centerX = width / 2;
  const centerY = height / 2;
  const scale = 5.2;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: theme.bgMain,
        overflow: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{
          width: '100%',
          maxWidth: '1100px',
          height: 'auto',
          backgroundColor: theme.bgPanel,
          borderRadius: '12px',
          border: `1px solid ${theme.border}`,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
        }}
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke={theme.borderSubtle} strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Edges */}
        {edges.map((edge) => {
          const s = nodeMap.get(edge.source);
          const t = nodeMap.get(edge.target);
          if (!s || !t) return null;
          if (filterClaim !== 'all' && edge.claim_state !== filterClaim) return null;

          const sx = centerX + s.x * scale;
          const sy = centerY + s.y * scale;
          const tx = centerX + t.x * scale;
          const ty = centerY + t.y * scale;

          const isAttack = (edge as any).is_attack_path;
          const edgeColor = isAttack
            ? '#ef4444'
            : edge.claim_state === 'observed'
            ? '#38bdf8'
            : edge.claim_state === 'validated'
            ? '#22c55e'
            : '#f59e0b';

          return (
            <line
              key={edge.id}
              x1={sx}
              y1={sy}
              x2={tx}
              y2={ty}
              stroke={edgeColor}
              strokeWidth={isAttack ? 2.5 : 1}
              strokeOpacity={isAttack ? 0.95 : (theme.mode === 'dark' ? 0.35 : 0.45)}
            />
          );
        })}

        {/* Nodes */}
        {visibleNodes.map((n) => {
          const nx = centerX + n.x * scale;
          const ny = centerY + n.y * scale;
          const isSelected = selectedNode?.id === n.id;
          const r = Math.max(4, n.radius * 2.2);
          const fillHex = nodeColors[n.kind] || n.color_hint;

          return (
            <g
              key={n.id}
              transform={`translate(${nx}, ${ny})`}
              onClick={() => onSelectNode(n)}
              style={{ cursor: 'pointer' }}
            >
              {isSelected && (
                <circle
                  r={r + 5}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                />
              )}
              <circle
                r={r}
                fill={fillHex}
                fillOpacity="0.88"
                stroke={isSelected ? '#ffffff' : (theme.mode === 'dark' ? '#0f172a' : '#ffffff')}
                strokeWidth="1.5"
              />
              {(n.kind === 'Repository' || n.kind === 'AIModel' || n.kind === 'Finding' || isSelected) && (
                <text
                  y={r + 14}
                  textAnchor="middle"
                  fill={theme.textPrimary}
                  fontSize="10px"
                  fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
                  fontWeight={isSelected ? 'bold' : 'normal'}
                >
                  {n.name}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
