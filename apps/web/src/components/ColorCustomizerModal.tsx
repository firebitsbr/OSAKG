// =====================================================================
// Author: Mauro Risonho de Paula Assumpção
// Create: 2026-10-18
// Update: 2026-10-23
// Short Description: Corporate color theme customizer modal with RGB and HSL palette adjustments
// License: MIT
// =====================================================================

import React from 'react';
import { X, RotateCcw, Palette, Sun, Moon } from 'lucide-react';
import { NodeColors, PresetPaletteId, PRESET_NODE_COLORS, ThemeMode, UITheme } from '../theme';

interface ColorCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: UITheme;
  themeMode: ThemeMode;
  onToggleThemeMode: () => void;
  nodeColors: NodeColors;
  selectedPreset: PresetPaletteId;
  onSelectPreset: (preset: PresetPaletteId) => void;
  onUpdateColor: (kind: keyof NodeColors, color: string) => void;
  onResetDefaults: () => void;
}

const KIND_LABELS: Record<string, string> = {
  Repository: 'Repositório',
  Directory: 'Diretório / Módulo',
  File: 'Arquivo de Código',
  Class: 'Classe / Estrutura',
  Function: 'Função / Método AST',
  Endpoint: 'API Endpoint / Rota',
  DataStore: 'Banco de Dados / Cache',
  TrustBoundary: 'Fronteira de Confiança',
  Control: 'Controle de Segurança',
  Finding: 'Vulnerabilidade / Finding',
  ThreatActor: 'Adversário / Threat Actor',
  AIModel: 'Modelo de IA (Claude)',
  Dependency: 'Dependência / Pacote',
  Organization: 'Organização Central',
};

export const ColorCustomizerModal: React.FC<ColorCustomizerModalProps> = ({
  isOpen,
  onClose,
  theme,
  themeMode,
  onToggleThemeMode,
  nodeColors,
  selectedPreset,
  onSelectPreset,
  onUpdateColor,
  onResetDefaults,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '560px',
          maxHeight: '85vh',
          backgroundColor: theme.mode === 'dark' ? '#0f172a' : '#ffffff',
          color: theme.textPrimary,
          border: `1px solid ${theme.border}`,
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.2rem 1.5rem',
            borderBottom: `1px solid ${theme.borderSubtle}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Palette size={20} color="#38bdf8" />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
              Personalização Visual & Cores
            </h2>
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
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* 1. Dark / Light Mode Switch */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: theme.textSecondary, textTransform: 'uppercase' }}>
              Modo de Exibição
            </label>
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button
                onClick={() => {
                  if (themeMode !== 'dark') onToggleThemeMode();
                }}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px',
                  borderRadius: '8px',
                  border: themeMode === 'dark' ? '2px solid #38bdf8' : `1px solid ${theme.borderSubtle}`,
                  backgroundColor: themeMode === 'dark' ? (theme.mode === 'dark' ? '#1e293b' : '#0f172a') : 'transparent',
                  color: themeMode === 'dark' ? '#38bdf8' : theme.textSecondary,
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                <Moon size={16} /> Modo Escuro
              </button>
              <button
                onClick={() => {
                  if (themeMode !== 'light') onToggleThemeMode();
                }}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px',
                  borderRadius: '8px',
                  border: themeMode === 'light' ? '2px solid #0284c7' : `1px solid ${theme.borderSubtle}`,
                  backgroundColor: themeMode === 'light' ? (theme.mode === 'light' ? '#e2e8f0' : '#f1f5f9') : 'transparent',
                  color: themeMode === 'light' ? '#0284c7' : theme.textSecondary,
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                <Sun size={16} /> Modo Claro
              </button>
            </div>
          </div>

          {/* 2. Palettes Presets */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: theme.textSecondary, textTransform: 'uppercase' }}>
              Paletas de Cores Pré-definidas
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '8px' }}>
              {(Object.keys(PRESET_NODE_COLORS) as PresetPaletteId[]).map((pId) => {
                const preset = PRESET_NODE_COLORS[pId];
                const isSelected = selectedPreset === pId;
                return (
                  <button
                    key={pId}
                    onClick={() => onSelectPreset(pId)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid #38bdf8' : `1px solid ${theme.borderSubtle}`,
                      backgroundColor: isSelected ? theme.bgSubtle : 'transparent',
                      color: isSelected ? '#38bdf8' : theme.textPrimary,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>{preset.name}</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {['Repository', 'Class', 'Function', 'Endpoint', 'Finding'].map((k) => (
                        <div
                          key={k}
                          style={{
                            width: '14px',
                            height: '14px',
                            borderRadius: '3px',
                            backgroundColor: preset.colors[k as keyof NodeColors],
                          }}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Granular Node Kind Color Customizer */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: theme.textSecondary, textTransform: 'uppercase' }}>
                Personalizar Cores dos Nós
              </label>
              <button
                onClick={onResetDefaults}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#38bdf8',
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                }}
              >
                <RotateCcw size={12} /> Restaurar Padrões
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px',
                maxHeight: '260px',
                overflowY: 'auto',
                paddingRight: '4px',
              }}
            >
              {Object.keys(KIND_LABELS).map((kind) => {
                const color = nodeColors[kind as keyof NodeColors] || '#38bdf8';
                return (
                  <div
                    key={kind}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 10px',
                      backgroundColor: theme.bgSubtle,
                      borderRadius: '6px',
                      border: `1px solid ${theme.borderSubtle}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => onUpdateColor(kind as keyof NodeColors, e.target.value)}
                        style={{
                          width: '26px',
                          height: '26px',
                          padding: 0,
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          backgroundColor: 'transparent',
                        }}
                      />
                      <span style={{ fontSize: '12px', fontWeight: 500, color: theme.textPrimary }}>
                        {KIND_LABELS[kind]}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', fontFamily: 'monospace', color: theme.textMuted }}>
                      {color}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: `1px solid ${theme.borderSubtle}`,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px',
          }}
        >
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 18px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Concluir & Aplicar
          </button>
        </div>
      </div>
    </div>
  );
};

