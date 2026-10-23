// =====================================================================
// Author: Mauro Risonho de Paula Assumpção
// Create: 2026-10-18
// Update: 2026-10-23
// Short Description: Main application component managing HUD, layout, themes, and views
// License: MIT
// =====================================================================

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { UniverseTileResponse, UniverseNodeSpatial, ClaimState } from './types';
import { fetchUniverseTiles } from './api';
import { Universe3D } from './components/Universe3D';
import { Graph2D } from './components/Graph2D';
import { NodeDrawer } from './components/NodeDrawer';
import { EnterpriseHeader, KindFilter } from './components/EnterpriseHeader';
import { Breadcrumbs } from './components/Breadcrumbs';
import { ColorCustomizerModal } from './components/ColorCustomizerModal';
import { CommandPalette } from './components/CommandPalette';
import { IngestOrgModal } from './components/IngestOrgModal';
import {
  ThemeMode,
  PresetPaletteId,
  NodeColors,
  PRESET_NODE_COLORS,
  getUITheme,
} from './theme';

export const App: React.FC = () => {
  const [universe, setUniverse] = useState<UniverseTileResponse | null>(null);
  const [selectedNode, setSelectedNode] = useState<UniverseNodeSpatial | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClaim, setFilterClaim] = useState<ClaimState | 'all'>('all');
  const [filterKind, setFilterKind] = useState<KindFilter>('all');
  const [viewMode, setViewMode] = useState<'3D' | '2D'>('3D');
  const [zoomLevel, setZoomLevel] = useState(2); // Default to L2 so modules and files are visible immediately!
  const [showAttackPaths, setShowAttackPaths] = useState(false);
  const [loading, setLoading] = useState(true);

  // Theme & Color Customization State
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem('osakg_theme_mode') as ThemeMode) || 'dark';
  });
  const [selectedPreset, setSelectedPreset] = useState<PresetPaletteId>(() => {
    return (localStorage.getItem('osakg_preset_palette') as PresetPaletteId) || 'enterprise_soc';
  });
  const [customColors, setCustomColors] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('osakg_custom_colors');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);

  const theme = useMemo(() => getUITheme(themeMode), [themeMode]);

  const activeNodeColors: NodeColors = useMemo(() => {
    return {
      ...PRESET_NODE_COLORS[selectedPreset].colors,
      ...customColors,
    } as NodeColors;
  }, [selectedPreset, customColors]);

  const criticalCount = useMemo(() => {
    return universe?.nodes.filter((n) => n.risk_level === 'critical').length || 0;
  }, [universe]);

  const toggleThemeMode = useCallback(() => {
    setThemeMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('osakg_theme_mode', next);
      return next;
    });
  }, []);

  const handleSelectPreset = useCallback((presetId: PresetPaletteId) => {
    setSelectedPreset(presetId);
    setCustomColors({});
    localStorage.setItem('osakg_preset_palette', presetId);
    localStorage.removeItem('osakg_custom_colors');
  }, []);

  const handleUpdateColor = useCallback((kind: keyof NodeColors, color: string) => {
    setCustomColors((prev) => {
      const next = { ...prev, [kind]: color };
      localStorage.setItem('osakg_custom_colors', JSON.stringify(next));
      return next;
    });
  }, []);

  const handleResetDefaults = useCallback(() => {
    setSelectedPreset('enterprise_soc');
    setCustomColors({});
    localStorage.setItem('osakg_preset_palette', 'enterprise_soc');
    localStorage.removeItem('osakg_custom_colors');
  }, []);

  const loadData = useCallback(async (lvl = 0) => {
    setLoading(true);
    try {
      const data = await fetchUniverseTiles(lvl);
      setUniverse(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(zoomLevel);
  }, [loadData, zoomLevel]);

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setSelectedNode(null);
        setIsColorModalOpen(false);
        setIsCommandPaletteOpen(false);
      } else if (e.key === '1') {
        setViewMode('3D');
      } else if (e.key === '2') {
        setViewMode('2D');
      } else if (e.key.toLowerCase() === 'a') {
        setShowAttackPaths((prev) => !prev);
      } else if (e.key.toLowerCase() === 't') {
        toggleThemeMode();
      } else if (e.key.toLowerCase() === 'c') {
        setIsColorModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleThemeMode]);

  const filteredNodes = useMemo(() => {
    if (!universe) return [];
    let list = universe.nodes;

    // Filter by Semantic Zoom Level (LOD) - unless Attack Paths mode is active
    if (!showAttackPaths) {
      if (zoomLevel === 0) {
        list = list.filter((n) => {
          const minLvl = (n.metrics?.min_level as number) ?? 0;
          return minLvl <= 0;
        });
      } else if (zoomLevel === 1) {
        list = list.filter((n) => {
          const minLvl = (n.metrics?.min_level as number) ?? 0;
          return minLvl <= 1;
        });
      } else if (zoomLevel === 2) {
        list = list.filter((n) => {
          const minLvl = (n.metrics?.min_level as number) ?? 0;
          return minLvl <= 2;
        });
      }
    }

    // Filter by Node Kind
    if (filterKind !== 'all') {
      list = list.filter((n) => {
        switch (filterKind) {
          case 'repos':
            return n.kind === 'Repository';
          case 'structure':
            return n.kind === 'Directory' || n.kind === 'File';
          case 'code':
            return n.kind === 'Function' || n.kind === 'Class' || n.kind === 'Symbol';
          case 'apis':
            return n.kind === 'Endpoint' || n.kind === 'Service';
          case 'data':
            return n.kind === 'DataStore' || n.kind === 'DataAsset' || n.kind === 'TrustBoundary';
          case 'security':
            return n.kind === 'Control' || n.kind === 'Finding' || n.kind === 'ThreatActor';
          case 'ai':
            return n.kind === 'AIAgent' || n.kind === 'Tool' || n.kind === 'AIModel';
          default:
            return true;
        }
      });
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (n) =>
          n.name.toLowerCase().includes(q) ||
          n.kind.toLowerCase().includes(q) ||
          n.cluster_group.toLowerCase().includes(q)
      );
    }
    return list;
  }, [universe, searchQuery, filterKind, zoomLevel, showAttackPaths]);

  const handleSelectNeighbor = (neighborId: string) => {
    if (!universe) return;
    const found = universe.nodes.find((n) => n.id === neighborId);
    if (found) {
      setSelectedNode(found);
    }
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        backgroundColor: theme.bgMain,
        color: theme.textPrimary,
        overflow: 'hidden',
        userSelect: 'none',
        transition: 'background-color 0.2s ease',
      }}
    >
      {/* Enterprise Corporate Header with Floating Filter Ribbon */}
      <EnterpriseHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        filterClaim={filterClaim}
        onFilterClaimChange={setFilterClaim}
        filterKind={filterKind}
        onFilterKindChange={setFilterKind}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode((m) => (m === '3D' ? '2D' : '3D'))}
        onRefresh={() => loadData(zoomLevel)}
        zoomLevel={zoomLevel}
        onZoomLevelChange={(lvl) => setZoomLevel(lvl)}
        nodeCount={filteredNodes.length}
        totalNodes={universe?.nodes.length || 0}
        criticalCount={criticalCount}
        showAttackPaths={showAttackPaths}
        onToggleAttackPaths={() => setShowAttackPaths((prev) => !prev)}
        theme={theme}
        themeMode={themeMode}
        onToggleThemeMode={toggleThemeMode}
        onOpenColorModal={() => setIsColorModalOpen(true)}
        onOpenIngestModal={() => setIsIngestModalOpen(true)}
        tenantName={universe?.org_name}
      />

      {/* Main View Area (Offset for Header + Floating Ribbon) */}
      <div style={{ width: '100%', height: '100%', paddingTop: '56px' }}>
        {loading && !universe ? (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
              fontSize: '13px',
              fontFamily: 'monospace',
              letterSpacing: '0.05em',
            }}
          >
            INDEXANDO UNIVERSO OSAKG DE SEGURANÇA...
          </div>
        ) : universe ? (
          viewMode === '3D' ? (
            <Universe3D
              nodes={filteredNodes}
              edges={universe.edges}
              selectedNode={selectedNode}
              onSelectNode={(node) => setSelectedNode(node)}
              filterClaim={filterClaim}
              showAttackPaths={showAttackPaths}
              onSemanticZoomChange={(lvl) => {
                if (lvl !== zoomLevel) setZoomLevel(lvl);
              }}
              theme={theme}
              nodeColors={activeNodeColors}
            />
          ) : (
            <Graph2D
              nodes={filteredNodes}
              edges={universe.edges}
              selectedNode={selectedNode}
              onSelectNode={(node) => setSelectedNode(node)}
              filterClaim={filterClaim}
              theme={theme}
              nodeColors={activeNodeColors}
            />
          )
        ) : null}
      </div>

      {/* Breadcrumbs (Bottom-Left) */}
      <Breadcrumbs
        orgName={universe?.org_name || 'Organização'}
        selectedNode={selectedNode}
        onReset={() => setSelectedNode(null)}
        theme={theme}
      />

      {/* Slide-out details drawer (Enterprise Inspector) */}
      <NodeDrawer
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
        onSelectNeighbor={handleSelectNeighbor}
        theme={theme}
        nodeColors={activeNodeColors}
      />

      {/* Color Customizer & Palette Modal */}
      <ColorCustomizerModal
        isOpen={isColorModalOpen}
        onClose={() => setIsColorModalOpen(false)}
        theme={theme}
        themeMode={themeMode}
        onToggleThemeMode={toggleThemeMode}
        nodeColors={activeNodeColors}
        selectedPreset={selectedPreset}
        onSelectPreset={handleSelectPreset}
        onUpdateColor={handleUpdateColor}
        onResetDefaults={handleResetDefaults}
      />

      {/* Enterprise Global Command Palette (⌘K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        nodes={universe?.nodes || []}
        onSelectNode={(node) => setSelectedNode(node)}
        theme={theme}
        nodeColors={activeNodeColors}
        onOpenIngestModal={() => setIsIngestModalOpen(true)}
      />

      {/* Universal Organization Ingestion Modal */}
      <IngestOrgModal
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
        onIngestSuccess={(newUniverse) => {
          setUniverse(newUniverse);
          setSelectedNode(null);
        }}
        theme={theme}
      />
    </div>
  );
};
