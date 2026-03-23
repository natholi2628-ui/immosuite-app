import { useState } from 'react';
import { useApp } from '../context/AppContext';
import ParamsPanel from './ParamsPanel';
import SmartImport from './SmartImport';

const NAV = [
  { id: 'finance',      icon: '📊', label: 'Finance' },
  { id: 'dpe',          icon: '⚡', label: 'DPE & Énergie' },
  { id: 'audit',        icon: '🛠️', label: 'Audit & Shopping' },
  { id: 'assistant',    icon: '💬', label: 'Assistant IA' },
  { id: 'annonce',      icon: '✍️', label: 'Annonce' },
  { id: 'comparateur',  icon: '🔀', label: 'Comparateur' },
  { id: 'rapport',      icon: '📄', label: 'Rapport' },
];

export default function Sidebar({ bien, gamme, setGamme, params, setParam, onImport }) {
  const { activeTab, setActiveTab, client, userInfo, saveToJson, logout, historique } = useApp();
  const [showHistorique, setShowHistorique] = useState(false);

  return (
    <aside style={{
      width: 248, minWidth: 248, height: '100vh',
      background: 'var(--bg-sidebar)',
      display: 'flex', flexDirection: 'column',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      position: 'fixed', left: 0, top: 0, zIndex: 100,
      transition: 'background 0.3s ease',
    }}>
      {/* Logo — fixe */}
      <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #1e3a5f, #2563eb)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, boxShadow: '0 4px 12px rgba(37,99,235,0.4)',
          }}>💎</div>
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', color: '#f8fafc', letterSpacing: '-0.3px' }}>ImmoSuite</div>
            <div style={{ fontSize: '0.65rem', color: '#475569', marginTop: 1 }}>Expert V25</div>
          </div>
        </div>
      </div>

      {/* Zone scrollable : nav + standing + user + params */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column' }}>

        {/* Nav */}
        <nav style={{ padding: '12px 0', flexShrink: 0 }}>
          {NAV.map((item, i) => {
            const isActive = activeTab === item.id;
            return (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 20px', fontSize: '0.83rem', fontFamily: 'var(--font-sans)',
                  color: isActive ? '#fff' : '#64748b',
                  background: isActive ? 'rgba(37,99,235,0.18)' : 'transparent',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  borderLeft: `3px solid ${isActive ? '#3b82f6' : 'transparent'}`,
                  transition: 'all 0.15s ease',
                  animation: `slideInLeft 0.3s ease ${i * 40}ms both`,
                  position: 'relative',
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = '#cbd5e1'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'transparent'; } }}
              >
                <span style={{ fontSize: 14, width: 18, textAlign: 'center' }}>{item.icon}</span>
                <span style={{ fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
                {isActive && (
                  <span style={{
                    marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%',
                    background: '#3b82f6', boxShadow: '0 0 8px #3b82f6',
                  }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Standing */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
          <div style={{ fontSize: '0.65rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Standing</div>
          {['Économique', 'Standard', 'Premium'].map(g => (
            <button key={g} onClick={() => setGamme(g)}
              style={{
                width: '100%', padding: '6px 10px', marginBottom: 4,
                borderRadius: 6, fontSize: '0.75rem', fontFamily: 'var(--font-sans)',
                background: gamme === g ? 'rgba(37,99,235,0.25)' : 'transparent',
                color: gamme === g ? '#93c5fd' : '#64748b',
                border: `1px solid ${gamme === g ? 'rgba(59,130,246,0.3)' : 'transparent'}`,
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                fontWeight: gamme === g ? 600 : 400,
              }}>
              {g === 'Économique' ? '💰' : g === 'Standard' ? '⭐' : '💎'} {g}
            </button>
          ))}
        </div>

        {/* User */}
        <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
          <div style={{
            background: 'rgba(37,99,235,0.15)',
            borderRadius: 10, padding: '10px 12px',
            display: 'flex', alignItems: 'center', gap: 10,
            border: '1px solid rgba(37,99,235,0.2)',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.72rem', fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>
              {(userInfo?.nom || client?.name || 'A').slice(0, 2).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {userInfo?.nom || client?.name}
              </div>
              <div style={{ fontSize: '0.66rem', color: '#475569' }}>
                {userInfo?.objectif || 'Actif'}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <button onClick={saveToJson} title="Sauvegarder"
                style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer', fontSize: 12, color: '#94a3b8' }}>💾</button>
              <button onClick={() => setShowHistorique(h => !h)} title="Historique"
                style={{ width: 24, height: 24, borderRadius: 6, background: showHistorique ? 'rgba(37,99,235,0.3)' : 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer', fontSize: 12, color: showHistorique ? '#93c5fd' : '#94a3b8' }}>🕐</button>
              <button onClick={logout} title="Déconnexion"
                style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer', fontSize: 12, color: '#94a3b8' }}>🚪</button>
            </div>
          </div>
        </div>

        {/* Historique */}
        {showHistorique && historique.length > 0 && (
          <div style={{ padding: '0 12px 8px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontSize: '0.62rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '10px 4px 6px' }}>
              Derniers biens analysés
            </div>
            {historique.slice(0, 5).map((b, i) => {
              const sc = b.score >= 70 ? '#16a34a' : b.score >= 45 ? '#d97706' : '#dc2626';
              return (
                <div key={b.id || i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '8px 10px', marginBottom: 5, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#cbd5e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 4 }}>
                    {b.adresse}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.62rem', color: sc, fontWeight: 700 }}>⭐ {b.score}/100</span>
                    <span style={{ fontSize: '0.62rem', color: '#64748b' }}>{b.rentaBrute}%</span>
                    <span style={{ fontSize: '0.62rem', color: b.cashflowMois >= 0 ? '#22c55e' : '#ef4444' }}>{b.cashflowMois > 0 ? '+' : ''}{b.cashflowMois}€/m</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Smart Import IA */}
        <div style={{ padding: '8px 14px 0' }}>
          <SmartImport onImport={onImport} />
        </div>

        {/* Params du bien — inline dans la sidebar, scrollable avec elle */}
        <ParamsPanel params={params} setParam={setParam} />

      </div>
    </aside>
  );
}
