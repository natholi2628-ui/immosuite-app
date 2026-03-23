/* ── AUDIT ── */
import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useOpenAI } from '../hooks/useOpenAI';
import { Card, Btn, SectionTitle } from '../components/UI';

export function Audit({ surface, gamme, pxPeinture, pxSol, pxCuisine, pxSdb, userInfo }) {
  const { rapportAudit, setRapportAudit, notesPhotos, setNotesPhotos } = useApp();
  const { chat } = useOpenAI();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFiles = (e) => setFiles(Array.from(e.target.files));

  const generate = async () => {
    setLoading(true); setError('');
    try {
      const system = `Tu es expert en rénovation immobilière et maître d'œuvre.
CLIENT : ${userInfo?.nom || 'Client'} | OBJECTIF : ${userInfo?.objectif || 'Rentabilité'} | GAMME : ${gamme}
BARÈME : Peinture ${pxPeinture}€/m² | Sol ${pxSol}€/m² | Cuisine ${pxCuisine}€ | SDB ${pxSdb}€ | Surface ${surface}m²
GAMME : ${gamme.includes('Économique') ? 'Brico Dépôt, Leroy Merlin entrée de gamme' : gamme.includes('Premium') ? 'Porcelanosa, Schmidt, haut de gamme' : 'Leroy Merlin milieu de gamme, Castorama'}

FORMAT : Tableau Markdown | Pièce | Travail | Produit | Marque | Prix HT | Lien Shopping |
Lien: https://www.google.com/search?tbm=shop&q=[produit]+[marque]

Puis RÉCAPITULATIF : total estimé, délai chantier, 3 priorités.`;

      const userParts = [{ type: 'text', text: `Surface : ${surface}m². Photos et consignes :` }];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const note = notesPhotos[`note_${file.name}_${i}`] || 'Analyser';
        const b64 = await fileToBase64(file);
        userParts.push({ type: 'text', text: `--- PHOTO ${i+1} : ${note}` });
        userParts.push({ type: 'image_url', image_url: { url: `data:image/jpeg;base64,${b64}` } });
      }

      // Use text-only if no files
      const msgs = files.length > 0
        ? [{ role: 'system', content: system }, { role: 'user', content: userParts }]
        : [{ role: 'user', content: `${system}\n\nGénère une liste de travaux type pour un appartement ${gamme} de ${surface}m² sans photos.` }];

      const model = files.length > 0 ? 'gpt-4o' : 'gpt-4o-mini';
      const result = await chat(msgs, { model, temperature: 0.1, maxTokens: 2000 });
      setRapportAudit(result);
    } catch(e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease both' }}>
      <Card style={{ marginBottom: 16 }}>
        <SectionTitle>📸 Photos du bien</SectionTitle>
        <div style={{ border: '2px dashed var(--border)', borderRadius: 10, padding: 24, textAlign: 'center', marginTop: 8 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📸</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
            Uploadez vos photos pour une analyse IA précise
          </div>
          <input type="file" multiple accept="image/*" onChange={handleFiles} style={{ display: 'none' }} id="photo-upload" />
          <label htmlFor="photo-upload">
            <Btn onClick={() => document.getElementById('photo-upload').click()} variant="secondary">
              Sélectionner des photos
            </Btn>
          </label>
          {files.length > 0 && (
            <div style={{ marginTop: 12, fontSize: '0.8rem', color: 'var(--green)', fontWeight: 600 }}>
              ✅ {files.length} photo(s) sélectionnée(s)
            </div>
          )}
        </div>
      </Card>

      {files.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
          {files.map((file, i) => {
            const key = `note_${file.name}_${i}`;
            const url = URL.createObjectURL(file);
            return (
              <Card key={i}>
                <img src={url} alt={file.name} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />
                <textarea
                  placeholder="Consigne pour cette photo..."
                  value={notesPhotos[key] || ''}
                  onChange={e => setNotesPhotos(n => ({ ...n, [key]: e.target.value }))}
                  rows={2} style={{ fontSize: '0.8rem', resize: 'none', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px', width: '100%' }}
                />
              </Card>
            );
          })}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 20 }}>
        <Btn onClick={generate} loading={loading} size="lg">
          🚀 Générer la liste travaux & shopping
        </Btn>
      </div>

      {error && <div style={{ background: 'var(--red-light)', border: '1px solid var(--red)', borderRadius: 10, padding: '12px 16px', color: 'var(--red)', marginBottom: 16, fontSize: '0.85rem' }}>❌ {error}</div>}

      {rapportAudit && (
        <Card style={{ animation: 'fadeInUp 0.4s ease' }}>
          <SectionTitle>Résultats de l'audit</SectionTitle>
          <div style={{ fontSize: '0.85rem', lineHeight: 1.7, color: 'var(--text-primary)', overflowX: 'auto' }}
            dangerouslySetInnerHTML={{ __html: mdToHtml(rapportAudit) }}
          />
        </Card>
      )}
    </div>
  );
}

async function fileToBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(',')[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

/* ── MARKDOWN → HTML (pour le rapport) ── */
function mdToHtml(text) {
  if (!text) return '';
  const lines = text.split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim().startsWith('|')) {
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      let tHtml = '<table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:.82rem">';
      let isFirst = true;
      for (const tl of tableLines) {
        if (/^\|[\s\-:|]+\|/.test(tl.trim())) continue;
        const cells = tl.split('|').slice(1, -1);
        if (isFirst) {
          tHtml += '<tr>' + cells.map(c => `<th style="background:#1e3a5f;color:#fff;padding:8px 12px;text-align:left">${c.trim()}</th>`).join('') + '</tr>';
          isFirst = false;
        } else {
          tHtml += '<tr>' + cells.map(c => `<td style="padding:8px 12px;border-bottom:1px solid #e2e8f0">${c.trim()}</td>`).join('') + '</tr>';
        }
      }
      out.push(tHtml + '</table>');
      continue;
    }
    const inline = s => s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
    if (/^### /.test(line)) out.push(`<h4 style="color:#1e3a5f;font-size:.88rem;margin:10px 0 4px">${inline(line.slice(4))}</h4>`);
    else if (/^## /.test(line)) out.push(`<h3 style="color:#1e3a5f;font-size:.96rem;margin:16px 0 6px">${inline(line.slice(3))}</h3>`);
    else if (/^# /.test(line)) out.push(`<h2 style="color:#1e3a5f;border-bottom:2px solid #e2e8f0;padding-bottom:6px;margin-top:24px">${inline(line.slice(2))}</h2>`);
    else if (line.trim() === '') out.push('<br>');
    else out.push(inline(line) + '<br>');
    i++;
  }
  return out.join('');
}

/* ── COMPARATEUR IMPORT MODAL ── */
function ComparateurImportModal({ chat, onApply, onClose }) {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const addFiles = (newFiles) => {
    const arr = Array.from(newFiles).filter(f => f.type.startsWith('image/'));
    setFiles(prev => [...prev, ...arr]);
    arr.forEach(f => setPreviews(prev => [...prev, URL.createObjectURL(f)]));
  };

  const analyse = async () => {
    if (!files.length) return;
    setLoading(true); setError('');
    try {
      const prompt = `Analyse cette annonce immobilière et extrait ces données en JSON :
{"adresse":"adresse complète","surface":nombre,"prix":prix net vendeur entier,"travaux":budget travaux entier (0 si absent),"loyer":loyer mensuel entier,"charges":charges+taxe foncière annuelles entier (0 si absent)}
Réponds UNIQUEMENT avec le JSON, sans texte autour.`;
      const content = [];
      for (const file of files) {
        const b64 = await fileToBase64(file);
        content.push({ type: 'image_url', image_url: { url: `data:image/jpeg;base64,${b64}` } });
      }
      content.push({ type: 'text', text: prompt });
      const result = await chat([{ role: 'user', content }], { model: 'gpt-4o', temperature: 0, maxTokens: 400 });
      const clean = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      onApply(JSON.parse(clean));
      onClose();
    } catch {
      setError("Impossible de lire l'annonce. Essaie avec une image plus nette.");
    }
    setLoading(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'var(--bg-card)', borderRadius: 16, width: '100%', maxWidth: 500, border: '1px solid var(--border)', boxShadow: '0 24px 80px rgba(0,0,0,0.4)', animation: 'fadeInUp 0.3s ease' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>📸 Import depuis annonce</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>L'IA extrait les données automatiquement</div>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 14, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
        <div style={{ padding: 22 }}>
          <div onClick={() => inputRef.current?.click()} style={{ border: '2px dashed var(--border)', borderRadius: 12, padding: 20, textAlign: 'center', cursor: 'pointer', background: 'var(--bg-secondary)', marginBottom: 14 }}>
            {previews.length === 0 ? (
              <>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🖼️</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Clique ou glisse tes screenshots</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SeLoger, LeBonCoin, PAP, Bien'ici...</div>
              </>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
                {previews.map((url, i) => (
                  <img key={i} src={url} alt={`img${i}`} style={{ width: 90, height: 68, objectFit: 'cover', borderRadius: 8, border: '2px solid var(--accent)' }} />
                ))}
                <div onClick={e => { e.stopPropagation(); inputRef.current?.click(); }} style={{ width: 90, height: 68, borderRadius: 8, border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 22 }}>+</div>
              </div>
            )}
            <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => addFiles(e.target.files)} />
          </div>
          {error && <div style={{ background: 'var(--red-light)', border: '1px solid var(--red)', borderRadius: 8, padding: '10px 14px', color: 'var(--red)', fontSize: '0.82rem', marginBottom: 12 }}>❌ {error}</div>}
          {loading && <div style={{ textAlign: 'center', padding: '10px 0', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>🔍 Analyse en cours...</div>}
          {files.length > 0 && !loading && (
            <button onClick={analyse} style={{ width: '100%', padding: '11px', background: 'linear-gradient(135deg, #1e3a5f, #2563eb)', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem', fontFamily: 'var(--font-sans)', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}>
              🔍 Analyser {files.length} image{files.length > 1 ? 's' : ''} avec l'IA
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── ANNONCE ── */
export function Annonce({ params, calc }) {
  const { annonce, setAnnonce } = useApp();
  const { chat } = useOpenAI();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [type, setType]   = useState('Location longue durée');
  const [ton, setTon]     = useState('Professionnel');
  const [long, setLong]   = useState('Standard (250 mots)');
  const [points, setPoints] = useState('');

  const generate = async () => {
    setLoading(true); setError('');
    try {
      const prompt = `Tu es expert en rédaction d'annonces immobilières à fort taux de conversion.
BRIEF : Type: ${type} | Adresse: ${params.adresse} | Surface: ${params.surface}m²
Loyer/Prix: ${type.includes('Location') ? params.loyer : Math.round(calc.coutTotal)}€
Rentabilité: ${calc.rentaBrute.toFixed(1)}% | Standing: ${params.gamme}
Points forts: ${points || 'À définir'} | Ton: ${ton} | Longueur: ${long}

Rédige une annonce avec : 1/ Titre percutant 2/ Accroche 2 phrases 3/ Description 4/ Atouts clés 5/ Appel à l'action.`;
      const result = await chat([{ role: 'user', content: prompt }], { temperature: 0.7, maxTokens: 600 });
      setAnnonce(result);
    } catch(e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease both' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <Card>
          <SectionTitle>Paramètres de l'annonce</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
            {[
              { label: 'Type', val: type, set: setType, opts: ['Location longue durée', 'Vente', 'Colocation', 'Location meublée'] },
              { label: 'Ton', val: ton, set: setTon, opts: ['Professionnel', 'Chaleureux', 'Vendeur / Impact'] },
              { label: 'Longueur', val: long, set: setLong, opts: ['Courte (150 mots)', 'Standard (250 mots)', 'Détaillée (400 mots)'] },
            ].map(f => (
              <div key={f.label} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{f.label}</label>
                <select value={f.val} onChange={e => f.set(e.target.value)}
                  style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', fontSize: '0.85rem', fontFamily: 'var(--font-sans)' }}>
                  {f.opts.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Points forts (optionnel)</label>
              <textarea value={points} onChange={e => setPoints(e.target.value)} rows={3}
                placeholder="Vue dégagée, proche transports..."
                style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', fontSize: '0.85rem', resize: 'none', fontFamily: 'var(--font-sans)' }} />
            </div>
          </div>
        </Card>

        <Card>
          <SectionTitle>Aperçu du bien</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            {[
              ['📍 Adresse', params.adresse],
              ['📐 Surface', `${params.surface} m²`],
              ['💰 Loyer/Prix', `${type.includes('Location') ? params.loyer : Math.round(calc.coutTotal).toLocaleString('fr-FR')} €`],
              ['📈 Rentabilité', `${calc.rentaBrute.toFixed(2)}%`],
              ['💎 Standing', params.gamme],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 7 }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{k}</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{v}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
        <Btn onClick={generate} loading={loading} size="lg">✨ Générer l'annonce</Btn>
      </div>

      {error && <div style={{ background: 'var(--red-light)', border: '1px solid var(--red)', borderRadius: 10, padding: '12px', color: 'var(--red)', marginBottom: 16, fontSize: '0.85rem' }}>❌ {error}</div>}

      {annonce && (
        <Card style={{ animation: 'fadeInUp 0.4s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <SectionTitle>Annonce générée</SectionTitle>
            <button onClick={() => { const blob = new Blob([annonce], { type: 'text/plain' }); const u = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=u; a.download='annonce.txt'; a.click(); }}
              style={{ fontSize: '0.8rem', color: 'var(--accent)', cursor: 'pointer', background: 'none', border: '1px solid var(--accent)', borderRadius: 8, padding: '6px 12px', fontFamily: 'var(--font-sans)' }}>
              📋 Télécharger
            </button>
          </div>
          <div style={{ fontSize: '0.88rem', lineHeight: 1.75, color: 'var(--text-primary)', whiteSpace: 'pre-wrap', padding: '14px', background: 'var(--bg-secondary)', borderRadius: 10 }}>
            {annonce}
          </div>
        </Card>
      )}
    </div>
  );
}

/* ── COMPARATEUR ── */
export function Comparateur({ currentBien, currentCalc }) {
  const { comparateur, setComparateur } = useApp();
  const { chat } = useOpenAI();
  const [form, setForm] = useState({ adresse: '', surface: 40, prix: 150000, travaux: 15000, loyer: 900, charges: 1500, apport: 20000, taux: 3.8, duree: 20 });
  const [showImport, setShowImport] = useState(false);
  const setF = k => v => setForm(f => ({ ...f, [k]: v }));

  const addBien = () => {
    const fraisNot = form.prix * 0.075;
    const cout     = form.prix + form.travaux + fraisNot;
    const emp      = Math.max(0, cout - form.apport);
    const tm       = form.taux / 100 / 12;
    const nb       = form.duree * 12;
    const mens     = tm > 0 ? (emp * tm) / (1 - Math.pow(1+tm,-nb)) : emp/nb;
    const renta    = cout > 0 ? (form.loyer*12/cout*100) : 0;
    const cf       = (form.loyer*12 - form.charges - mens*12) / 12;

    let score = 0;
    score += renta >= 8 ? 35 : renta >= 6 ? 25 : renta >= 4 ? 15 : 5;
    score += cf >= 200 ? 30 : cf >= 0 ? 18 : cf >= -150 ? 8 : 0;
    const lev = cout / Math.max(form.apport, 1);
    score += lev >= 5 ? 20 : lev >= 3 ? 13 : 6;
    const pm2 = cout / Math.max(form.surface, 1);
    score += pm2 <= 2000 ? 15 : pm2 <= 4000 ? 10 : pm2 <= 6000 ? 5 : 2;

    setComparateur(c => [...c, {
      adresse: form.adresse || `Bien ${c.length + 1}`,
      surface: form.surface, cout: Math.round(cout),
      prixM2: Math.round(cout/form.surface),
      renta: +renta.toFixed(2), cf: Math.round(cf), score,
    }]);
    setForm({ adresse: '', surface: 40, prix: 150000, travaux: 15000, loyer: 900, charges: 1500, apport: 20000, taux: 3.8, duree: 20 });
  };

  const actuel = {
    adresse: `[Actuel] ${currentBien.adresse}`, surface: currentBien.surface,
    cout: Math.round(currentCalc.coutTotal), prixM2: Math.round(currentCalc.coutTotal / Math.max(currentBien.surface, 1)),
    renta: +currentCalc.rentaBrute.toFixed(2), cf: Math.round(currentCalc.cashflowMois), score: currentCalc.score,
  };

  const tous = [actuel, ...comparateur];
  const best = tous.reduce((a, b) => a.score > b.score ? a : b, tous[0]);

  const FI = ({ label, value, set, type = 'number' }) => (
    <div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 3, fontWeight: 600 }}>{label}</div>
      <input type={type} value={value} onChange={e => set(type === 'number' ? parseFloat(e.target.value)||0 : e.target.value)}
        style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 10px', fontSize: '0.82rem', width: '100%' }} />
    </div>
  );

  const applyImport = (data) => {
    setForm(f => ({
      ...f,
      ...(data.adresse  && { adresse:  data.adresse }),
      ...(data.surface  && { surface:  data.surface }),
      ...(data.prix     && { prix:     data.prix }),
      ...(data.travaux !== undefined && { travaux: data.travaux }),
      ...(data.loyer    && { loyer:    data.loyer }),
      ...(data.charges  && { charges:  data.charges }),
    }));
  };

  return (
    <>
      {showImport && <ComparateurImportModal chat={chat} onApply={applyImport} onClose={() => setShowImport(false)} />}
    <div style={{ animation: 'fadeInUp 0.4s ease both' }}>
      <Card style={{ marginBottom: 16 }}>
        <SectionTitle>➕ Ajouter un bien à comparer</SectionTitle>
        <button onClick={() => setShowImport(true)} style={{
          width: '100%', padding: '9px 14px', marginBottom: 14, marginTop: 4,
          background: 'linear-gradient(135deg, rgba(37,99,235,0.12), rgba(124,58,237,0.12))',
          border: '1px solid rgba(37,99,235,0.28)', borderRadius: 9, cursor: 'pointer',
          fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: 8,
          color: 'var(--accent)', fontSize: '0.82rem', fontWeight: 600,
        }}>
          <span>📸</span><span>Import depuis screenshot IA</span>
          <span style={{ marginLeft: 'auto', fontSize: 10, background: 'rgba(37,99,235,0.2)', padding: '2px 7px', borderRadius: 4 }}>IA</span>
        </button>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 12 }}>
          <FI label="Adresse" value={form.adresse} set={setF('adresse')} type="text" />
          <FI label="Surface m²" value={form.surface} set={setF('surface')} />
          <FI label="Prix net €" value={form.prix} set={setF('prix')} />
          <FI label="Travaux €" value={form.travaux} set={setF('travaux')} />
          <FI label="Loyer €/mois" value={form.loyer} set={setF('loyer')} />
          <FI label="Charges+TF €/an" value={form.charges} set={setF('charges')} />
          <FI label="Apport €" value={form.apport} set={setF('apport')} />
          <FI label="Taux %" value={form.taux} set={setF('taux')} />
          <FI label="Durée ans" value={form.duree} set={setF('duree')} />
        </div>
        <div style={{ marginTop: 14 }}>
          <Btn onClick={addBien}>➕ Ajouter ce bien</Btn>
        </div>
      </Card>

      {comparateur.length > 0 && (
        <>
          <div style={{ background: 'var(--green-light)', border: '1px solid var(--green)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: '0.85rem', color: 'var(--green)', fontWeight: 600 }}>
            🏆 Meilleur investissement : {best.adresse} — Score {best.score}/100
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${tous.length}, 1fr)`, gap: 12, marginBottom: 16, overflowX: 'auto' }}>
            {tous.map((b, i) => {
              const isBest = b.adresse === best.adresse;
              const sc = b.score >= 70 ? 'var(--green)' : b.score >= 45 ? 'var(--amber)' : 'var(--red)';
              return (
                <div key={i} style={{
                  background: 'var(--bg-card)', borderRadius: 12, padding: 16,
                  border: `2px solid ${isBest ? 'var(--green)' : 'var(--border)'}`,
                  boxShadow: isBest ? '0 0 0 4px var(--green-light)' : 'var(--shadow-sm)',
                }}>
                  {isBest && <div style={{ fontSize: '0.7rem', background: 'var(--green)', color: '#fff', borderRadius: 20, padding: '2px 10px', display: 'inline-block', marginBottom: 8, fontWeight: 700 }}>🏆 MEILLEUR</div>}
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>{b.adresse}</div>
                  {[
                    ['Rentabilité', `${b.renta}%`],
                    ['Cashflow', `${b.cf}€/mois`],
                    ['Prix/m²', `${b.prixM2}€`],
                    ['Score', `${b.score}/100`],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--border-light)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{k}</span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: k === 'Score' ? sc : 'var(--text-primary)' }}>{v}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Btn onClick={() => setComparateur([])} variant="ghost" size="sm">🗑️ Vider</Btn>
          </div>
        </>
      )}
    </div>
    </>
  );
}

/* ── RAPPORT ── */
export function Rapport({ calc, params, userInfo, gamme }) {
  const { rapportAudit, dpeResult, annonce, comparateur } = useApp();
  const [generated, setGenerated] = useState(false);

  const canGenerate = rapportAudit || dpeResult;

  const download = () => {
    const date = new Date().toLocaleDateString('fr-FR');
    const scColor = calc.score >= 70 ? '#16a34a' : calc.score >= 45 ? '#d97706' : '#dc2626';
    const scLabel = calc.score >= 70 ? 'Excellent' : calc.score >= 45 ? 'Correct' : 'Risqué';

    const compSection = comparateur.length > 0 ? `
      <h2>Comparateur de biens</h2>
      <table><tr><th>Adresse</th><th>Rentabilité</th><th>Cashflow</th><th>Score</th></tr>
      ${comparateur.map(b => `<tr><td>${b.adresse}</td><td>${b.renta}%</td><td>${b.cf}€/mois</td><td>${b.score}/100</td></tr>`).join('')}
      </table>` : '';

    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
<style>
body{font-family:'Helvetica Neue',sans-serif;color:#0f172a;background:#f8fafc;margin:0}
.container{max-width:860px;margin:0 auto;background:#fff;box-shadow:0 4px 24px rgba(0,0,0,.08)}
.header{background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%);color:#fff;padding:40px;display:flex;justify-content:space-between;align-items:center}
.header h1{font-size:1.6rem;margin:0;font-weight:700}
.content{padding:40px}
.kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin:24px 0}
.kpi{background:#f0f4ff;border-radius:10px;padding:16px;text-align:center;border-top:3px solid #2563eb}
.kpi h3{margin:0;font-size:1.5rem;color:#1e3a5f}
.kpi small{color:#64748b;font-size:.8rem}
h2{color:#1e3a5f;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:36px}
table{width:100%;border-collapse:collapse;margin-top:12px;font-size:.88rem}
th{background:#1e3a5f;color:#fff;padding:10px;text-align:left}
td{padding:10px;border-bottom:1px solid #e2e8f0}
tr:nth-child(even){background:#f8fafc}
.footer{background:#0f172a;color:#64748b;text-align:center;padding:20px;font-size:.8rem}
.badge{display:inline-block;background:${scColor};color:#fff;border-radius:20px;padding:4px 14px;font-weight:700}
</style></head><body>
<div class="container">
  <div class="header">
    <div><h1>DOSSIER INVESTISSEMENT<br>${userInfo?.nom || ''}</h1><small style="opacity:.6">Généré le ${date} | ImmoSuite V25</small></div>
    <div style="text-align:right"><div style="font-size:2.5rem;font-weight:800">${calc.score}/100</div><span class="badge">${scLabel}</span></div>
  </div>
  <div class="content">
    <h2>Le Bien</h2>
    <p><strong>Adresse :</strong> ${params.adresse} | <strong>Surface :</strong> ${params.surface}m² | <strong>Standing :</strong> ${gamme}<br>
    <strong>Client :</strong> ${userInfo?.nom || ''} (${userInfo?.statut || ''}) | <strong>Objectif :</strong> ${userInfo?.objectif || ''}</p>
    <div class="kpi-grid">
      <div class="kpi"><h3>${Math.round(calc.coutTotal).toLocaleString('fr-FR')} €</h3><small>Coût Total</small></div>
      <div class="kpi"><h3>${calc.rentaBrute.toFixed(2)}%</h3><small>Rentabilité</small></div>
      <div class="kpi"><h3>${Math.round(calc.cashflowMois)} €</h3><small>Cashflow/mois</small></div>
      <div class="kpi"><h3>${Math.round(calc.mensualite)} €</h3><small>Mensualité</small></div>
    </div>
    ${dpeResult ? `<h2>DPE & Énergie</h2><div>${mdToHtml(dpeResult)}</div>` : ''}
    ${rapportAudit ? `<h2>Travaux & Shopping (${gamme})</h2>${mdToHtml(rapportAudit)}` : ''}
    ${annonce ? `<h2>Annonce</h2><div style="background:#f0f4ff;padding:16px;border-radius:8px;white-space:pre-wrap;font-size:.88rem;line-height:1.7">${annonce.replace(/</g,'&lt;')}</div>` : ''}
    ${compSection}
  </div>
  <div class="footer">ImmoSuite V25 — Document confidentiel | ${userInfo?.nom || ''} | ${date}</div>
</div></body></html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `Dossier_${(userInfo?.nom || 'ImmoSuite').replace(/\s+/g,'_')}_${date.replace(/\//g,'')}.html`;
    a.click();
    URL.revokeObjectURL(url);
    setGenerated(true);
  };

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease both' }}>
      {!canGenerate ? (
        <Card>
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Dossier non disponible</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Complétez au minimum l'Audit (onglet 🛠️) ou le DPE (onglet ⚡) pour générer le rapport.</div>
          </div>
        </Card>
      ) : (
        <>
          <Card style={{ marginBottom: 16 }}>
            <SectionTitle>Contenu du rapport</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
              {[
                ['📊 Finance & KPIs', true],
                ['⚡ Analyse DPE', !!dpeResult],
                ['🛠️ Audit Travaux & Shopping', !!rapportAudit],
                ['✍️ Annonce', !!annonce],
                ['🔀 Comparateur', comparateur.length > 0],
              ].map(([label, ok]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: ok ? 'var(--green-light)' : 'var(--bg-secondary)', borderRadius: 8 }}>
                  <span style={{ fontSize: 16 }}>{ok ? '✅' : '⭕'}</span>
                  <span style={{ fontSize: '0.85rem', color: ok ? 'var(--green)' : 'var(--text-muted)', fontWeight: ok ? 600 : 400 }}>{label}</span>
                </div>
              ))}
            </div>
          </Card>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Btn onClick={download} size="lg">📥 Télécharger le dossier complet (HTML)</Btn>
          </div>

          {generated && (
            <div style={{ marginTop: 16, textAlign: 'center', fontSize: '0.85rem', color: 'var(--green)', fontWeight: 600, animation: 'fadeInUp 0.3s ease' }}>
              ✅ Dossier téléchargé avec succès !
            </div>
          )}
        </>
      )}
    </div>
  );
}
