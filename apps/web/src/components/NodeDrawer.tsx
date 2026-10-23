import React, { useEffect, useState } from 'react';
import { UniverseNodeSpatial, EvidenceRecord, NeighborhoodResponse } from '../types';
import { fetchEvidence, fetchNeighborhood } from '../api';
import { Shield, ExternalLink, X, Copy, Check, FileCode, GitFork, AlertTriangle, Info, Network } from 'lucide-react';
import { NodeColors, UITheme } from '../theme';

interface NodeDrawerProps {
  node: UniverseNodeSpatial | null;
  onClose: () => void;
  onSelectNeighbor: (neighborId: string) => void;
  theme: UITheme;
  nodeColors: NodeColors;
}

type TabType = 'overview' | 'security' | 'evidence' | 'relations';

export const NodeDrawer: React.FC<NodeDrawerProps> = ({
  node,
  onClose,
  onSelectNeighbor,
  theme,
  nodeColors,
}) => {
  const [evidenceList, setEvidenceList] = useState<EvidenceRecord[]>([]);
  const [neighborhood, setNeighborhood] = useState<NeighborhoodResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    if (!node) {
      setEvidenceList([]);
      setNeighborhood(null);
      return;
    }

    // Default to security tab if it's a finding
    if (node.kind === 'Finding' || Boolean(node.metrics?.cvss)) {
      setActiveTab('security');
    } else {
      setActiveTab('overview');
    }

    setLoading(true);
    Promise.all([
      fetchNeighborhood(node.id, 1),
      fetchEvidence(`ev-${node.id}`),
    ])
      .then(([nb, ev]) => {
        setNeighborhood(nb);
        setEvidenceList([ev]);
      })
      .finally(() => setLoading(false));
  }, [node]);

  if (!node) return null;

  const nodeColor = nodeColors[node.kind] || node.color_hint;

  const handleCopyId = () => {
    navigator.clipboard.writeText(node.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 1800);
  };

  const claimBadge = (state: string) => {
    switch (state) {
      case 'observed':
        return <span style={{ backgroundColor: '#0284c7', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>Observed</span>;
      case 'validated':
        return <span style={{ backgroundColor: '#16a34a', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>Validated</span>;
      case 'refuted':
        return <span style={{ backgroundColor: '#dc2626', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>Refuted</span>;
      default:
        return <span style={{ backgroundColor: '#d97706', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>Inferred</span>;
    }
  };

  const riskBadge = (level: string) => {
    const bg = level === 'critical' ? '#ef4444' : level === 'high' ? '#f97316' : level === 'medium' ? '#eab308' : '#22c55e';
    return (
      <span
        style={{
          backgroundColor: bg,
          color: '#ffffff',
          fontWeight: 800,
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '10px',
          letterSpacing: '0.04em',
        }}
      >
        {level.toUpperCase()}
      </span>
    );
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '460px',
        maxWidth: '90vw',
        height: '100%',
        backgroundColor: theme.bgPanel,
        backdropFilter: 'blur(16px)',
        borderLeft: `1px solid ${theme.border}`,
        boxShadow: '-15px 0 40px rgba(0,0,0,0.4)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* 1. Header with Breadcrumb & Close */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          borderBottom: `1px solid ${theme.border}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          backgroundColor: theme.bgSubtle,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: nodeColor,
              }}
            />
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: nodeColor, fontWeight: 700, letterSpacing: '0.05em' }}>
              {node.kind}
            </span>
            <span style={{ fontSize: '11px', color: theme.textMuted }}>•</span>
            <span style={{ fontSize: '11px', color: theme.textMuted }}>{node.cluster_group}</span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: theme.textSecondary,
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <h2
          style={{
            fontSize: '1.25rem',
            color: theme.textPrimary,
            margin: 0,
            fontWeight: 800,
            wordBreak: 'break-word',
            letterSpacing: '-0.01em',
          }}
        >
          {node.name}
        </h2>

        {/* Badges strip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
          {claimBadge(node.claim_state)}
          {riskBadge(node.risk_level)}
          <button
            onClick={handleCopyId}
            title="Copiar Deterministic Node ID"
            style={{
              marginLeft: 'auto',
              background: 'transparent',
              border: `1px solid ${theme.borderSubtle}`,
              borderRadius: '4px',
              padding: '2px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: copiedId ? '#10b981' : theme.textMuted,
              fontSize: '10px',
              cursor: 'pointer',
            }}
          >
            {copiedId ? <Check size={11} /> : <Copy size={11} />}
            <span>{copiedId ? 'Copiado' : 'ID'}</span>
          </button>
        </div>
      </div>

      {/* 2. Enterprise Tabs Navigation */}
      <div
        style={{
          display: 'flex',
          borderBottom: `1px solid ${theme.border}`,
          backgroundColor: theme.bgMain,
          padding: '0 1rem',
        }}
      >
        {[
          { id: 'overview', label: 'Resumo', icon: Info },
          { id: 'security', label: 'Segurança & Risco', icon: AlertTriangle },
          { id: 'evidence', label: 'Evidência AST', icon: FileCode },
          { id: 'relations', label: `Conexões (${neighborhood?.edges.length || 0})`, icon: Network },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 12px',
                background: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid #38bdf8' : '2px solid transparent',
                color: isActive ? '#38bdf8' : theme.textMuted,
                fontSize: '12px',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
              }}
            >
              <Icon size={13} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Tab Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Description Card */}
            {Boolean(node.metrics?.description) && (
              <div
                style={{
                  backgroundColor: theme.bgSubtle,
                  borderRadius: '8px',
                  padding: '12px 14px',
                  border: `1px solid ${theme.borderSubtle}`,
                  fontSize: '12px',
                  color: theme.textSecondary,
                  lineHeight: 1.5,
                }}
              >
                {String(node.metrics.description)}
              </div>
            )}

            {/* Properties Table */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: theme.textMuted, fontWeight: 700 }}>
                Metadados & Propriedades
              </span>
              <div
                style={{
                  backgroundColor: theme.bgSubtle,
                  border: `1px solid ${theme.borderSubtle}`,
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}
              >
                {Object.entries(node.metrics || {})
                  .filter(([k]) => !['snippet', 'rationale', 'title', 'description'].includes(k))
                  .map(([key, val], idx) => (
                    <div
                      key={key}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderBottom: idx > 0 ? `1px solid ${theme.borderSubtle}` : 'none',
                        fontSize: '12px',
                      }}
                    >
                      <span style={{ color: theme.textMuted, textTransform: 'capitalize' }}>
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span style={{ color: theme.textPrimary, fontFamily: typeof val === 'number' ? 'monospace' : 'inherit', fontWeight: 500 }}>
                        {String(val)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Confidence Score Bar */}
            <div style={{ backgroundColor: theme.bgSubtle, padding: '12px', borderRadius: '8px', border: `1px solid ${theme.borderSubtle}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: theme.textSecondary, marginBottom: '6px' }}>
                <span style={{ fontWeight: 600 }}>Índice de Confiança Heurística</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#38bdf8' }}>
                  {((node.metrics.confidence as number || 1.0) * 100).toFixed(0)}%
                </span>
              </div>
              <div style={{ height: '6px', backgroundColor: theme.mode === 'dark' ? '#080c14' : '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${(node.metrics.confidence as number || 1.0) * 100}%`,
                    backgroundColor: '#38bdf8',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* CVSS Score Gauge */}
            {Boolean(node.metrics?.cvss) ? (
              <div
                style={{
                  backgroundColor: theme.mode === 'dark' ? '#450a0a' : '#fef2f2',
                  border: '1px solid #ef4444',
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Vulnerabilidade Confirmada
                  </span>
                  <span
                    style={{
                      backgroundColor: '#ef4444',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '12px',
                      padding: '3px 10px',
                      borderRadius: '6px',
                    }}
                  >
                    CVSS {String(node.metrics.cvss)}
                  </span>
                </div>

                {Boolean(node.metrics?.title) && (
                  <div style={{ fontSize: '14px', fontWeight: 700, color: theme.mode === 'dark' ? '#fee2e2' : '#991b1b', lineHeight: 1.4 }}>
                    {String(node.metrics.title)}
                  </div>
                )}

                {Boolean(node.metrics?.cwe) && (
                  <div style={{ fontSize: '11px', color: '#ef4444', fontFamily: 'monospace' }}>
                    Classificação: {String(node.metrics.cwe)}
                  </div>
                )}

                {Boolean(node.metrics?.rationale) && (
                  <div style={{ fontSize: '12px', color: theme.mode === 'dark' ? '#fca5a5' : '#7f1d1d', lineHeight: 1.4, marginTop: '4px' }}>
                    {String(node.metrics.rationale)}
                  </div>
                )}
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: theme.bgSubtle,
                  borderRadius: '8px',
                  padding: '16px',
                  border: `1px solid ${theme.borderSubtle}`,
                  textAlign: 'center',
                  color: theme.textMuted,
                  fontSize: '12px',
                }}
              >
                Nenhuma vulnerabilidade direta associada a este nó no momento.
              </div>
            )}

            {/* Blast radius & posture */}
            <div style={{ backgroundColor: theme.bgSubtle, padding: '14px', borderRadius: '8px', border: `1px solid ${theme.borderSubtle}` }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: theme.textMuted, fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                Postura Defensiva
              </span>
              <div style={{ fontSize: '12px', color: theme.textSecondary, lineHeight: 1.4 }}>
                Ativo verificado através de análise estática sem envio de credenciais a servidores remotos.
                Permissão de auditoria: <strong>Passiva Local</strong>.
              </div>
            </div>
          </div>
        )}

        {activeTab === 'evidence' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {loading ? (
              <div style={{ fontSize: '12px', color: theme.textMuted, textAlign: 'center', padding: '2rem' }}>
                Carregando rastreio de evidência...
              </div>
            ) : (
              evidenceList.map((ev) => (
                <div
                  key={ev.id}
                  style={{
                    backgroundColor: theme.bgSubtle,
                    border: `1px solid ${theme.borderSubtle}`,
                    borderRadius: '8px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: theme.textMuted }}>
                    <span>Analisador: {ev.analyzer} v{ev.analyzer_version}</span>
                    <span>{new Date(ev.detected_at).toLocaleDateString()}</span>
                  </div>

                  {ev.file_path && (
                    <div style={{ fontSize: '12px', color: '#38bdf8', fontFamily: 'monospace', fontWeight: 600 }}>
                      {ev.file_path}:{ev.start_line}-{ev.end_line}
                    </div>
                  )}

                  {ev.rationale && (
                    <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                      {ev.rationale}
                    </div>
                  )}

                  {ev.snippet && (
                    <pre
                      style={{
                        margin: '6px 0 0 0',
                        padding: '10px 12px',
                        backgroundColor: theme.mode === 'dark' ? '#040711' : '#0f172a',
                        borderRadius: '6px',
                        fontSize: '11px',
                        color: '#93c5fd',
                        overflowX: 'auto',
                        fontFamily: 'JetBrains Mono, monospace',
                        lineHeight: 1.5,
                      }}
                    >
                      {ev.snippet}
                    </pre>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'relations' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {neighborhood && neighborhood.edges.length > 0 ? (
              neighborhood.edges.map((e) => {
                const isTarget = e.source === node.id;
                const neighborId = isTarget ? e.target : e.source;
                const rel = isTarget ? `→ ${e.kind} →` : `← ${e.kind} ←`;
                const isAttack = (e as any).is_attack_path;
                return (
                  <div
                    key={e.id}
                    onClick={() => onSelectNeighbor(neighborId)}
                    style={{
                      padding: '10px 12px',
                      backgroundColor: theme.bgSubtle,
                      borderRadius: '8px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: isAttack ? '1px solid #ef4444' : `1px solid ${theme.borderSubtle}`,
                    }}
                    onMouseEnter={(ev) => ((ev.currentTarget as HTMLElement).style.borderColor = '#38bdf8')}
                    onMouseLeave={(ev) => ((ev.currentTarget as HTMLElement).style.borderColor = isAttack ? '#ef4444' : theme.borderSubtle)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <span style={{ color: isAttack ? '#ef4444' : '#38bdf8', fontFamily: 'monospace', fontSize: '11px' }}>
                        {rel}
                      </span>
                      <span style={{ color: theme.textPrimary, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {neighborId}
                      </span>
                    </div>
                    <ExternalLink size={13} color={theme.textMuted} />
                  </div>
                );
              })
            ) : (
              <div style={{ color: theme.textMuted, fontSize: '12px', textAlign: 'center', padding: '2rem' }}>
                Nenhuma conexão direta encontrada para este nó.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
