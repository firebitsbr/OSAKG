import React from 'react';
import { Shield, Search, Layers, RefreshCw, Sun, Moon, Palette, ShieldAlert, Filter, Activity } from 'lucide-react';
import { ClaimState } from '../types';
import { ThemeMode, UITheme } from '../theme';

export type KindFilter = 'all' | 'repos' | 'structure' | 'code' | 'apis' | 'data' | 'security' | 'ai';

interface EnterpriseHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenCommandPalette: () => void;
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
  criticalCount: number;
  showAttackPaths?: boolean;
  onToggleAttackPaths?: () => void;
  theme: UITheme;
  themeMode: ThemeMode;
  onToggleThemeMode: () => void;
  onOpenColorModal: () => void;
}

export const EnterpriseHeader: React.FC<EnterpriseHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenCommandPalette,
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
  criticalCount,
  showAttackPaths = false,
  onToggleAttackPaths,
  theme,
  themeMode,
  onToggleThemeMode,
  onOpenColorModal,
}) => {
  return (
    <>
      {/* 1. Main Top Corporate App Bar */}
      <header
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '56px',
          backgroundColor: theme.bgPanel,
          backdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${theme.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.5rem',
          zIndex: 40,
        }}
      >
        {/* Left: Brand Identity & Tenant Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                backgroundColor: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(2, 132, 199, 0.4)',
              }}
            >
              <Shield size={18} color="#ffffff" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 800, fontSize: '0.92rem', letterSpacing: '0.04em', color: theme.textPrimary }}>
                OSAKG <span style={{ fontWeight: 500, fontSize: '0.72rem', color: '#38bdf8' }}>ENTERPRISE</span>
              </span>
              <span style={{ fontSize: '10px', color: theme.textMuted, letterSpacing: '0.02em' }}>
                Offensive Security Knowledge Graph
              </span>
            </div>
          </div>

          <div style={{ width: '1px', height: '24px', backgroundColor: theme.border }} />

          {/* Organization Tenant Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: theme.bgSubtle,
              border: `1px solid ${theme.borderSubtle}`,
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              color: theme.textSecondary,
              fontFamily: 'monospace',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                boxShadow: '0 0 8px #10b981',
              }}
            />
            <span>TENANT: anthropics-public</span>
          </div>
        </div>

        {/* Center: Command Palette Trigger Input */}
        <button
          onClick={onOpenCommandPalette}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '320px',
            height: '34px',
            backgroundColor: theme.bgSubtle,
            border: `1px solid ${theme.border}`,
            borderRadius: '8px',
            padding: '0 12px',
            color: theme.textMuted,
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'border-color 0.15s ease',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = '#38bdf8')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = theme.border)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={14} color={theme.textMuted} />
            <span>Buscar ativos ou CVEs...</span>
          </div>
          <kbd
            style={{
              backgroundColor: theme.mode === 'dark' ? '#080c14' : '#e2e8f0',
              border: `1px solid ${theme.border}`,
              borderRadius: '4px',
              padding: '1px 5px',
              fontSize: '10px',
              fontFamily: 'monospace',
              color: theme.textSecondary,
            }}
          >
            ⌘K
          </kbd>
        </button>

        {/* Right: Security Telemetry KPI & Global Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Telemetry Chips */}
          <div style={{ display: 'flex', gap: '6px', marginRight: '6px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 8px',
                backgroundColor: theme.bgSubtle,
                borderRadius: '6px',
                fontSize: '11px',
                color: theme.textSecondary,
                border: `1px solid ${theme.borderSubtle}`,
              }}
            >
              <Activity size={12} color="#38bdf8" />
              <span>{totalNodes} Ativos</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 8px',
                backgroundColor: theme.mode === 'dark' ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2',
                borderRadius: '6px',
                fontSize: '11px',
                color: '#ef4444',
                fontWeight: 600,
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
              <span>{criticalCount} Críticos</span>
            </div>
          </div>

          {/* Tactical Attack Paths Toggle */}
          <button
            onClick={onToggleAttackPaths}
            title="Alternar Overlay Tático de Kill Chains (Atalho: A)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: showAttackPaths ? '#7f1d1d' : theme.bgSubtle,
              border: showAttackPaths ? '1px solid #ef4444' : `1px solid ${theme.border}`,
              color: showAttackPaths ? '#fca5a5' : theme.textPrimary,
              padding: '5px 11px',
              borderRadius: '6px',
              fontSize: '11px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            <ShieldAlert size={13} color={showAttackPaths ? '#ef4444' : '#f87171'} />
            <span>Attack Paths</span>
            {showAttackPaths && (
              <span
                style={{
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  borderRadius: '10px',
                  padding: '0 5px',
                  fontSize: '9px',
                  fontWeight: 800,
                }}
              >
                LIVE
              </span>
            )}
          </button>

          {/* 3D / 2D View Switcher */}
          <button
            onClick={onToggleViewMode}
            title="Alternar entre 3D e 2D (Atalhos: 1 e 2)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              backgroundColor: theme.bgSubtle,
              border: `1px solid ${theme.border}`,
              color: theme.textPrimary,
              padding: '5px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            <Layers size={13} color="#38bdf8" />
            <span>{viewMode === '3D' ? '2D' : '3D'}</span>
          </button>

          {/* Color Palette Customizer */}
          <button
            onClick={onOpenColorModal}
            title="Personalizar Cores Corporativas (Atalho: C)"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              backgroundColor: theme.bgSubtle,
              border: `1px solid ${theme.border}`,
              color: theme.textPrimary,
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            <Palette size={14} color="#a855f7" />
          </button>

          {/* Dark / Light Mode */}
          <button
            onClick={onToggleThemeMode}
            title={themeMode === 'dark' ? 'Alternar para Modo Claro (Atalho: T)' : 'Alternar para Modo Escuro (Atalho: T)'}
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
            }}
          >
            {themeMode === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          {/* Sync Button */}
          <button
            onClick={onRefresh}
            title="Sincronizar e reindexar grafo"
            style={{
              backgroundColor: '#0284c7',
              border: 'none',
              color: '#ffffff',
              padding: '5px 11px',
              borderRadius: '6px',
              fontSize: '11px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontWeight: 600,
            }}
          >
            <RefreshCw size={12} />
            <span>Sync</span>
          </button>
        </div>
      </header>

      {/* 2. Floating Filter Ribbon (Positioned right below header) */}
      <div
        style={{
          position: 'absolute',
          top: '68px',
          left: '24px',
          right: '24px',
          backgroundColor: theme.bgPanel,
          backdropFilter: 'blur(12px)',
          border: `1px solid ${theme.border}`,
          borderRadius: '10px',
          padding: '6px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 35,
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
          gap: '1rem',
        }}
      >
        {/* Left: Category Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingRight: '10px' }}>
          {[
            { id: 'all', label: 'Todos os Ativos' },
            { id: 'repos', label: 'Repositórios' },
            { id: 'structure', label: 'Arquivos & Dirs' },
            { id: 'code', label: 'Código AST & Funções' },
            { id: 'apis', label: 'Endpoints & APIs' },
            { id: 'data', label: 'Bancos & Dados' },
            { id: 'security', label: 'Segurança & Findings' },
            { id: 'ai', label: 'Modelos & IA' },
          ].map((k) => {
            const isSelected = filterKind === k.id;
            return (
              <button
                key={k.id}
                onClick={() => onFilterKindChange(k.id as KindFilter)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: isSelected ? '1px solid #38bdf8' : `1px solid ${theme.borderSubtle}`,
                  backgroundColor: isSelected ? (theme.mode === 'dark' ? '#1e293b' : '#e0f2fe') : 'transparent',
                  color: isSelected ? '#38bdf8' : theme.textSecondary,
                  fontSize: '11px',
                  fontWeight: isSelected ? 600 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {k.label}
              </button>
            );
          })}
        </div>

        {/* Right: LOD Segmented Control & Provenance Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {/* Semantic Zoom Segmented Control */}
          <div
            style={{
              display: 'flex',
              backgroundColor: theme.bgSubtle,
              padding: '2px',
              borderRadius: '6px',
              border: `1px solid ${theme.borderSubtle}`,
            }}
          >
            {[
              { lvl: 0, label: 'L0 Órbita' },
              { lvl: 1, label: 'L1 Repos' },
              { lvl: 2, label: 'L2 Módulos' },
              { lvl: 3, label: 'L3 Código AST' },
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
                  fontWeight: zoomLevel === item.lvl ? 600 : 500,
                  cursor: 'pointer',
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div style={{ width: '1px', height: '18px', backgroundColor: theme.border }} />

          {/* Provenance Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Filter size={12} color={theme.textMuted} />
            {(['all', 'observed', 'validated', 'inferred'] as const).map((claim) => (
              <button
                key={claim}
                onClick={() => onFilterClaimChange(claim)}
                style={{
                  background: filterClaim === claim ? (theme.mode === 'dark' ? '#334155' : '#cbd5e1') : 'transparent',
                  color: filterClaim === claim ? '#38bdf8' : theme.textSecondary,
                  border: 'none',
                  borderRadius: '4px',
                  padding: '2px 7px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  fontWeight: filterClaim === claim ? 600 : 400,
                }}
              >
                {claim}
              </button>
            ))}
          </div>

          <span style={{ fontSize: '11px', color: theme.textMuted, marginLeft: '4px' }}>
            {nodeCount} / {totalNodes}
          </span>
        </div>
      </div>
    </>
  );
};

