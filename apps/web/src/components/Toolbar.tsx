// =====================================================================
// Author: Mauro Risonho de Paula Assumpção
// Create: 2026-10-18
// Update: 2026-10-23
// Short Description: Viewport navigation toolbar with zoom controls, centering, and perspective toggle
// License: MIT
// =====================================================================

import React from 'react';
import { ClaimState } from '../types';
import { Globe, Layers, Search, RefreshCw, Filter, ShieldAlert, Sun, Moon, Palette } from 'lucide-react';
import { ThemeMode, UITheme } from '../theme';

export type KindFilter = 'all' | 'repos' | 'structure' | 'code' | 'apis' | 'data' | 'security' | 'ai';

interface ToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filterClaim: ClaimState | 'all';
  onFilterClaimChange: (c: ClaimState | 'all') => void;
  filterKind: KindFilter;
  onFilterKindChange: (k: KindFilter) => void;
  viewMode: '3D' | '2D';
  onToggleViewMode: () => void;
  onRefresh: () => void;
  zoomLevel: number;
  onZoomLevelChange: (lvl: number) => void;
  nodeCount: number;
  totalNodes: number;
  showAttackPaths?: boolean;
  onToggleAttackPaths?: () => void;
  theme: UITheme;
  themeMode: ThemeMode;
  onToggleThemeMode: () => void;
  onOpenColorModal: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  searchQuery,
  onSearchChange,
  filterClaim,
  onFilterClaimChange,
  filterKind,
  onFilterKindChange,
  viewMode,
  onToggleViewMode,
  onRefresh,
  zoomLevel,
  onZoomLevelChange,
  nodeCount,
  totalNodes,
  showAttackPaths = false,
  onToggleAttackPaths,
  theme,
  themeMode,
  onToggleThemeMode,
  onOpenColorModal,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '64px',
        backgroundColor: theme.bgPanel,
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${theme.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.25rem',
        zIndex: 40,
        gap: '0.75rem',
      }}
    >
      {/* Brand & Zoom Levels */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Globe size={20} color="#38bdf8" />
          <span style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.04em', color: theme.textPrimary }}>
            OSAKG <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#38bdf8' }}>Graph</span>
          </span>
        </div>

        {/* Semantic Zoom L0 - L3 */}
        <div
          style={{
            display: 'flex',
            backgroundColor: theme.bgSubtle,
            padding: '3px',
            borderRadius: '6px',
            border: `1px solid ${theme.border}`,
          }}
        >
          {[
            { lvl: 0, label: 'L0 Org' },
            { lvl: 1, label: 'L1 Repos' },
            { lvl: 2, label: 'L2 Modules' },
            { lvl: 3, label: 'L3 Code AST' },
          ].map((item) => (
            <button
              key={item.lvl}
              onClick={() => onZoomLevelChange(item.lvl)}
              style={{
                background: zoomLevel === item.lvl ? (theme.mode === 'dark' ? '#334155' : '#cbd5e1') : 'transparent',
                color: zoomLevel === item.lvl ? '#38bdf8' : theme.textSecondary,
                border: 'none',
                borderRadius: '4px',
                padding: '3px 8px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Node Kind Granular Filter Chips */}
        <div
          style={{
            display: 'flex',
            gap: '3px',
            backgroundColor: theme.bgSubtle,
            padding: '3px',
            borderRadius: '6px',
            border: `1px solid ${theme.border}`,
          }}
        >
          {[
            { id: 'all', label: 'All' },
            { id: 'repos', label: 'Repos' },
            { id: 'structure', label: 'Files/Dirs' },
            { id: 'code', label: 'Functions/Classes' },
            { id: 'apis', label: 'APIs' },
            { id: 'data', label: 'Data' },
            { id: 'security', label: 'Controls/Findings' },
            { id: 'ai', label: 'AI Agents' },
          ].map((k) => (
            <button
              key={k.id}
              onClick={() => onFilterKindChange(k.id as KindFilter)}
              style={{
                background: filterKind === k.id ? (theme.mode === 'dark' ? '#334155' : '#cbd5e1') : 'transparent',
                color: filterKind === k.id ? '#38bdf8' : theme.textSecondary,
                border: 'none',
                borderRadius: '4px',
                padding: '3px 8px',
                fontSize: '11px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              {k.label}
            </button>
          ))}
        </div>
      </div>

      {/* Center: Search & Node Counter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ position: 'relative', width: '200px' }}>
          <Search size={14} color={theme.textMuted} style={{ position: 'absolute', left: '10px', top: '9px' }} />
          <input
            type="text"
            placeholder="Pesquisar nós..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: '100%',
              height: '32px',
              backgroundColor: theme.bgSubtle,
              border: `1px solid ${theme.border}`,
              borderRadius: '6px',
              padding: '0 10px 0 30px',
              color: theme.textPrimary,
              fontSize: '11px',
              outline: 'none',
            }}
          />
        </div>
        <span style={{ fontSize: '11px', color: theme.textMuted, whiteSpace: 'nowrap' }}>
          {nodeCount} / {totalNodes} nós
        </span>
      </div>

      {/* Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* Claim State Filter */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            backgroundColor: theme.bgSubtle,
            padding: '2px 4px',
            borderRadius: '6px',
            border: `1px solid ${theme.border}`,
          }}
        >
          <Filter size={12} color={theme.textMuted} />
          {(['all', 'observed', 'inferred', 'validated'] as const).map((claim) => (
            <button
              key={claim}
              onClick={() => onFilterClaimChange(claim)}
              style={{
                background: filterClaim === claim ? (theme.mode === 'dark' ? '#334155' : '#cbd5e1') : 'transparent',
                color: filterClaim === claim ? '#38bdf8' : theme.textSecondary,
                border: 'none',
                borderRadius: '4px',
                padding: '2px 6px',
                fontSize: '11px',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {claim}
            </button>
          ))}
        </div>

        {/* Attack Paths (OSAKG Offensive Overlay) */}
        <button
          onClick={onToggleAttackPaths}
          title="Alternar Overlay Tático de Attack Paths (Atalho: A)"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            backgroundColor: showAttackPaths ? '#7f1d1d' : theme.bgSubtle,
            border: showAttackPaths ? '1px solid #ef4444' : `1px solid ${theme.border}`,
            color: showAttackPaths ? '#fca5a5' : theme.textPrimary,
            padding: '5px 9px',
            borderRadius: '6px',
            fontSize: '11px',
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'all 0.15s ease',
          }}
        >
          <ShieldAlert size={13} color={showAttackPaths ? '#ef4444' : '#f87171'} />
          <span>Attack Paths</span>
          {showAttackPaths && (
            <span
              style={{
                backgroundColor: '#ef4444',
                color: '#ffffff',
                borderRadius: '8px',
                padding: '0 5px',
                fontSize: '9px',
                fontWeight: 700,
              }}
            >
              ATIVO
            </span>
          )}
        </button>

        {/* 2D / 3D Toggle */}
        <button
          onClick={onToggleViewMode}
          title="Alternar entre visualização 3D e 2D (Atalhos: 1 e 2)"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            backgroundColor: theme.bgSubtle,
            border: `1px solid ${theme.border}`,
            color: theme.textPrimary,
            padding: '5px 9px',
            borderRadius: '6px',
            fontSize: '11px',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          <Layers size={13} color="#38bdf8" />
          {viewMode === '3D' ? '2D' : '3D'}
        </button>

        {/* Color Customizer Button */}
        <button
          onClick={onOpenColorModal}
          title="Personalizar Cores e Paletas"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            backgroundColor: theme.bgSubtle,
            border: `1px solid ${theme.border}`,
            color: theme.textPrimary,
            padding: '5px 9px',
            borderRadius: '6px',
            fontSize: '11px',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          <Palette size={13} color="#a855f7" />
          <span>Cores</span>
        </button>

        {/* Dark / Light Mode Toggle Button */}
        <button
          onClick={onToggleThemeMode}
          title={themeMode === 'dark' ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            backgroundColor: theme.bgSubtle,
            border: `1px solid ${theme.border}`,
            color: themeMode === 'dark' ? '#fbbf24' : '#0284c7',
            borderRadius: '6px',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          {themeMode === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Refresh / Ingest */}
        <button
          onClick={onRefresh}
          title="Recarregar Grafo"
          style={{
            backgroundColor: '#0284c7',
            border: 'none',
            color: '#ffffff',
            padding: '5px 10px',
            borderRadius: '6px',
            fontSize: '11px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontWeight: 500,
          }}
        >
          <RefreshCw size={12} />
          Sync
        </button>
      </div>
    </div>
  );
};
