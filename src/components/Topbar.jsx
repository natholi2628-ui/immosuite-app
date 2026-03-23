import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ScoreRing } from './UI';
import { scoreLabel, scoreColor } from '../hooks/useCalcs';

const PAGE_TITLES = {
  finance:     { icon: '📊', label: 'Finance & Simulation' },
  dpe:         { icon: '⚡', label: 'DPE & Rénovation Énergétique' },
  audit:       { icon: '🛠️', label: 'Audit Travaux & Shopping' },
  assistant:   { icon: '💬', label: 'Assistant IA Expert' },
  annonce:     { icon: '✍️', label: 'Générateur d\'Annonce' },
  comparateur: { icon: '🔀', label: 'Comparateur de Biens' },
  rapport:     { icon: '📄', label: 'Export & Rapport' },
};

export default function Topbar({ adresse, surface, gamme, score }) {
  const { activeTab, theme, toggleTheme, setApiKey, apiKey } = useApp();
  const [apiInput, setApiInput] = useState('');
  const [showApiInput, setShowApiInput] = useState(false);
  const page = PAGE_TITLES[activeTab] || PAGE_TITLES.finance;
  const sc = scoreColor(score);

  const handleApiSubmit = (e) => {
    if (e.key === 'Enter' && apiInput.trim()) {
      setApiKey(apiInput.trim());
      setShowApiInput(false);
    }
  };

  return (
    <header style={{
      height: 64, background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center',
      padding: '0 24px', gap: 14,
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      {/* Page title */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>{page.icon}</span>
          <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{page.label}</span>
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 1 }}>
          {adresse} · {surface}m² · {gamme.split(' ')[0]}
        </div>
      </div>

      {/* Score */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border)', flexShrink: 0 }}>
        <ScoreRing score={score} size={36} />
        <div>
          <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Score</div>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: sc }}>{scoreLabel(score)}</div>
        </div>
      </div>

      {/* API key */}
      {!apiKey ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'var(--amber-light)', borderRadius: 8, border: '1px solid var(--amber)', flexShrink: 0 }}>
          <span style={{ fontSize: 13 }}>⚠️</span>
          {showApiInput ? (
            <input autoFocus type="password" placeholder="sk-proj-..." value={apiInput}
              onChange={e => setApiInput(e.target.value)}
              onKeyDown={handleApiSubmit}
              onBlur={() => { if (!apiInput) setShowApiInput(false); }}
              style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.78rem', color: 'var(--amber)', width: 160, fontFamily: 'var(--font-sans)' }}
            />
          ) : (
            <button onClick={() => setShowApiInput(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.78rem', color: 'var(--amber)', fontWeight: 600, fontFamily: 'var(--font-sans)' }}>
              Clé OpenAI requise →
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', background: 'var(--green-light)', borderRadius: 8, fontSize: '0.75rem', color: 'var(--green)', fontWeight: 600, flexShrink: 0 }}>
          ✅ IA connectée
          <button onClick={() => setApiKey('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 11, marginLeft: 4, fontFamily: 'var(--font-sans)' }}>
            ✕
          </button>
        </div>
      )}

      {/* Theme toggle */}
      <button onClick={toggleTheme}
        style={{
          width: 36, height: 36, borderRadius: 8, flexShrink: 0,
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'var(--transition)',
        }}
        title={theme === 'light' ? 'Mode sombre' : 'Mode clair'}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
        onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
    </header>
  );
}
