import { useState, useEffect, useRef } from 'react';

/* ── Animated number counter ── */
export function AnimatedNumber({ value, prefix = '', suffix = '', decimals = 0, duration = 900 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const target = parseFloat(value) || 0;
    const start  = Date.now();
    const initial = display;
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplay(initial + (target - initial) * ease);
      if (progress < 1) ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current);
  }, [value]); // eslint-disable-line

  const formatted = decimals > 0
    ? display.toFixed(decimals)
    : Math.round(display).toLocaleString('fr-FR');

  return <span>{prefix}{formatted}{suffix}</span>;
}

/* ── KPI Card ── */
export function KpiCard({ label, value, sub, color = 'accent', prefix = '', suffix = '', decimals = 0, delay = 0 }) {
  const borderColors = {
    accent: 'var(--accent)',
    green:  'var(--green)',
    red:    'var(--red)',
    amber:  'var(--amber)',
  };

  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: 'var(--radius-lg)',
      padding: '18px 20px',
      borderLeft: `4px solid ${borderColors[color] || borderColors.accent}`,
      boxShadow: 'var(--shadow-sm)',
      animation: `fadeInUp 0.5s ease ${delay}ms both`,
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      cursor: 'default',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-3px)';
      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
    }}>
      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
        <AnimatedNumber value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
      </div>
      {sub && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 5 }}>{sub}</div>}
    </div>
  );
}

/* ── Button ── */
export function Btn({ children, onClick, variant = 'primary', size = 'md', loading = false, disabled = false, style = {} }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    fontFamily: 'var(--font-sans)', fontWeight: 600, cursor: disabled || loading ? 'not-allowed' : 'pointer',
    border: 'none', borderRadius: 'var(--radius-md)', transition: 'var(--transition)',
    opacity: disabled ? 0.5 : 1,
    ...style,
  };
  const sizes = { sm: '8px 14px', md: '10px 20px', lg: '13px 28px' };
  const fontSizes = { sm: '0.78rem', md: '0.87rem', lg: '0.95rem' };

  const variants = {
    primary:   { background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)', color: '#fff', boxShadow: 'var(--shadow-accent)' },
    secondary: { background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' },
    danger:    { background: 'var(--red)', color: '#fff' },
    ghost:     { background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)' },
  };

  return (
    <button
      onClick={!disabled && !loading ? onClick : undefined}
      style={{ ...base, ...variants[variant], padding: sizes[size], fontSize: fontSizes[size] }}
      onMouseEnter={e => { if (!disabled && !loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
      onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.98)'; }}
      onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
    >
      {loading ? <span style={{ animation: 'pulse 1s infinite' }}>⏳</span> : children}
    </button>
  );
}

/* ── Card ── */
export function Card({ children, style = {}, className = '', onClick }) {
  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        padding: '20px',
        boxShadow: 'var(--shadow-sm)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ── Section title ── */
export function SectionTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <h3 style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{children}</h3>
      {sub && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 3 }}>{sub}</p>}
    </div>
  );
}

/* ── Input with label ── */
export function Field({ label, type = 'text', value, onChange, min, max, step, placeholder, options }) {
  const id = label.replace(/\s+/g, '_').toLowerCase();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label htmlFor={id} style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</label>
      {options ? (
        <select id={id} value={value} onChange={e => onChange(e.target.value)}
          style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '9px 12px', fontSize: '0.85rem' }}>
          {options.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
        </select>
      ) : (
        <input id={id} type={type} value={value} placeholder={placeholder}
          min={min} max={max} step={step}
          onChange={e => onChange(type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
          style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}
        />
      )}
    </div>
  );
}

/* ── Score ring ── */
export function ScoreRing({ score, size = 100 }) {
  const r   = size * 0.38;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 70 ? 'var(--green)' : score >= 45 ? 'var(--amber)' : 'var(--red)';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={size * 0.1} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={size * 0.1}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)' }}
      />
      <text x={size/2} y={size/2 - 4} textAnchor="middle" fontSize={size * 0.2} fontWeight="800" fill={color} fontFamily="DM Sans">{score}</text>
      <text x={size/2} y={size/2 + size*0.13} textAnchor="middle" fontSize={size * 0.1} fill="var(--text-muted)" fontFamily="DM Sans">/100</text>
    </svg>
  );
}

/* ── Loading skeleton ── */
export function Skeleton({ width = '100%', height = 20, radius = 6 }) {
  return (
    <div style={{
      width, height, borderRadius: radius,
      background: 'linear-gradient(90deg, var(--border) 25%, var(--bg-secondary) 50%, var(--border) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
    }} />
  );
}

/* ── Badge ── */
export function Badge({ children, color = 'accent' }) {
  const colors = {
    accent: { bg: 'var(--accent-light)', text: 'var(--accent)' },
    green:  { bg: 'var(--green-light)',  text: 'var(--green)' },
    red:    { bg: 'var(--red-light)',    text: 'var(--red)' },
    amber:  { bg: 'var(--amber-light)',  text: 'var(--amber)' },
  };
  const c = colors[color] || colors.accent;
  return (
    <span style={{
      background: c.bg, color: c.text,
      borderRadius: 20, padding: '3px 10px',
      fontSize: '0.72rem', fontWeight: 700,
    }}>{children}</span>
  );
}

/* ── Tabs ── */
export function Tabs({ tabs, active, onChange }) {
  return (
    <div style={{
      display: 'flex', gap: 4,
      background: 'var(--bg-card)',
      borderRadius: 'var(--radius-md)',
      padding: 5,
      border: '1px solid var(--border)',
      overflowX: 'auto',
    }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)}
          style={{
            padding: '7px 16px', borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem', fontWeight: 500, whiteSpace: 'nowrap',
            color: active === t.id ? '#fff' : 'var(--text-muted)',
            background: active === t.id ? 'linear-gradient(135deg, #1e3a5f, #2563eb)' : 'transparent',
            boxShadow: active === t.id ? 'var(--shadow-accent)' : 'none',
            transition: 'var(--transition)',
          }}>
          {t.icon} {t.label}
        </button>
      ))}
    </div>
  );
}
