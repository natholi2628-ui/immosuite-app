import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Btn } from '../components/UI';

export function Login() {
  const { login } = useApp();
  const [pwd, setPwd]   = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = () => {
    setLoading(true);
    setTimeout(() => {
      if (!login(pwd)) { setError('Clé non reconnue. Contactez l\'agence.'); }
      setLoading(false);
    }, 600);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #060d1a 0%, #0f1e38 50%, #0a1525 100%)',
    }}>
      {/* Background grid */}
      <div style={{
        position: 'fixed', inset: 0, opacity: 0.04,
        backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <div style={{
        width: 420, background: 'rgba(15,26,46,0.9)', backdropFilter: 'blur(20px)',
        borderRadius: 20, padding: '48px 44px',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
        animation: 'fadeInUp 0.6s ease',
        position: 'relative',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #1e3a5f, #2563eb)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, boxShadow: '0 8px 24px rgba(37,99,235,0.45)',
          }}>💎</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.7rem', color: '#f8fafc', marginBottom: 6 }}>ImmoSuite</h1>
          <p style={{ color: '#475569', fontSize: '0.85rem' }}>Plateforme Expert Immobilier V25</p>
        </div>

        {/* Form */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            Clé d'accès personnelle
          </label>
          <input
            type="password" value={pwd}
            onChange={e => { setPwd(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="••••••••••••"
            style={{
              width: '100%', background: 'rgba(255,255,255,0.06)',
              border: `1px solid ${error ? '#dc2626' : 'rgba(255,255,255,0.1)'}`,
              color: '#f1f5f9', borderRadius: 10, padding: '13px 16px', fontSize: '1rem',
              letterSpacing: 4, outline: 'none', fontFamily: 'var(--font-sans)',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => { if (!error) e.target.style.borderColor = '#3b82f6'; }}
            onBlur={e => { if (!error) e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          />
          {error && <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: 8 }}>❌ {error}</p>}
        </div>

        <button onClick={submit}
          style={{
            width: '100%', padding: '13px', borderRadius: 10,
            background: loading ? 'rgba(37,99,235,0.5)' : 'linear-gradient(135deg, #1e3a5f, #2563eb)',
            color: '#fff', fontWeight: 700, fontSize: '0.95rem', fontFamily: 'var(--font-sans)',
            border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 20px rgba(37,99,235,0.35)',
            transition: 'all 0.2s',
          }}>
          {loading ? '🔄 Vérification...' : '🔓 Accéder à la plateforme'}
        </button>

        <p style={{ textAlign: 'center', color: '#334155', fontSize: '0.75rem', marginTop: 20 }}>
          Contactez votre agence pour obtenir votre clé d'accès
        </p>
      </div>
    </div>
  );
}

export function Onboarding() {
  const { client, setUserInfo, loadFromJson, setShowTutorial } = useApp();
  const [form, setForm] = useState({ nom: client?.name || '', email: '', statut: 'Particulier', apport: 20000, revenus: 3500, objectif: 'Rentabilité' });
  const [tab, setTab] = useState('new');
  const [error, setError] = useState('');

  const setF = k => v => setForm(f => ({ ...f, [k]: v }));

  const submit = () => {
    if (form.nom.length < 2) { setError('Nom requis.'); return; }
    setUserInfo(form);
    setShowTutorial(true);
  };

  const handleLoad = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try { await loadFromJson(file); } catch { setError('Fichier invalide.'); }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-app)', padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 680, animation: 'fadeInUp 0.5s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', marginBottom: 6 }}>
            👋 Bienvenue, {client?.name}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Créez un nouveau projet ou reprenez un dossier existant</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, background: 'var(--bg-card)', borderRadius: 12, padding: 5, border: '1px solid var(--border)', marginBottom: 24 }}>
          {[{ id: 'new', label: '📝 Nouveau projet' }, { id: 'load', label: '📤 Reprendre un dossier' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                flex: 1, padding: '10px', borderRadius: 8, fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '0.88rem',
                background: tab === t.id ? 'linear-gradient(135deg, #1e3a5f, #2563eb)' : 'transparent',
                color: tab === t.id ? '#fff' : 'var(--text-muted)', border: 'none', cursor: 'pointer',
                transition: 'var(--transition)',
              }}>{t.label}</button>
          ))}
        </div>

        {tab === 'new' ? (
          <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: 32, border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { label: 'Nom du client', key: 'nom', type: 'text' },
                { label: 'Email', key: 'email', type: 'email' },
                { label: 'Apport (€)', key: 'apport', type: 'number' },
                { label: 'Revenus mensuels (€)', key: 'revenus', type: 'number' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}</label>
                  <input type={f.type} value={form[f.key]}
                    onChange={e => setF(f.key)(f.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: '0.87rem', fontFamily: 'var(--font-sans)', outline: 'none' }}
                  />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Statut</label>
                <select value={form.statut} onChange={e => setF('statut')(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: '0.87rem', fontFamily: 'var(--font-sans)' }}>
                  {['Particulier', 'Société', 'Marchand de Biens'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Objectif</label>
                <select value={form.objectif} onChange={e => setF('objectif')(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: '0.87rem', fontFamily: 'var(--font-sans)' }}>
                  {['Rentabilité', 'Patrimoine', 'Achat-Revente', 'RP'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
            {error && <p style={{ color: 'var(--red)', fontSize: '0.82rem', marginTop: 12 }}>❌ {error}</p>}
            <div style={{ marginTop: 24 }}>
              <Btn onClick={submit} size="lg" style={{ width: '100%', justifyContent: 'center' }}>
                🚀 Démarrer mon projet
              </Btn>
            </div>
          </div>
        ) : (
          <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: 40, border: '1px solid var(--border)', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📁</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 20 }}>Sélectionnez votre fichier .json sauvegardé</div>
            <input type="file" accept=".json" onChange={handleLoad} style={{ display: 'none' }} id="json-load" />
            <label htmlFor="json-load">
              <Btn onClick={() => document.getElementById('json-load').click()} size="lg" variant="secondary">
                📤 Charger le fichier
              </Btn>
            </label>
            {error && <p style={{ color: 'var(--red)', fontSize: '0.82rem', marginTop: 12 }}>❌ {error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
