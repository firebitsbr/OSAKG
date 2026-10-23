// =====================================================================
// Author: Mauro Risonho de Paula Assumpção
// Create: 2026-10-18
// Update: 2026-10-23
// Short Description: Keyboard-driven spotlight command palette (Ctrl+K) for quick navigation
// License: MIT
// =====================================================================

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, CornerDownLeft, ShieldAlert, Code, Folder, Database, Globe } from 'lucide-react';
import { UniverseNodeSpatial } from '../types';
import { NodeColors, UITheme } from '../theme';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: UniverseNodeSpatial[];
  onSelectNode: (node: UniverseNodeSpatial) => void;
  theme: UITheme;
  nodeColors: NodeColors;
  onOpenIngestModal?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  nodes,
  onSelectNode,
  theme,
  nodeColors,
  onOpenIngestModal,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filtered = React.useMemo(() => {
    if (!query.trim()) {
      // Show top prominent repos and findings first
      return nodes
        .filter((n) => n.kind === 'Repository' || n.kind === 'Finding' || n.kind === 'AIModel')
        .slice(0, 15);
    }
    const q = query.toLowerCase();
    return nodes
      .filter(
        (n) =>
          n.name.toLowerCase().includes(q) ||
          n.kind.toLowerCase().includes(q) ||
          n.cluster_group.toLowerCase().includes(q) ||
          (n.metrics?.path && String(n.metrics.path).toLowerCase().includes(q))
      )
      .slice(0, 25);
  }, [nodes, query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        onSelectNode(filtered[selectedIndex]);
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)',
        zIndex: 150,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '10vh',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '640px',
          maxWidth: '92vw',
          backgroundColor: theme.mode === 'dark' ? '#0d1321' : '#ffffff',
          color: theme.textPrimary,
          border: `1px solid ${theme.border}`,
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '14px 18px',
            borderBottom: `1px solid ${theme.borderSubtle}`,
            gap: '12px',
          }}
        >
          <Search size={18} color="#38bdf8" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Pesquisar ativos, repositórios, funções AST, CVEs..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: theme.textPrimary,
              fontSize: '14px',
              fontFamily: 'inherit',
            }}
          />
          <span
            style={{
              fontSize: '11px',
              backgroundColor: theme.bgSubtle,
              border: `1px solid ${theme.borderSubtle}`,
              color: theme.textMuted,
              padding: '2px 6px',
              borderRadius: '4px',
            }}
          >
            ESC para fechar
          </span>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '6px' }}>
          {onOpenIngestModal && (
            <div
              onClick={() => {
                onClose();
                onOpenIngestModal();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(56, 189, 248, 0.08)',
                border: '1px dashed rgba(56, 189, 248, 0.4)',
                marginBottom: '6px',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Globe size={16} color="#38bdf8" />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#38bdf8' }}>
                  + Ingerir Nova Organização GitHub...
                </span>
              </div>
              <span style={{ fontSize: '11px', color: theme.textMuted }}>Carregar repositórios</span>
            </div>
          )}
          {filtered.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: theme.textMuted, fontSize: '13px' }}>
              Nenhum ativo encontrado para "{query}"
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const color = nodeColors[item.kind] || '#38bdf8';
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectNode(item);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    backgroundColor: isSelected ? (theme.mode === 'dark' ? '#1a263d' : '#f1f5f9') : 'transparent',
                    cursor: 'pointer',
                    transition: 'background-color 0.1s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: color,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: isSelected ? '#38bdf8' : theme.textPrimary,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.name}
                      </span>
                      <span style={{ fontSize: '11px', color: theme.textMuted }}>
                        {item.cluster_group}
                        {item.metrics?.path ? ` • ${String(item.metrics.path)}` : ''}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: theme.bgSubtle,
                        color: color,
                      }}
                    >
                      {item.kind}
                    </span>
                    {item.risk_level === 'critical' && (
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: '#ef4444',
                          color: '#ffffff',
                        }}
                      >
                        CRITICAL
                      </span>
                    )}
                    {isSelected && <CornerDownLeft size={14} color="#38bdf8" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div
          style={{
            padding: '8px 16px',
            backgroundColor: theme.bgSubtle,
            borderTop: `1px solid ${theme.borderSubtle}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: theme.textMuted,
          }}
        >
          <div style={{ display: 'flex', gap: '12px' }}>
            <span>↑↓ Navegar</span>
            <span>↵ Selecionar e Voar</span>
          </div>
          <span>Total Indexado: {nodes.length} nós</span>
        </div>
      </div>
    </div>
  );
};

