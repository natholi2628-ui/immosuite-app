import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, ReferenceLine, LineChart, Line,
} from 'recharts';
import { KpiCard, Card, SectionTitle, Tabs, ScoreRing, AnimatedNumber, Badge } from '../components/UI';
import { scoreColor, scoreLabel } from '../hooks/useCalcs';

const TABS = [
  { id: 'overview',   icon: '📈', label: 'Tableau de bord' },
  { id: 'scenarios',  icon: '🎲', label: 'Scénarios' },
  { id: 'fiscalite',  icon: '🏛️', label: 'Fiscalité' },
  { id: 'budget',     icon: '🍩', label: 'Budget' },
  { id: 'score',      icon: '🎯', label: 'Score' },
];

const PIE_COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'];

const AlertIcon = ({ type }) => {
  const icons = { danger: '🔴', warning: '🟡', success: '🟢', info: '🔵' };
  return icons[type] || '⚪';
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: '0.8rem', boxShadow: 'var(--shadow-lg)', minWidth: 140 }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || 'var(--accent)', fontWeight: 600, marginBottom: 2 }}>
          {p.name}: <span style={{ color: 'var(--text-primary)' }}>{Math.round(p.value).toLocaleString('fr-FR')} €</span>
        </div>
      ))}
    </div>
  );
};

