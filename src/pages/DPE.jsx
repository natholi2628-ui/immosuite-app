import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useOpenAI } from '../hooks/useOpenAI';
import { Card, Btn, Field, SectionTitle } from '../components/UI';

export default function DPE({ surface }) {
  const { dpeResult, setDpeResult } = useApp();
  const { chat } = useOpenAI();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    annee: 1970, vitrage: 'Double Ancien', chauffage: 'Élec (Grille-pain)',
    isolation: 'Aucune', toiture: 'Non isolés', ventilation: 'Aucune / Fenêtres',
  });

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  const analyse = async () => {
    setLoading(true); setError('');
    try {
      const prompt = `Tu es un expert DPE certifié. Analyse ce logement et réponds en markdown structuré.

CARACTÉRISTIQUES :
- Année construction : ${form.annee} | Surface : ${surface} m²
- Fenêtres : ${form.vitrage} | Chauffage : ${form.chauffage}
- Isolation murs : ${form.isolation} | Toiture : ${form.toiture} | Ventilation : ${form.ventilation}

RÉPONSE ATTENDUE (markdown) :
## Classe DPE estimée
Lettre A-G + consommation kWh/m²/an + émissions CO2 estimées

## Points forts (2-3)
## Points faibles (2-3)

## 3 travaux prioritaires pour gagner 2 classes
Pour chacun :
- Description précise
- Coût estimé (fourchette €)
- Gain énergétique %
- Aides disponibles (MaPrimeRénov, CEE, éco-PTZ)

## Rentabilité de la rénovation
Investissement total vs économies annuelles, retour sur investissement en années.`;

      const result = await chat([{ role: 'user', content: prompt }], { temperature: 0.2, maxTokens: 1200 });
      setDpeResult(result);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const DPE_CLASSES = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const DPE_COLORS  = ['#319834','#51a234','#b0c832','#f0e01e','#f0a01e','#eb6421','#d92121'];

  const detectedClass = dpeResult
    ? (dpeResult.match(/Classe\s+DPE[^A-G]*([A-G])\b/i) || dpeResult.match(/estimée?\s*[:\-]?\s*\*?\*?([A-G])\b/i) || dpeResult.match(/\b([A-G])\b/))?.[1]
    : null;

  const mdToHtml = (text) => {
    if (!text) return '';
    const lines = text.split('\n');
    const out = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      const inline = s => s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
      if (/^### /.test(line)) out.push(`<h4 style="color:var(--accent);font-size:.88rem;margin:12px 0 4px">${inline(line.slice(4))}</h4>`);
      else if (/^## /.test(line)) out.push(`<h3 style="color:var(--accent);font-size:.95rem;font-weight:700;margin:18px 0 8px;padding-bottom:6px;border-bottom:1px solid var(--border)">${inline(line.slice(3))}</h3>`);
      else if (/^# /.test(line)) out.push(`<h2 style="color:var(--accent);font-size:1rem;font-weight:800;margin:20px 0 8px">${inline(line.slice(2))}</h2>`);
      else if (/^- /.test(line)) {
        const items = [];
        while (i < lines.length && /^- /.test(lines[i])) { items.push(`<li style="margin:5px 0;padding-left:4px">${inline(lines[i].slice(2))}</li>`); i++; }
        out.push(`<ul style="margin:6px 0;padding-left:18px">${items.join('')}</ul>`);
        continue;
      }
      else if (line.trim() === '') out.push('<br>');
      else out.push(inline(line) + '<br>');
      i++;
    }
    return out.join('');
  };

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease both' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <Card>
          <SectionTitle>Caractéristiques du bien</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field label="Année de construction" type="number" value={form.annee} onChange={set('annee')} min={1800} max={2024} />
            <Field label="Type de fenêtres" value={form.vitrage} onChange={set('vitrage')}
              options={['Simple', 'Double Ancien', 'Double Récent', 'Triple']} />
            <Field label="Système de chauffage" value={form.chauffage} onChange={set('chauffage')}
              options={['Élec (Grille-pain)', 'Fioul', 'Gaz collectif', 'Gaz individuel', 'Pompe à Chaleur', 'Poêle à bois']} />
          </div>
        </Card>

        <Card>
          <SectionTitle>Isolation & ventilation</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field label="Isolation des murs" value={form.isolation} onChange={set('isolation')}
              options={['Aucune', 'Partielle', 'Récente (< 10 ans)']} />
            <Field label="Toiture / Combles" value={form.toiture} onChange={set('toiture')}
              options={['Non isolés', 'Laine de verre', 'Performante']} />
            <Field label="Ventilation" value={form.ventilation} onChange={set('ventilation')}
              options={['Aucune / Fenêtres', 'VMC Simple flux', 'VMC Double flux']} />
          </div>
        </Card>
      </div>

      {/* DPE Scale visual */}
      <Card style={{ marginBottom: 20 }}>
        <SectionTitle>Échelle DPE{detectedClass ? ` — Classe estimée : ${detectedClass}` : ' — référence visuelle'}</SectionTitle>
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          {DPE_CLASSES.map((cls, i) => {
            const isDetected = cls === detectedClass;
            return (
              <div key={cls} style={{
                flex: isDetected ? 1.4 : 1, height: isDetected ? 58 : 48, background: DPE_COLORS[i],
                borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: isDetected ? '1.3rem' : '1.1rem',
                color: i <= 1 ? '#fff' : i <= 3 ? '#1a1a1a' : '#fff',
                boxShadow: isDetected ? `0 0 0 3px #fff, 0 0 0 5px ${DPE_COLORS[i]}, 0 4px 16px rgba(0,0,0,0.3)` : '0 2px 6px rgba(0,0,0,0.15)',
                transition: 'all 0.4s ease',
                position: 'relative',
                alignSelf: 'center',
              }}>
                {cls}
                {isDetected && <span style={{ position: 'absolute', top: -18, fontSize: '0.6rem', fontWeight: 700, color: DPE_COLORS[i], whiteSpace: 'nowrap' }}>▼ ESTIMÉ</span>}
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Très performant</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Très énergivore</span>
        </div>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
        <Btn onClick={analyse} loading={loading} size="lg">
          🔍 Analyser le DPE par IA
        </Btn>
      </div>

      {error && (
        <div style={{ background: 'var(--red-light)', border: '1px solid var(--red)', borderRadius: 10, padding: '12px 16px', color: 'var(--red)', marginBottom: 16, fontSize: '0.85rem' }}>
          ❌ {error}
        </div>
      )}

      {dpeResult && (
        <Card style={{ animation: 'fadeInUp 0.4s ease' }}>
          <SectionTitle>Résultat de l'analyse DPE</SectionTitle>
          <div style={{ fontSize: '0.87rem', lineHeight: 1.75, color: 'var(--text-primary)' }}
            dangerouslySetInnerHTML={{ __html: mdToHtml(dpeResult) }}
          />
        </Card>
      )}
    </div>
  );
}
