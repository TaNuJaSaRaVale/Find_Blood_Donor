/** Small, reusable presentational components used on many pages. */
import { groupLabel, URGENCY } from '../utils/blood';

export function BloodBadge({ group, size = 'md' }) {
  return <span className={`blood-badge blood-badge--${size} ${group === 'hh' ? 'blood-badge--rare' : ''}`}>{groupLabel(group)}</span>;
}

export function UrgencyTag({ urgency }) {
  const u = URGENCY[urgency];
  return <span className={`tag tag--${urgency}`}>{u.icon} {u.label}</span>;
}

export function StatusTag({ status }) {
  return <span className={`tag tag--status-${status}`}>{status}</span>;
}

export function Loader({ text = 'Loading…' }) {
  return (
    <div className="loader" role="status">
      <span className="loader__drop" />
      <span>{text}</span>
    </div>
  );
}

export function EmptyState({ icon = '🩸', title, children }) {
  return (
    <div className="empty">
      <div className="empty__icon">{icon}</div>
      <h3>{title}</h3>
      {children && <div className="muted">{children}</div>}
    </div>
  );
}

export function ErrorBox({ error, onRetry }) {
  if (!error) return null;
  return (
    <div className="alert alert--error">
      <span>⚠️ {error.message}</span>
      {onRetry && <button className="btn btn--sm btn--ghost" onClick={onRetry}>Retry</button>}
    </div>
  );
}

export function StatCard({ icon, label, value, accent }) {
  return (
    <div className={`stat-card ${accent ? 'stat-card--accent' : ''}`}>
      <div className="stat-card__icon">{icon}</div>
      <div>
        <div className="stat-card__value">{value ?? '—'}</div>
        <div className="stat-card__label">{label}</div>
      </div>
    </div>
  );
}

export function ProgressBar({ value, max, label }) {
  const pct = max ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="progress" aria-label={label}>
      <div className="progress__bar" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Field({ label, hint, error, children }) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      {children}
      {hint && !error && <span className="field__hint">{hint}</span>}
      {error && <span className="field__error">{error}</span>}
    </label>
  );
}
