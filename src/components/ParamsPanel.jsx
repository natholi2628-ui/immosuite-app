import { useState } from 'react';

export default function ParamsPanel({ params, setParam }) {
  const [open, setOpen] = useState(false);

  const F = ({ label, k, type = 'number', min, max, step = 1, opts }) => (
    <div style={{ marginBottom: 10 }}>
      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>{label}</label>
      {opts ? (
        <select value={params[k]} onChange={e => setParam(k, e.target.value)}
          style={{ width: '100%', background: 'rgba(255,255,255,0.07)', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, padding: '7px 10px', fontSize: '0.8rem', fontFamily: 'var(--font-sans)' }}>
          {opts.map(o => <option key={o.v || o} value={o.v || o}>{o.l || o}</option>)}
        </select>
      ) : (
        <input type={type} value={params[k]} min={min} max={max} step={step}
          onChange={e => setParam(k, type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
          style={{ width: '100%', background: 'rgba(255,255,255,0.07)', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, padding: '7px 10px', fontSize: '0.82rem', fontFamily: 'var(--font-sans)', outline: 'none' }}
        />
      )}
    </div>
  );

  return (
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '0 0 8px' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', padding: '12px 20px', background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)',
          textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'var(--font-sans)',
        }}>
        <span>⚙️ Paramètres du bien</span>
        <span style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>▾</span>
      </button>

      {open && (
        <div style={{ padding: '4px 16px 8px', animation: 'fadeIn 0.2s ease' }}>
          <F label="Adresse" k="adresse" type="text" />
          <F label="Surface m²" k="surface" min={5} />
          <F label="Prix net €" k="prixNet" step={1000} />
          <F label="Frais agence €" k="fraisAgence" step={500} />
          <F label="Budget travaux €" k="travauxBudget" step={1000} />
          <F label="Type de bien" k="typeNotaire" opts={[{ v: 'ancien', l: 'Ancien (~7.5%)' }, { v: 'neuf', l: 'Neuf (~2.5%)' }]} />
          <F label="Apport €" k="apport" step={1000} />
          <F label="Durée crédit (ans)" k="dureeCredit" min={5} max={30} />
          <F label="Taux crédit %" k="tauxInteret" step={0.1} />
          <F label="Assurance %" k="assurance" step={0.01} />
          <F label="Loyer HC €/mois" k="loyer" step={50} />
          <F label="Taxe foncière €/an" k="taxeFonciere" step={50} />
          <F label="Charges copro €/an" k="charges" step={100} />

          <div style={{ marginTop: 12, padding: '10px', background: 'rgba(255,255,255,0.04)', borderRadius: 8 }}>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Prix unitaires</div>
            <F label="Peinture €/m²" k="pxPeinture" />
            <F label="Sol €/m²" k="pxSol" />
            <F label="Cuisine €" k="pxCuisine" step={500} />
            <F label="SDB €" k="pxSdb" step={500} />
          </div>
        </div>
      )}
    </div>
  );
}
