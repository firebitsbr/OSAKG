// =====================================================================
// Author: Mauro Risonho de Paula Assumpção
// Create: 2026-10-18
// Update: 2026-10-23
// Short Description: Theme state manager supporting dark/light modes and 5 enterprise color presets
// License: MIT
// =====================================================================

export type ThemeMode = 'dark' | 'light';

export type PresetPaletteId = 'enterprise_soc' | 'cyberpunk' | 'matrix' | 'synthwave' | 'nordic';

export interface NodeColors {
  Repository: string;
  Directory: string;
  File: string;
  Class: string;
  Function: string;
  Endpoint: string;
  DataStore: string;
  TrustBoundary: string;
  Control: string;
  Finding: string;
  ThreatActor: string;
  AIModel: string;
  Dependency: string;
  Organization: string;
  [key: string]: string;
}

export interface UITheme {
  mode: ThemeMode;
  bgMain: string;
  bgPanel: string;
  bgSubtle: string;
  bgHover: string;
  border: string;
  borderSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  sceneBg: number;
  sceneFog: number;
  globeWireframe: number;
  globeSolid: number;
  starColor: number;
  labelBg: string;
  labelText: string;
  labelBorder: string;
  edgeDefault: number;
  edgeAttack: number;
}

export const PRESET_NODE_COLORS: Record<PresetPaletteId, { name: string; colors: NodeColors }> = {
  enterprise_soc: {
    name: 'Enterprise SOC (Recomendado)',
    colors: {
      Repository: '#0284c7',
      Directory: '#64748b',
      File: '#38bdf8',
      Class: '#8b5cf6',
      Function: '#10b981',
      Endpoint: '#f59e0b',
      DataStore: '#2563eb',
      TrustBoundary: '#f43f5e',
      Control: '#16a34a',
      Finding: '#ef4444',
      ThreatActor: '#b91c1c',
      AIModel: '#a855f7',
      Dependency: '#d946ef',
      Organization: '#d97706',
    },
  },
  cyberpunk: {
    name: 'Cyberpunk Neon',
    colors: {
      Repository: '#38bdf8',
      Directory: '#64748b',
      File: '#0284c7',
      Class: '#a855f7',
      Function: '#10b981',
      Endpoint: '#f59e0b',
      DataStore: '#3b82f6',
      TrustBoundary: '#f43f5e',
      Control: '#22c55e',
      Finding: '#ef4444',
      ThreatActor: '#dc2626',
      AIModel: '#c084fc',
      Dependency: '#ec4899',
      Organization: '#f59e0b',
    },
  },
  nordic: {
    name: 'Nordic Slate',
    colors: {
      Repository: '#0369a1',
      Directory: '#475569',
      File: '#0284c7',
      Class: '#6d28d9',
      Function: '#047857',
      Endpoint: '#b45309',
      DataStore: '#1d4ed8',
      TrustBoundary: '#be123c',
      Control: '#15803d',
      Finding: '#b91c1c',
      ThreatActor: '#881337',
      AIModel: '#7e22ce',
      Dependency: '#be185d',
      Organization: '#c2410c',
    },
  },
  matrix: {
    name: 'Matrix Terminal',
    colors: {
      Repository: '#22c55e',
      Directory: '#4ade80',
      File: '#86efac',
      Class: '#15803d',
      Function: '#16a34a',
      Endpoint: '#a3e635',
      DataStore: '#84cc16',
      TrustBoundary: '#f87171',
      Control: '#65a30d',
      Finding: '#ef4444',
      ThreatActor: '#b91c1c',
      AIModel: '#4ade80',
      Dependency: '#10b981',
      Organization: '#22c55e',
    },
  },
  synthwave: {
    name: 'Synthwave Sunset',
    colors: {
      Repository: '#f43f5e',
      Directory: '#8b5cf6',
      File: '#a855f7',
      Class: '#d946ef',
      Function: '#06b6d4',
      Endpoint: '#fb923c',
      DataStore: '#f59e0b',
      TrustBoundary: '#ec4899',
      Control: '#10b981',
      Finding: '#ff0055',
      ThreatActor: '#e11d48',
      AIModel: '#c084fc',
      Dependency: '#f472b6',
      Organization: '#fbbf24',
    },
  },
};

export function getUITheme(mode: ThemeMode): UITheme {
  if (mode === 'light') {
    return {
      mode: 'light',
      bgMain: '#f8fafc',
      bgPanel: 'rgba(255, 255, 255, 0.94)',
      bgSubtle: '#f1f5f9',
      bgHover: '#e2e8f0',
      border: '#e2e8f0',
      borderSubtle: '#f1f5f9',
      textPrimary: '#0f172a',
      textSecondary: '#475569',
      textMuted: '#94a3b8',
      sceneBg: 0xf8fafc,
      sceneFog: 0xf8fafc,
      globeWireframe: 0xcbd5e1,
      globeSolid: 0xf1f5f9,
      starColor: 0x94a3b8,
      labelBg: 'rgba(255, 255, 255, 0.96)',
      labelText: '#0f172a',
      labelBorder: '#cbd5e1',
      edgeDefault: 0x0284c7,
      edgeAttack: 0xdc2626,
    };
  }

  return {
    mode: 'dark',
    bgMain: '#080c14',
    bgPanel: 'rgba(13, 19, 33, 0.94)',
    bgSubtle: '#151e2e',
    bgHover: '#1e293b',
    border: 'rgba(255, 255, 255, 0.08)',
    borderSubtle: 'rgba(255, 255, 255, 0.04)',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    sceneBg: 0x080c14,
    sceneFog: 0x080c14,
    globeWireframe: 0x1e293b,
    globeSolid: 0x0d1321,
    starColor: 0x64748b,
    labelBg: 'rgba(13, 19, 33, 0.92)',
    labelText: '#f8fafc',
    labelBorder: 'rgba(255, 255, 255, 0.15)',
    edgeDefault: 0x0284c7,
    edgeAttack: 0xef4444,
  };
}
