import { useState, useRef } from 'react';
import { useOpenAI } from '../hooks/useOpenAI';

export default function SmartImport({ onImport }) {
  const { chat } = useOpenAI();
  const [loading, setLoading] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [files, setFiles] = useState([]);
  const [extracted, setExtracted] = useState(null);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef();

  const fileToBase64 = (file) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(',')[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

  const addFiles = (newFiles) => {
    const arr = Array.from(newFiles).filter(f => f.type.startsWith('image/'));
    if (!arr.length) return;
    setFiles(prev => [...prev, ...arr]);
    arr.forEach(f => {
      const url = URL.createObjectURL(f);
      setPreviews(prev => [...prev, url]);
    });
  };

  const removeFile = (i) => {
    setFiles(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const analyse = async () => {
    if (!files.length) return;
    setLoading(true); setError(''); setExtracted(null);

    try {
      const prompt = `Tu es un expert immobilier. Analyse ces ${files.length} image(s) d'annonce immobilière et extrait TOUTES les informations disponibles en combinant les infos de toutes les images.

Réponds UNIQUEMENT avec un objet JSON valide, sans texte avant ou après :

{
  "adresse": "adresse complète du bien",
  "surface": nombre en m² (entier),
  "prixNet": prix net vendeur en € (entier, sans les frais agence),
  "fraisAgence": frais d'agence en € (entier, 0 si non mentionné),
  "loyer": loyer mensuel HC en € (entier, null si non mentionné),
  "travauxBudget": budget travaux estimé en € (0 si non mentionné),
  "taxeFonciere": taxe foncière annuelle en € (null si non mentionnée),
  "charges": charges de copropriété annuelles en € (null si non mentionnées),
  "typeNotaire": "ancien" ou "neuf",
  "nbPieces": nombre de pièces (entier),
  "etage": étage (entier ou null),
  "anneeConstruction": année (entier ou null),
  "description": "courte description du bien en 1-2 phrases",
  "pointsForts": ["liste", "des", "points", "forts", "détectés"]
}

Si tu vois un prix total avec frais d'agence inclus, calcule le prix net en déduisant les frais.
Si les charges sont en €/mois, convertis en annuel. Mets null si tu n'es pas sûr.`;

      // Build content array with all images
      const content = [];
      for (const file of files) {
        const b64 = await fileToBase64(file);
        content.push({ type: 'image_url', image_url: { url: `data:image/jpeg;base64,${b64}` } });
      }
      content.push({ type: 'text', text: prompt });

      const result = await chat([{ role: 'user', content }],
        { model: 'gpt-4o', temperature: 0, maxTokens: 800 });

      const clean = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const data = JSON.parse(clean);
      setExtracted(data);
    } catch (e) {
      setError('Impossible de lire les annonces. Essaie avec des images plus nettes.');
    }
    setLoading(false);
  };

  const applyAndClose = () => {
    if (!extracted) return;
    const mapping = {};
    if (extracted.adresse)       mapping.adresse       = extracted.adresse;
    if (extracted.surface)       mapping.surface       = extracted.surface;
    if (extracted.prixNet)       mapping.prixNet       = extracted.prixNet;
    if (extracted.fraisAgence)   mapping.fraisAgence   = extracted.fraisAgence;
    if (extracted.loyer)         mapping.loyer         = extracted.loyer;
    if (extracted.travauxBudget) mapping.travauxBudget = extracted.travauxBudget;
    if (extracted.taxeFonciere)  mapping.taxeFonciere  = extracted.taxeFonciere;
    if (extracted.charges)       mapping.charges       = extracted.charges;
    if (extracted.typeNotaire)   mapping.typeNotaire   = extracted.typeNotaire;
    onImport(mapping);
    close();
  };

  const close = () => {
    setOpen(false); setPreviews([]); setFiles([]);
    setExtracted(null); setError('');
  };

  if (!open) return (
    <button onClick={() => setOpen(true)}
      style={{
        width: '100%', padding: '10px 16px', marginBottom: 8,
        background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(124,58,237,0.15))',
        border: '1px solid rgba(37,99,235,0.3)',
        borderRadius: 10, cursor: 'pointer', fontFamily: 'var(--font-sans)',
        display: 'flex', alignItems: 'center', gap: 8,
        color: '#93c5fd', fontSize: '0.8rem', fontWeight: 600,
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(135deg, rgba(37,99,235,0.25), rgba(124,58,237,0.25))'}
      onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(124,58,237,0.15))'}
    >
      <span style={{ fontSize: 16 }}>📸</span>
      <span>Import auto depuis annonce</span>
      <span style={{ marginLeft: 'auto', fontSize: 10, background: 'rgba(37,99,235,0.3)', padding: '2px 6px', borderRadius: 4 }}>IA</span>
    </button>
  );

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        background: 'var(--bg-card)', borderRadius: 16, width: '100%', maxWidth: 680,
        border: '1px solid var(--border)', boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
        maxHeight: '90vh', overflowY: 'auto',
        animation: 'fadeInUp 0.3s ease',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>📸 Import automatique</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Ajoute 1 ou plusieurs screenshots — l'IA combine tout
            </div>
          </div>
          <button onClick={close}
            style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 16, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        <div style={{ padding: 24 }}>

          {/* Drop zone */}
          <div
            onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => inputRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 12, padding: previews.length ? '16px' : '32px 20px',
              textAlign: 'center', cursor: 'pointer',
              background: dragOver ? 'var(--accent-light)' : 'var(--bg-secondary)',
              transition: 'all 0.2s', marginBottom: 16,
            }}>
            {previews.length === 0 ? (
              <>
                <div style={{ fontSize: 36, marginBottom: 10 }}>🖼️</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 5 }}>
                  Glisse tes screenshots ici
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 14 }}>
                  Plusieurs images acceptées — SeLoger, LeBonCoin, PAP, Bien'ici...
                </div>
                <div style={{ display: 'inline-block', padding: '8px 20px', background: 'var(--accent)', color: '#fff', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600 }}>
                  Choisir des images
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
                {previews.map((url, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={url} alt={`img${i}`} style={{ width: 100, height: 75, objectFit: 'cover', borderRadius: 8, border: '2px solid var(--accent)' }} />
                    <button onClick={() => removeFile(i)}
                      style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: 'var(--red)', border: 'none', color: '#fff', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>✕</button>
                  </div>
                ))}
                {/* Add more button */}
                <div onClick={() => inputRef.current?.click()}
                  style={{ width: 100, height: 75, borderRadius: 8, border: '2px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.72rem', gap: 4 }}>
                  <span style={{ fontSize: 20 }}>+</span>
                  <span>Ajouter</span>
                </div>
              </div>
            )}
            <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
              onChange={e => addFiles(e.target.files)} />
          </div>

          {/* Analyse button */}
          {files.length > 0 && !extracted && !loading && (
            <button onClick={analyse}
              style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #1e3a5f, #2563eb)', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', fontFamily: 'var(--font-sans)', marginBottom: 16, boxShadow: '0 4px 14px rgba(37,99,235,0.35)' }}>
              🔍 Analyser {files.length} image{files.length > 1 ? 's' : ''} avec l'IA
            </button>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: 10, animation: 'pulse 1s infinite' }}>🔍</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Analyse de {files.length} image{files.length > 1 ? 's' : ''} en cours...
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>L'IA combine toutes les informations</div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ background: 'var(--red-light)', border: '1px solid var(--red)', borderRadius: 10, padding: '12px 16px', color: 'var(--red)', fontSize: '0.84rem', marginBottom: 16 }}>
              ❌ {error}
            </div>
          )}

          {/* Results */}
          {extracted && (
            <div style={{ animation: 'fadeInUp 0.3s ease' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                ✅ {Object.values(extracted).filter(v => v !== null).length} informations détectées
              </div>

              {extracted.description && (
                <div style={{ background: 'var(--accent-light)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: '0.82rem', color: 'var(--accent)', fontStyle: 'italic' }}>
                  "{extracted.description}"
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                {[
                  { label: '📍 Adresse',       val: extracted.adresse },
                  { label: '📐 Surface',        val: extracted.surface ? `${extracted.surface} m²` : null },
                  { label: '💰 Prix net',       val: extracted.prixNet ? `${extracted.prixNet.toLocaleString('fr-FR')} €` : null },
                  { label: '🏢 Frais agence',   val: extracted.fraisAgence ? `${extracted.fraisAgence.toLocaleString('fr-FR')} €` : null },
                  { label: '🏠 Loyer estimé',   val: extracted.loyer ? `${extracted.loyer} €/mois` : null },
                  { label: '🔨 Travaux',        val: extracted.travauxBudget ? `${extracted.travauxBudget.toLocaleString('fr-FR')} €` : null },
                  { label: '📋 Charges copro',  val: extracted.charges ? `${extracted.charges.toLocaleString('fr-FR')} €/an` : null },
                  { label: '🏛️ Taxe foncière',  val: extracted.taxeFonciere ? `${extracted.taxeFonciere.toLocaleString('fr-FR')} €/an` : null },
                  { label: '🏗️ Type',           val: extracted.typeNotaire === 'neuf' ? 'Neuf' : 'Ancien' },
                  { label: '🚪 Pièces',         val: extracted.nbPieces ? `${extracted.nbPieces} pièces` : null },
                ].filter(i => i.val).map(item => (
                  <div key={item.label} style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '8px 12px' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>{item.label}</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2, wordBreak: 'break-word' }}>{item.val}</div>
                  </div>
                ))}
              </div>

              {extracted.pointsForts?.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Points forts détectés</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {extracted.pointsForts.map((p, i) => (
                      <span key={i} style={{ background: 'var(--green-light)', color: 'var(--green)', borderRadius: 20, padding: '3px 10px', fontSize: '0.75rem', fontWeight: 600 }}>✓ {p}</span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={applyAndClose}
                  style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #1e3a5f, #2563eb)', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', fontFamily: 'var(--font-sans)', boxShadow: '0 4px 14px rgba(37,99,235,0.35)' }}>
                  ✅ Appliquer ces données
                </button>
                <button onClick={() => { setExtracted(null); setFiles([]); setPreviews([]); }}
                  style={{ padding: '12px 16px', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                  🔄 Réessayer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
