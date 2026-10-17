import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { requestApi } from '../api/endpoints';
import { useAsync } from '../hooks/useAsync';
import { useAuth } from '../context/AuthContext';
import MapView from '../components/MapView';
import { BloodBadge, ErrorBox, Loader, ProgressBar, StatusTag, UrgencyTag } from '../components/ui';
import { canReceiveFrom, groupLabel, isCompatible } from '../utils/blood';
import { formatDate, timeAgo, timeLeft } from '../utils/format';

export default function RequestDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const { data, loading, error, reload, setData } = useAsync(() => requestApi.get(id), [id, user?._id]);

  const act = async (fn, success) => {
    setBusy(true);
    try {
      const result = await fn();
      if (result?.request) setData({ request: result.request });
      toast.success(success);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Loader />;
  if (error) return <div className="container page"><ErrorBox error={error} onRetry={reload} /></div>;

  const r = data.request;
  const [lng, lat] = r.location.coordinates;
  const compatible = user && isCompatible(user.bloodGroup, r.bloodGroup);
  const shareText = `🩸 ${groupLabel(r.bloodGroup)} blood needed for ${r.patientName} at ${r.hospital}, ${r.city}. Contact ${r.contactPhone}. ${window.location.href}`;

  const remove = async () => {
    if (!window.confirm('Delete this request permanently?')) return;
    await act(() => requestApi.remove(r._id), 'Request deleted');
    navigate('/requests');
  };

  return (
    <div className="container page">
      <Link to="/requests" className="muted">← All requests</Link>
      <div className="layout-split layout-split--detail">
        <div className="stack">
          <div className={`card stack request-hero request-hero--${r.urgency}`}>
            <div className="row">
              <BloodBadge group={r.bloodGroup} size="xl" />
              <div>
                <h1>{r.patientName}</h1>
                <p className="muted">🏥 {r.hospital}, {r.city}</p>
                <div className="row">
                  {r.status === 'open' ? <UrgencyTag urgency={r.urgency} /> : <StatusTag status={r.status} />}
                  {r.status === 'open' && r.expiresAt && <span className="tag">⏳ {timeLeft(r.expiresAt)}</span>}
                  {r.distanceKm !== undefined && <span className="tag">📍 {r.distanceKm} km from you</span>}
                </div>
              </div>
            </div>

            <div>
              <div className="row row--between"><b>{r.donatedCount} of {r.unitsNeeded} units donated</b><span className="muted">🙌 {r.pledgedCount} pledged</span></div>
              <ProgressBar value={r.donatedCount} max={r.unitsNeeded} />
            </div>

            {r.note && <blockquote className="note">“{r.note}”</blockquote>}

            <dl className="details">
              <dt>Posted by</dt><dd>{r.requester?.name} · {timeAgo(r.createdAt)}</dd>
              <dt>Contact</dt><dd>{user ? <a href={`tel:${r.contactPhone}`}>📞 {r.contactPhone}</a> : <Link to="/login">Log in to see contact</Link>}</dd>
              {r.requiredBy && <><dt>Required by</dt><dd>{formatDate(r.requiredBy)}</dd></>}
              <dt>Compatible donors</dt><dd>{canReceiveFrom(r.bloodGroup).map(groupLabel).join(', ')}</dd>
              <dt>Donors alerted</dt><dd>{r.notifiedCount}</dd>
            </dl>

            <div className="row">
              <a className="btn btn--whatsapp btn--sm" target="_blank" rel="noreferrer" href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}>Share on WhatsApp</a>
              <button className="btn btn--ghost btn--sm" onClick={() => navigator.clipboard.writeText(shareText).then(() => toast.success('Copied!'))}>Copy text</button>
            </div>
          </div>

          {/* ---------- Donor actions ---------- */}
          {r.status === 'open' && !r.isOwner && (
            <div className="card stack">
              {!user ? (
                <p><Link to="/login" state={{ from: `/requests/${r._id}` }}>Log in</Link> to pledge your blood for this patient.</p>
              ) : r.myResponse === 'pledged' ? (
                <>
                  <h3>✅ You pledged to donate</h3>
                  <p className="muted">The family can now see your phone number. Visit {r.hospital} and they will confirm your donation in the app.</p>
                  <button className="btn btn--ghost" disabled={busy} onClick={() => act(() => requestApi.respond(r._id, 'withdraw'), 'Pledge withdrawn')}>Withdraw pledge</button>
                </>
              ) : r.myResponse === 'donated' ? (
                <h3>❤️ You donated for this patient. Thank you!</h3>
              ) : compatible ? (
                <>
                  <h3>Your {groupLabel(user.bloodGroup)} blood can help {r.patientName}</h3>
                  <button className="btn btn--primary btn--lg" disabled={busy} onClick={() => act(() => requestApi.respond(r._id, 'pledge'), 'Thank you! The family has been notified.')}>
                    🙌 I will donate
                  </button>
                </>
              ) : (
                <p className="muted">Your blood group ({groupLabel(user.bloodGroup)}) is not compatible with {groupLabel(r.bloodGroup)}, but you can still share this request.</p>
              )}
            </div>
          )}

          {/* ---------- Requester controls ---------- */}
          {r.isOwner && (
            <div className="card stack">
              <h3>Donors who responded</h3>
              {r.responses.length === 0 && <p className="muted">No pledges yet. Share the request to reach more people.</p>}
              {r.responses.map((resp) => (
                <div key={resp.donor._id} className="donor-card">
                  <BloodBadge group={resp.donor.bloodGroup} size="sm" />
                  <div className="donor-card__info">
                    <b>{resp.donor.name}</b>
                    <span className="muted">{resp.donor.city} · ⚡ {resp.donor.reliabilityScore} · {resp.donor.donationsCount} donations · {timeAgo(resp.respondedAt)}</span>
                  </div>
                  <span className={`tag tag--status-${resp.status}`}>{resp.status}</span>
                  {resp.status === 'pledged' && (
                    <>
                      <a className="btn btn--ghost btn--sm" href={`tel:${resp.donor.phone}`}>📞 {resp.donor.phone}</a>
                      {r.status === 'open' && (
                        <button className="btn btn--primary btn--sm" disabled={busy} onClick={() => act(() => requestApi.confirm(r._id, resp.donor._id), 'Donation confirmed ❤️')}>
                          Confirm donated
                        </button>
                      )}
                    </>
                  )}
                </div>
              ))}
              <div className="row">
                {r.status === 'open' && <Link className="btn btn--ghost btn--sm" to={`/requests/${r._id}/edit`}>✏️ Edit</Link>}
                {r.status === 'open' && <button className="btn btn--ghost btn--sm" disabled={busy} onClick={() => act(() => requestApi.setStatus(r._id, 'fulfilled'), 'Marked fulfilled')}>✅ Mark fulfilled</button>}
                {r.status === 'open' && <button className="btn btn--ghost btn--sm" disabled={busy} onClick={() => act(() => requestApi.setStatus(r._id, 'cancelled'), 'Request cancelled')}>Cancel request</button>}
                {r.status !== 'open' && <button className="btn btn--ghost btn--sm" disabled={busy} onClick={() => act(() => requestApi.setStatus(r._id, 'open'), 'Request re-opened')}>↺ Re-open</button>}
                <button className="btn btn--danger btn--sm" disabled={busy} onClick={remove}>🗑 Delete</button>
              </div>
            </div>
          )}
        </div>

        <MapView center={{ lat, lng }} zoom={14} height={420} markers={[{ id: r._id, lat, lng, radius: 12, popup: r.hospital }]} />
      </div>
    </div>
  );
}
