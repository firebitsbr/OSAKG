// =====================================================================
// Author: Mauro Risonho de Paula Assumpção
// Create: 2026-10-18
// Update: 2026-10-23
// Short Description: Modal dialog for live ingestion of arbitrary GitHub organizations and projects
// License: MIT
// =====================================================================

import React, { useState } from 'react';
import { X, Globe, Key, Database, RefreshCw, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import { UITheme } from '../theme';
import { ingestGitHubOrg } from '../api';
import { UniverseTileResponse } from '../types';

interface IngestOrgModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIngestSuccess: (universe: UniverseTileResponse) => void;
  theme: UITheme;
}

const PRESET_ORGS = [
  { name: 'anthropics', label: 'Anthropic AI' },
  { name: 'pallets', label: 'Pallets (Flask/Jinja)' },
  { name: 'torvalds', label: 'Linus Torvalds' },
  { name: 'fastapi', label: 'FastAPI' },
  { name: 'expressjs', label: 'Express.js' },
  { name: 'tailwindlabs', label: 'Tailwind Labs' },
];

export const IngestOrgModal: React.FC<IngestOrgModalProps> = ({
  isOpen,
  onClose,
  onIngestSuccess,
  theme,
}) => {
  const [orgName, setOrgName] = useState('');
  const [token, setToken] = useState('');
  const [maxRepos, setMaxRepos] = useState(30);
  const [loading, setLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) {
      setError('Informe o nome da organização ou usuário do GitHub.');
      return;
    }

    setLoading(true);
    setError(null);
    setProgressMsg('Iniciando pipeline de ingestão OSAKG...');

    try {
      const universe = await ingestGitHubOrg(
        orgName.trim(),
        token.trim() || undefined,
        maxRepos,
        (msg) => setProgressMsg(msg)
      );
      onIngestSuccess(universe);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Falha na ingestão dos repositórios.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: theme.bgPanel,
          border: `1px solid ${theme.border}`,
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeIn 0.15s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: `1px solid ${theme.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: theme.bgSubtle,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8',
              }}
            >
              <Globe size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: theme.textPrimary }}>
                Ingerir Organização GitHub
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: theme.textMuted }}>
                Construção de grafo passivo, local-first com topologia celestial 3D
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              background: 'transparent',
              border: 'none',
              color: theme.textMuted,
              cursor: loading ? 'not-allowed' : 'pointer',
              padding: '6px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleStartIngest} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Target Org */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: theme.textSecondary, marginBottom: '6px' }}>
              Organização ou Usuário GitHub
            </label>
            <input
              type="text"
              placeholder="ex: pallets, anthropics, torvalds, fastapi..."
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px 12px',
                backgroundColor: theme.bgMain,
                border: `1px solid ${theme.border}`,
                borderRadius: '6px',
                color: theme.textPrimary,
                fontSize: '0.9rem',
                outline: 'none',
                fontFamily: 'monospace',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Quick Presets */}
          <div>
            <span style={{ fontSize: '0.72rem', color: theme.textMuted, display: 'block', marginBottom: '6px' }}>
              Sugestões rápidas:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {PRESET_ORGS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  disabled={loading}
                  onClick={() => setOrgName(p.name)}
                  style={{
                    background: orgName === p.name ? 'rgba(56, 189, 248, 0.2)' : theme.bgSubtle,
                    border: `1px solid ${orgName === p.name ? '#38bdf8' : theme.borderSubtle}`,
                    color: orgName === p.name ? '#38bdf8' : theme.textSecondary,
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Optional GitHub Token */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: theme.textSecondary, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Key size={14} /> GitHub Personal Access Token (Opcional)
              </label>
              <span style={{ fontSize: '0.7rem', color: theme.textMuted }}>Evita limites de taxa (60/h)</span>
            </div>
            <input
              type="password"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx (mantido apenas em memória)"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: theme.bgMain,
                border: `1px solid ${theme.border}`,
                borderRadius: '6px',
                color: theme.textPrimary,
                fontSize: '0.85rem',
                outline: 'none',
                fontFamily: 'monospace',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Max Repos */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: theme.textSecondary, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={14} /> Limite de Repositórios a Ingerir
              </label>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8' }}>{maxRepos} repos</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={maxRepos}
              onChange={(e) => setMaxRepos(Number(e.target.value))}
              disabled={loading}
              style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
            />
          </div>

          {/* Progress / Status feedback */}
          {loading && (
            <div
              style={{
                backgroundColor: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '6px',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '0.8rem',
                color: '#38bdf8',
                fontFamily: 'monospace',
              }}
            >
              <RefreshCw size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
              <span>{progressMsg}</span>
            </div>
          )}

          {error && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '6px',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.8rem',
                color: '#f87171',
              }}
            >
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                background: 'transparent',
                border: `1px solid ${theme.border}`,
                color: theme.textSecondary,
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !orgName.trim()}
              style={{
                backgroundColor: loading || !orgName.trim() ? '#475569' : '#0284c7',
                border: 'none',
                color: '#ffffff',
                padding: '8px 20px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: loading || !orgName.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
              }}
            >
              {loading ? (
                <>
                  <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} />
                  Ingerindo...
                </>
              ) : (
                <>
                  <Database size={15} />
                  Ingerir & Montar Grafo
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

