import { Link } from 'react-router-dom';
import { BloodBadge, UrgencyTag, StatusTag, ProgressBar } from './ui';
import { timeAgo, timeLeft } from '../utils/format';

export default function RequestCard({ request }) {
  const r = request;
  return (
    <Link to={`/requests/${r._id}`} className={`card request-card request-card--${r.urgency}`}>
      <div className="request-card__top">
        <BloodBadge group={r.bloodGroup} size="lg" />
        <div className="request-card__info">
          <h3>{r.patientName}</h3>
          <p className="muted">🏥 {r.hospital}, {r.city}</p>
        </div>
        <div className="request-card__tags">
          {r.status === 'open' ? <UrgencyTag urgency={r.urgency} /> : <StatusTag status={r.status} />}
          {r.myResponse && <span className="tag tag--mine">You {r.myResponse}</span>}
        </div>
      </div>
      <ProgressBar value={r.donatedCount} max={r.unitsNeeded} />
      <div className="request-card__meta muted">
        <span>🩸 {r.donatedCount}/{r.unitsNeeded} units · 🙌 {r.pledgedCount} pledged</span>
        <span>
          {r.distanceKm !== undefined && `📍 ${r.distanceKm} km · `}
          {r.status === 'open' && r.expiresAt ? `⏳ ${timeLeft(r.expiresAt)}` : timeAgo(r.createdAt)}
        </span>
      </div>
    </Link>
  );
}
