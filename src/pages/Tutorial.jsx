import { useState } from 'react';
import { useApp } from '../context/AppContext';

const STEPS = [
  {
    icon: '🏠',
    title: 'Bienvenue sur ImmoSuite V25',
    content: 'Votre plateforme d\'analyse immobilière avec IA intégrée. Un appartement exemple est déjà chargé pour vous guider — suivez ce tutoriel pour découvrir toutes les fonctionnalités.',
    highlight: {
      label: 'Appartement exemple',
      items: ['📍 10 rue de la Paix, Paris', '📐 45 m²', '💰 200 000 € net vendeur', '💵 1 300 €/mois de loyer'],
    },
  },
  {
    icon: '📐',
    title: 'Configurez votre bien',
    content: 'Dans la barre latérale gauche, modifiez tous les paramètres de votre projet : adresse, surface, prix, loyer, budget travaux, taux d\'emprunt...',
    highlight: {
      label: 'Astuce',
      items: [
        '📸 Utilisez "Import auto depuis annonce" pour remplir automatiquement depuis un screenshot SeLoger, LeBonCoin ou PAP',
        '🎚️ Choisissez votre gamme de rénovation : Économique, Standard ou Premium',
      ],
    },
  },
  {
    icon: '📊',
    title: 'Analysez la rentabilité',
    content: 'L\'onglet Finance affiche tous vos KPIs en temps réel, recalculés à chaque modification.',
    highlight: {
      label: 'Ce que vous trouverez',
      items: [
        '📈 Rentabilité brute & nette',
        '💶 Cashflow mensuel',
        '🏆 Score d\'investissement sur 100',
        '📉 Scénarios sur 30 ans, comparatif fiscal Micro-BIC vs Réel',
      ],
    },
  },
  {
    icon: '🤖',
    title: 'Les outils IA',
    content: 'ImmoSuite intègre GPT-4o pour vous assister sur chaque étape de votre analyse.',
    highlight: {
      label: 'Les 4 outils IA',
      items: [
        '⚡ DPE — Estimez la classe énergie et les travaux prioritaires',
        '🛠️ Audit — Uploadez des photos, obtenez une liste travaux + liens shopping',
        '💬 Assistant — Posez vos questions à un expert immobilier IA',
        '✍️ Annonce — Générez une annonce prête à publier en quelques secondes',
      ],
    },
  },
  {
    icon: '📄',
    title: 'Exportez & Comparez',
    content: 'Finalisez votre analyse et présentez-la à vos clients ou associés de manière professionnelle.',
    highlight: {
      label: 'Fonctionnalités d\'export',
      items: [
        '📄 Rapport — Dossier HTML complet, prêt à imprimer ou partager',
        '🔀 Comparateur — Comparez plusieurs biens côte à côte avec scoring automatique',
        '💾 Sauvegarde JSON — Retrouvez votre projet à tout moment',
      ],
    },
  },
];

export default function Tutorial() {
  const { setShowTutorial } = useApp();
  const [step, setStep] = useState(0);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(7,13,26,0.85)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        background: 'var(--bg-card)', borderRadius: 20, width: '100%', maxWidth: 580,
        border: '1px solid var(--border)', boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
        animation: 'fadeInUp 0.4s ease', overflow: 'hidden',
      }}>
        {/* Header barre de progression */}
        <div style={{ height: 4, background: 'var(--bg-secondary)' }}>
          <div style={{
            height: '100%', background: 'linear-gradient(90deg, #1e3a5f, #2563eb)',
            width: `${((step + 1) / STEPS.length) * 100}%`,
            transition: 'width 0.4s ease',
          }} />
        </div>

        <div style={{ padding: '32px 36px' }}>
          {/* Icone + étape */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(124,58,237,0.15))',
                border: '1px solid rgba(37,99,235,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
              }}>{current.icon}</div>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>
                  Étape {step + 1} sur {STEPS.length}
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {current.title}
                </div>
              </div>
            </div>
            <button onClick={() => setShowTutorial(false)}
              style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--bg-secondary)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>

          {/* Contenu */}
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 20 }}>
            {current.content}
          </p>

          {/* Highlight box */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: '16px 18px', marginBottom: 28, borderLeft: '3px solid var(--accent)' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
              {current.highlight.label}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {current.highlight.items.map((item, i) => (
                <div key={i} style={{ fontSize: '0.84rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Boutons de navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Indicateurs dots */}
            <div style={{ display: 'flex', gap: 6 }}>
              {STEPS.map((_, i) => (
                <button key={i} onClick={() => setStep(i)} style={{
                  width: i === step ? 20 : 8, height: 8, borderRadius: 4,
                  background: i === step ? 'var(--accent)' : 'var(--border)',
                  border: 'none', cursor: 'pointer', padding: 0,
                  transition: 'all 0.3s ease',
                }} />
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              {step > 0 && (
                <button onClick={() => setStep(s => s - 1)} style={{
                  padding: '10px 20px', borderRadius: 10, background: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)', border: '1px solid var(--border)',
                  cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '0.85rem',
                }}>← Précédent</button>
              )}
              <button onClick={() => isLast ? setShowTutorial(false) : setStep(s => s + 1)} style={{
                padding: '10px 24px', borderRadius: 10,
                background: 'linear-gradient(135deg, #1e3a5f, #2563eb)',
                color: '#fff', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.88rem',
                boxShadow: '0 4px 14px rgba(37,99,235,0.35)',
              }}>
                {isLast ? '🚀 Commencer' : 'Suivant →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
