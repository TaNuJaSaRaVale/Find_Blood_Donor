export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export const toInputDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

export function timeAgo(d) {
  const seconds = Math.round((Date.now() - new Date(d)) / 1000);
  const units = [['year', 31536000], ['month', 2592000], ['day', 86400], ['hour', 3600], ['minute', 60]];
  for (const [unit, size] of units) {
    const n = Math.floor(seconds / size);
    if (n >= 1) return `${n} ${unit}${n > 1 ? 's' : ''} ago`;
  }
  return 'just now';
}

export function timeLeft(d) {
  const ms = new Date(d) - Date.now();
  if (ms <= 0) return 'expiring';
  const h = Math.floor(ms / 3600000);
  return h >= 24 ? `${Math.floor(h / 24)}d ${h % 24}h left` : `${h}h ${Math.floor((ms % 3600000) / 60000)}m left`;
}

export const capitalize = (s) => (s ? s[0].toUpperCase() + s.slice(1) : '');