export default function Finance({ calc, params }) {
  const [tab, setTab] = useState('overview');
  const [projYears, setProjYears] = useState(20);

  const {
    rentaBrute, rentaNette, cashflowMois, coutTotal, mensualite,
    impotMicro, impotReel, fraisNotaire, projection, score, scoreDetails,
    alertes, scenarios, loyerPointMort, plusValue, valeurRevente10ans,
    levier, prixM2,
  } = calc;
  const { prixNet, fraisAgence, travauxBudget } = params;

  const cfColor = cashflowMois >= 0 ? 'green' : 'red';
  const rColor  = rentaBrute >= 6 ? 'green' : rentaBrute >= 4 ? 'amber' : 'red';

  const budgetData = [
    { name: 'Achat net',  value: prixNet },
    { name: 'Travaux',    value: travauxBudget },
    { name: 'Notaire',    value: Math.round(fraisNotaire) },
    { name: 'Agence',     value: fraisAgence },
  ];

  const fiscData = [
    { regime: 'Micro-BIC', impot: Math.round(impotMicro), fill: '#3b82f6' },
    { regime: 'Réel',      impot: Math.round(impotReel),  fill: '#16a34a' },
  ];

  const projFiltered = projection.slice(0, projYears);

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease both' }}>

      {/* Alertes intelligentes */}
      {alertes.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18 }}>
          {alertes.map((a, i) => {
            const colors = {
              danger:  { bg: 'var(--red-light)',   border: 'var(--red)',   text: 'var(--red)' },
              warning: { bg: 'var(--amber-light)',  border: 'var(--amber)', text: 'var(--amber)' },
              success: { bg: 'var(--green-light)',  border: 'var(--green)', text: 'var(--green)' },
              info:    { bg: 'var(--accent-light)', border: 'var(--accent)', text: 'var(--accent)' },
            };
            const c = colors[a.type] || colors.info;
            return (
              <div key={i} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 8, padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: c.text, fontWeight: 500, animation: `fadeInUp 0.3s ease ${i*60}ms both` }}>
                <AlertIcon type={a.type} /> {a.msg}
              </div>
            );
          })}
        </div>
      )}

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 16 }}>
        <KpiCard label="Rentabilité Brute" value={rentaBrute} suffix="%" decimals={2} color={rColor} sub={`Nette : ${rentaNette.toFixed(2)}%`} delay={0} />
        <KpiCard label="Cashflow Net-Net" value={cashflowMois} suffix=" €/mois" color={cfColor} sub={`Point mort : ${loyerPointMort}€/mois`} delay={80} />
        <KpiCard label="Coût Total" value={coutTotal} suffix=" €" color="accent" sub={`${prixM2}€/m² · Levier x${levier.toFixed(1)}`} delay={160} />
        <KpiCard label="Mensualité" value={mensualite} suffix=" €/mois" color="accent" sub={`+${Math.round(valeurRevente10ans - prixNet).toLocaleString('fr-FR')}€ potentiel 10ans`} delay={240} />
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: 18 }}>
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
      </div>

      {/* ── TAB OVERVIEW ── */}
      {tab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeIn 0.3s ease' }}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <SectionTitle>Simulation cashflow — projection {projYears} ans</SectionTitle>
              <div style={{ display: 'flex', gap: 6 }}>
                {[10, 20, 30].map(y => (
                  <button key={y} onClick={() => setProjYears(y)}
                    style={{ padding: '4px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)', border: `1px solid ${projYears === y ? 'var(--accent)' : 'var(--border)'}`, background: projYears === y ? 'var(--accent)' : 'transparent', color: projYears === y ? '#fff' : 'var(--text-muted)', transition: 'all 0.15s' }}>
                    {y} ans
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={projFiltered} margin={{ top: 5, right: 10, bottom: 0, left: 10 }}>
                <defs>
                  <linearGradient id="cfGradPos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="annee" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={v => `A${v}`} interval={Math.floor(projYears / 6)} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={v => `${v}€`} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="#dc2626" strokeDasharray="4 4" strokeOpacity={0.5} />
                <Area type="monotone" dataKey="cashflow" name="Cashflow" stroke="#2563eb" strokeWidth={2.5} fill="url(#cfGradPos)" dot={false} activeDot={{ r: 5, fill: '#2563eb' }} />
              </AreaChart>
            </ResponsiveContainer>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6 }}>
              Hypothèses : loyer +1.5%/an · charges +2%/an · ligne rouge = seuil zéro
            </p>
          </Card>

          {/* Métriques avancées */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { label: '🏠 Valeur estimée dans 10 ans', val: Math.round(valeurRevente10ans), suffix: ' €', color: 'var(--green)' },
              { label: '📈 Plus-value latente 10 ans', val: Math.round(plusValue), suffix: ' €', color: plusValue > 0 ? 'var(--green)' : 'var(--red)' },
              { label: '⚠️ Loyer point mort', val: loyerPointMort, suffix: ' €/mois', color: loyerPointMort > params.loyer ? 'var(--red)' : 'var(--green)' },
            ].map((m, i) => (
              <div key={i} style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: '14px 16px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 6 }}>{m.label}</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: m.color }}>
                  <AnimatedNumber value={m.val} suffix={m.suffix} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB SCÉNARIOS ── */}
      {tab === 'scenarios' && (
        <div style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {Object.values(scenarios).map((sc) => (
              <Card key={sc.label} style={{ borderTop: `4px solid ${sc.color}` }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: sc.color, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {sc.label === 'pessimiste' ? '📉' : sc.label === 'base' ? '📊' : '📈'} Scénario {sc.label}
                </div>
                {[
                  { label: 'Loyer estimé', val: Math.round(sc.loyer), suffix: ' €/mois' },
                  { label: 'Vacance locative', val: Math.round(sc.vacance * 100), suffix: '%' },
                  { label: 'Cashflow', val: sc.cashflow, suffix: ' €/mois' },
                  { label: 'Rentabilité', val: sc.renta, suffix: '%', dec: 2 },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border-light)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.label}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: item.label === 'Cashflow' ? (item.val >= 0 ? 'var(--green)' : 'var(--red)') : sc.color }}>
                      {item.dec ? item.val.toFixed(item.dec) : item.val.toLocaleString('fr-FR')}{item.suffix}
                    </span>
                  </div>
                ))}
              </Card>
            ))}
          </div>

          <Card>
            <SectionTitle>Comparaison des scénarios — cashflow mensuel</SectionTitle>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[{
                name: 'Cashflow mensuel',
                Pessimiste: scenarios.pessimiste.cashflow,
                Base: scenarios.base.cashflow,
                Optimiste: scenarios.optimiste.cashflow,
              }]} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={v => `${v}€`} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="#64748b" strokeDasharray="3 3" />
                <Bar dataKey="Pessimiste" fill="#dc2626" radius={[6,6,0,0]} />
                <Bar dataKey="Base"       fill="#2563eb" radius={[6,6,0,0]} />
                <Bar dataKey="Optimiste"  fill="#16a34a" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <SectionTitle>Projection cashflow sur 20 ans — 3 scénarios</SectionTitle>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart margin={{ top: 5, right: 20, bottom: 0, left: 10 }}
                data={Array.from({ length: 20 }, (_, i) => ({
                  annee: i + 1,
                  Pessimiste: Math.round((scenarios.pessimiste.loyer * 12 * 0.85 * Math.pow(1 + scenarios.pessimiste.tauxReva, i) - (params.taxeFonciere + params.charges) * Math.pow(1.02,i) - mensualite * 12) / 12),
                  Base:       Math.round((scenarios.base.loyer * 12 * 0.92 * Math.pow(1.015, i) - (params.taxeFonciere + params.charges) * Math.pow(1.02,i) - mensualite * 12) / 12),
                  Optimiste:  Math.round((scenarios.optimiste.loyer * 12 * 0.98 * Math.pow(1 + scenarios.optimiste.tauxReva, i) - (params.taxeFonciere + params.charges) * Math.pow(1.02,i) - mensualite * 12) / 12),
                }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="annee" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={v => `A${v}`} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={v => `${v}€`} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="#64748b" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="Pessimiste" stroke="#dc2626" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Base"       stroke="#2563eb" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Optimiste"  stroke="#16a34a" strokeWidth={2} dot={false} />
                <Legend formatter={v => <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{v}</span>} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* ── TAB FISCALITE ── */}
      {tab === 'fiscalite' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Card>
              <SectionTitle>Comparaison des régimes fiscaux</SectionTitle>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={fiscData} margin={{ top: 5, right: 10, bottom: 0, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="regime" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={v => `${v}€`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="impot" name="Impôt estimé" radius={[6,6,0,0]}>
                    {fiscData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card>
              <SectionTitle>Analyse détaillée</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                {[
                  { label: 'Revenus locatifs bruts', val: Math.round(params.loyer * 12), color: 'var(--text-primary)' },
                  { label: 'Abattement Micro-BIC (50%)', val: Math.round(params.loyer * 12 * 0.5), color: 'var(--accent)' },
                  { label: 'Amortissement Réel estimé', val: Math.round(calc.revenusAn - Math.max(0, calc.revenusAn - impotReel / 0.472 - params.charges - params.taxeFonciere)), color: 'var(--accent)' },
                  { label: 'Impôt Micro-BIC', val: Math.round(impotMicro), color: 'var(--red)' },
                  { label: 'Impôt Régime Réel', val: Math.round(impotReel), color: 'var(--green)' },
                  { label: '💰 Économie annuelle', val: Math.round(impotMicro - impotReel), color: 'var(--green)' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{item.label}</span>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: item.color }}>
                      <AnimatedNumber value={item.val} suffix=" €" />
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 14, padding: '11px 14px', background: 'var(--green-light)', borderRadius: 8, fontSize: '0.82rem', color: 'var(--green)', fontWeight: 600 }}>
                💡 Recommandation : régime {impotReel < impotMicro ? 'Réel' : 'Micro-BIC'} → économie de {Math.abs(Math.round(impotMicro - impotReel)).toLocaleString('fr-FR')} €/an
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── TAB BUDGET ── */}
      {tab === 'budget' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Card>
              <SectionTitle>Répartition budget global</SectionTitle>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={budgetData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={3} dataKey="value">
                    {budgetData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip formatter={v => [`${v.toLocaleString('fr-FR')} €`]} />
                  <Legend formatter={v => <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
            <Card>
              <SectionTitle>Détail des postes</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                {budgetData.map((item, i) => {
                  const pct = (item.value / coutTotal * 100).toFixed(1);
                  return (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 7 }}>
                          <span style={{ width: 10, height: 10, borderRadius: '50%', background: PIE_COLORS[i], display: 'inline-block', flexShrink: 0 }} />
                          {item.name}
                        </span>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.value.toLocaleString('fr-FR')} €</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: PIE_COLORS[i], borderRadius: 3, transition: 'width 1.2s ease' }} />
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 3 }}>{pct}% du budget total</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 14, padding: '11px 14px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>Total projet</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  <AnimatedNumber value={coutTotal} suffix=" €" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── TAB SCORE ── */}
      {tab === 'score' && (
        <div style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
              <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <ScoreRing score={score} size={130} />
                <Badge color={score >= 70 ? 'green' : score >= 45 ? 'amber' : 'red'}>
                  {scoreLabel(score)}
                </Badge>
              </div>
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {Object.entries(scoreDetails).map(([key, { pts, max, val }]) => {
                  const labels = { rentabilite: '📈 Rentabilité', cashflow: '💵 Cashflow', levier: '🏗️ Levier', prixM2: '📐 Prix/m²' };
                  const pct = pts / max * 100;
                  const c = pct >= 70 ? 'var(--green)' : pct >= 40 ? 'var(--amber)' : 'var(--red)';
                  return (
                    <div key={key} style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: '14px 16px' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{labels[key]}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 6 }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{pts}<span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>/{max}</span></span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{val}</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: c, borderRadius: 3, transition: 'width 1.4s cubic-bezier(0.4,0,0.2,1)' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Benchmarks */}
          <Card>
            <SectionTitle>Benchmarks marché</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 8 }}>
              {[
                { label: 'Rentabilité brute', yours: rentaBrute.toFixed(1), market: '5.2', unit: '%' },
                { label: 'Cashflow moyen', yours: Math.round(cashflowMois), market: '50', unit: '€/mois' },
                { label: 'Prix au m²', yours: prixM2, market: '3800', unit: '€/m²' },
                { label: 'Levier', yours: levier.toFixed(1), market: '4.0', unit: 'x' },
              ].map(b => {
                const better = parseFloat(b.yours) >= parseFloat(b.market);
                return (
                  <div key={b.label} style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: '12px 14px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{b.label}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Votre bien</div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: better ? 'var(--green)' : 'var(--red)' }}>{b.yours}{b.unit}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Marché</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{b.market}{b.unit}</div>
                      </div>
                    </div>
                    <div style={{ marginTop: 6, fontSize: '0.72rem', color: better ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
                      {better ? '✅ Au-dessus du marché' : '⚠️ En-dessous du marché'}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
