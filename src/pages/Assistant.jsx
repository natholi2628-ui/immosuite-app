import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useOpenAI } from '../hooks/useOpenAI';
import { Btn } from '../components/UI';
import { scoreLabel } from '../hooks/useCalcs';

export default function Assistant({ calc, params }) {
  const { messages, setMessages, userInfo } = useApp();
  const { chat } = useOpenAI();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const systemCtx = `Tu es un expert en investissement immobilier francophone, fiscaliste et gestionnaire de patrimoine.

CONTEXTE DOSSIER :
- Client : ${userInfo?.nom || 'Client'} (${userInfo?.statut || ''}) | Objectif : ${userInfo?.objectif || ''}
- Bien : ${params.adresse} | Surface : ${params.surface} m² | Gamme : ${params.gamme}
- Coût total : ${Math.round(calc.coutTotal).toLocaleString('fr-FR')} € | Rentabilité : ${calc.rentaBrute.toFixed(2)}% | Cashflow : ${Math.round(calc.cashflowMois)} €/mois
- Score : ${calc.score}/100 (${scoreLabel(calc.score)})
- Apport : ${(userInfo?.apport || 0).toLocaleString('fr-FR')} € | Revenus : ${(userInfo?.revenus || 0).toLocaleString('fr-FR')} €/mois

Réponds de façon précise, professionnelle et actionnable en français. Max 400 mots sauf si demandé.`;

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input.trim() };
    setMessages(m => [...m, userMsg]);
    setInput(''); setError('');
    setLoading(true);
    try {
      const history = [...messages, userMsg];
      const reply = await chat(
        [{ role: 'system', content: systemCtx }, ...history],
        { temperature: 0.4, maxTokens: 800 }
      );
      setMessages(m => [...m, { role: 'assistant', content: reply }]);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const SUGGESTIONS = [
    'Quel régime fiscal me recommandes-tu ?',
    'Comment améliorer mon cashflow ?',
    'Est-ce le bon moment pour acheter ?',
    'Comment optimiser ma fiscalité ?',
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)', animation: 'fadeInUp 0.4s ease both' }}>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {messages.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 20, padding: 40 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #1e3a5f, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>💬</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Assistant Expert Immobilier</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: 400 }}>Posez n'importe quelle question sur ce projet, la fiscalité, le financement ou l'investissement immobilier.</div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => setInput(s)}
                  style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 20, padding: '7px 14px', fontSize: '0.78rem',
                    color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-sans)',
                    transition: 'var(--transition)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >{s}</button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
            animation: 'fadeInUp 0.3s ease both',
          }}>
            {m.role === 'assistant' && (
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #1e3a5f, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, marginRight: 10, flexShrink: 0, alignSelf: 'flex-end' }}>💎</div>
            )}
            <div style={{
              maxWidth: '72%', padding: '12px 16px',
              borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: m.role === 'user' ? 'linear-gradient(135deg, #1e3a5f, #2563eb)' : 'var(--bg-card)',
              color: m.role === 'user' ? '#fff' : 'var(--text-primary)',
              fontSize: '0.87rem', lineHeight: 1.65,
              border: m.role === 'assistant' ? '1px solid var(--border)' : 'none',
              boxShadow: 'var(--shadow-sm)',
              whiteSpace: 'pre-wrap',
            }}>
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #1e3a5f, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>💎</div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px 16px 16px 4px', padding: '12px 16px', display: 'flex', gap: 5 }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', animation: `pulse 1.2s ease ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div style={{ background: 'var(--red-light)', border: '1px solid var(--red)', borderRadius: 10, padding: '10px 14px', color: 'var(--red)', fontSize: '0.82rem' }}>❌ {error}</div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '14px 0 0', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        <textarea value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Votre question... (Entrée pour envoyer)"
          rows={1} style={{
            flex: 1, resize: 'none', minHeight: 44, maxHeight: 120,
            background: 'var(--bg-card)', color: 'var(--text-primary)',
            border: '1px solid var(--border)', borderRadius: 12,
            padding: '11px 14px', fontSize: '0.87rem', fontFamily: 'var(--font-sans)', lineHeight: 1.5,
          }}
          onInput={e => {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
          }}
        />
        <Btn onClick={send} loading={loading} disabled={!input.trim()}>Envoyer ↗</Btn>
        {messages.length > 0 && (
          <Btn onClick={() => setMessages([])} variant="ghost" size="md">🗑️</Btn>
        )}
      </div>
    </div>
  );
}
