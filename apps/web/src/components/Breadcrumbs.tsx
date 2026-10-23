// =====================================================================
// Author: Mauro Risonho de Paula Assumpção
// Create: 2026-10-18
// Update: 2026-10-23
// Short Description: Hierarchical breadcrumb navigation component reflecting zoom altitude
// License: MIT
// =====================================================================

import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { UniverseNodeSpatial } from '../types';
import { UITheme } from '../theme';

interface BreadcrumbsProps {
  orgName: string;
  selectedNode: UniverseNodeSpatial | null;
  onReset: () => void;
  theme: UITheme;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  orgName,
  selectedNode,
  onReset,
  theme,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '24px',
        left: '24px',
        backgroundColor: theme.bgPanel,
        backdropFilter: 'blur(8px)',
        border: `1px solid ${theme.border}`,
        borderRadius: '8px',
        padding: '8px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '12px',
        color: theme.textSecondary,
        zIndex: 30,
        boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
      }}
    >
      <button
        onClick={onReset}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          background: 'none',
          border: 'none',
          color: '#38bdf8',
          cursor: 'pointer',
          padding: 0,
          fontSize: '12px',
          fontWeight: 600,
        }}
      >
        <Home size={14} />
        {orgName}
      </button>

      {selectedNode && (
        <>
          <ChevronRight size={14} color={theme.textMuted} />
          <span>{selectedNode.cluster_group}</span>
          <ChevronRight size={14} color={theme.textMuted} />
          <span style={{ color: theme.textPrimary, fontWeight: 600 }}>{selectedNode.name}</span>
        </>
      )}
    </div>
  );
};
