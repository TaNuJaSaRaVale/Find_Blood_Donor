import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { userApi, donationApi } from '../api/endpoints';
import { useAsync } from '../hooks/useAsync';
import { useAuth } from '../context/AuthContext';
import EligibilityRing from '../components/EligibilityRing';
import LocationPicker from '../components/LocationPicker';
import BloodGroupPicker from '../components/BloodGroupPicker';
import { BloodBadge, ErrorBox, Field, Loader, ProgressBar, StatCard, UrgencyTag } from '../components/ui';
import { groupLabel } from '../utils/blood';
import { formatDate, toInputDate } from '../utils/format';

const EMPTY_DONATION = { date: '', place: '', units: 1, notes: '' };

export default function Passport() {
  const { setUser, logout } = useAuth();
  const navigate = useNavigate();
  const { data, loading, error, reload } = useAsync(() => userApi.passport(), []);
  const [donationForm, setDonationForm] = useState(null); // null = closed, {…} = adding/editing
  const [editingProfile, setEditingProfile] = useState(null);
  const [busy, setBusy] = useState(false);

  if (loading && !data) return <Loader text="Opening your Donor Passport…" />;
  if (error) return <div className="container page"><ErrorBox error={error} onRetry={reload} /></div>;

  const { user, eligibility, badges, level, stats, compatibility, activePledges, donations } = data;

  const run = async (fn, msg) => {
    setBusy(true);
    try {
      await fn();
      if (msg) toast.success(msg);
      await reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const toggleAvailability = () =>
    run(async () => setUser((await userApi.setAvailability(!user.available)).user), user.available ? 'You are now hidden from searches' : 'You are visible to patients again');

  const saveDonation = (e) => {
    e.preventDefault();
    const { _id, ...body } = donationForm;
    run(async () => {
      await (_id ? donationApi.update(_id, body) : donationApi.create(body));
      setDonationForm(null);
    }, _id ? 'Donation updated' : 'Donation added to your passport');
  };

  const saveProfile = (e) => {
    e.preventDefault();
    const { location, ...rest } = editingProfile;
    run(async () => {
      const res = await userApi.update({ ...rest, weight: Number(rest.weight) || undefined, lat: location.lat, lng: location.lng, city: location.city });
      setUser(res.user);
      setEditingProfile(null);
    }, 'Profile updated');
  };

  const startEditProfile = () => {
    const [lng, lat] = user.location.coordinates;
    setEditingProfile({
      name: user.name, phone: user.phone, gender: user.gender, dateOfBirth: toInputDate(user.dateOfBirth),
      weight: user.weight || '', bloodGroup: user.bloodGroup, isDonor: user.isDonor, address: user.address || '',
      location: { lat, lng, city: user.city },
    });
  };

  const deleteAccount = async () => {
    if (!window.confirm('Delete your account and all your data? This cannot be undone.')) return;
    try {
      await userApi.deleteAccount();
      toast.success('Account deleted');
      logout();
      navigate('/');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="container page">
      {/* ---------- Passport header ---------- */}
      <div className="card passport">
        <div className="passport__id">
          <BloodBadge group={user.bloodGroup} size="xl" />
          <div>
            <span className="muted small">DONOR PASSPORT</span>
            <h1>{user.name}</h1>
            <p className="muted">{user.city} · {eligibility.age} yrs · {user.weight ? `${user.weight} kg` : 'weight not set'}</p>
            <p className="level">🏅 {level.name}{level.next && <span className="muted"> · {level.donationsToNext} more to {level.next}</span>}</p>
            {level.next && <ProgressBar value={level.progress} max={1} />}
          </div>
        </div>
        <div className="passport__status">
          <EligibilityRing eligibility={eligibility} />
          {eligibility.nextEligibleDate && !eligibility.eligible && <p className="small muted">Eligible from {formatDate(eligibility.nextEligibleDate)}</p>}
          {eligibility.reasons.filter((x) => !x.startsWith('Recovery')).map((x) => <p key={x} className="small warn">⚠️ {x}</p>)}
          {user.isDonor && (
            <label className="switch">
              <input type="checkbox" checked={user.available} onChange={toggleAvailability} disabled={busy} />
              <span>{user.available ? 'Available for donation' : 'Paused (hidden from search)'}</span>
            </label>
          )}
        </div>
      </div>

      <div className="stats-grid">
        <StatCard icon="🩸" label="Donations" value={stats.donations} />
        <StatCard icon="❤️" label="Lives saved" value={stats.livesSaved} accent />
        <StatCard icon="✔️" label="Verified donations" value={stats.verifiedDonations} />
        <StatCard icon="⚡" label="Reliability score" value={`${stats.reliabilityScore}/100`} />
      </div>

      <div className="layout-split">
        <div className="stack">
          {/* ---------- Badges ---------- */}
          <div className="card">
            <h2>Badges</h2>
            <div className="badges">
              {badges.map((b) => (
                <div key={b.id} className={`badge ${b.earned ? 'is-earned' : ''}`} title={b.description}>
                  <span className="badge__icon">{b.icon}</span>
                  <b>{b.name}</b>
                  <span className="muted small">{b.description}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ---------- Donation history (CRUD) ---------- */}
          <div className="card stack">
            <div className="row row--between">
              <h2>Donation history</h2>
              <button className="btn btn--primary btn--sm" onClick={() => setDonationForm(EMPTY_DONATION)}>+ Log donation</button>
            </div>
            {donationForm && (
              <form className="inline-form" onSubmit={saveDonation}>
                <Field label="Date"><input className="input" type="date" required max={toInputDate(new Date())} value={donationForm.date} onChange={(e) => setDonationForm({ ...donationForm, date: e.target.value })} /></Field>
                <Field label="Place"><input className="input" required placeholder="Blood bank / camp" value={donationForm.place} onChange={(e) => setDonationForm({ ...donationForm, place: e.target.value })} /></Field>
                <Field label="Units"><input className="input" type="number" min="1" max="3" value={donationForm.units} onChange={(e) => setDonationForm({ ...donationForm, units: Number(e.target.value) })} /></Field>
                <Field label="Notes"><input className="input" value={donationForm.notes || ''} onChange={(e) => setDonationForm({ ...donationForm, notes: e.target.value })} /></Field>
                <div className="row">
                  <button className="btn btn--primary btn--sm" disabled={busy}>Save</button>
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => setDonationForm(null)}>Cancel</button>
                </div>
              </form>
            )}
            {donations.length === 0 ? (
              <p className="muted">No donations yet. Your first one earns the 🩸 First Drop badge!</p>
            ) : (
              <table className="table">
                <thead><tr><th>Date</th><th>Place</th><th>Units</th><th>Status</th><th /></tr></thead>
                <tbody>
                  {donations.map((d) => (
                    <tr key={d._id}>
                      <td>{formatDate(d.date)}</td>
                      <td>{d.place}{d.request && <div className="muted small">for {d.request.patientName}</div>}</td>
                      <td>{d.units}</td>
                      <td>{d.verified ? <span className="tag tag--status-fulfilled">✔ verified</span> : <span className="tag">self-reported</span>}</td>
                      <td className="nowrap">
                        {!d.verified && (
                          <>
                            <button className="icon-btn" title="Edit" onClick={() => setDonationForm({ ...d, date: toInputDate(d.date) })}>✏️</button>
                            <button className="icon-btn" title="Delete" onClick={() => window.confirm('Delete this donation?') && run(() => donationApi.remove(d._id), 'Donation removed')}>🗑</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="stack">
          <div className="card">
            <h3>Your compatibility</h3>
            <p className="small">🩸 You can donate to: <b>{compatibility.canDonateTo.map(groupLabel).join(', ')}</b></p>
            <p className="small">💉 You can receive from: <b>{compatibility.canReceiveFrom.map(groupLabel).join(', ')}</b></p>
          </div>

          <div className="card stack">
            <h3>Active pledges</h3>
            {activePledges.length === 0 ? <p className="muted small">None. <Link to="/requests">See who needs help →</Link></p> : activePledges.map((p) => (
              <Link key={p._id} to={`/requests/${p._id}`} className="row pledge">
                <BloodBadge group={p.bloodGroup} size="sm" /> <span>{p.patientName} · {p.hospital}</span> <UrgencyTag urgency={p.urgency} />
              </Link>
            ))}
          </div>

          <div className="card stack">
            <div className="row row--between">
              <h3>Profile</h3>
              {!editingProfile && <button className="btn btn--ghost btn--sm" onClick={startEditProfile}>✏️ Edit</button>}
            </div>
            {editingProfile ? (
              <form className="stack" onSubmit={saveProfile}>
                <Field label="Name"><input className="input" required value={editingProfile.name} onChange={(e) => setEditingProfile({ ...editingProfile, name: e.target.value })} /></Field>
                <Field label="Phone"><input className="input" required value={editingProfile.phone} onChange={(e) => setEditingProfile({ ...editingProfile, phone: e.target.value })} /></Field>
                <Field label="Weight (kg)"><input className="input" type="number" value={editingProfile.weight} onChange={(e) => setEditingProfile({ ...editingProfile, weight: e.target.value })} /></Field>
                <Field label="Date of birth"><input className="input" type="date" value={editingProfile.dateOfBirth} onChange={(e) => setEditingProfile({ ...editingProfile, dateOfBirth: e.target.value })} /></Field>
                <BloodGroupPicker value={editingProfile.bloodGroup} onChange={(g) => setEditingProfile({ ...editingProfile, bloodGroup: g })} />
                <label className="check"><input type="checkbox" checked={editingProfile.isDonor} onChange={(e) => setEditingProfile({ ...editingProfile, isDonor: e.target.checked })} /> Listed as donor</label>
                <LocationPicker value={editingProfile.location} onChange={(location) => setEditingProfile({ ...editingProfile, location })} height={180} />
                <Field label="City"><input className="input" required value={editingProfile.location.city} onChange={(e) => setEditingProfile({ ...editingProfile, location: { ...editingProfile.location, city: e.target.value } })} /></Field>
                <div className="row">
                  <button className="btn btn--primary btn--sm" disabled={busy}>Save</button>
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => setEditingProfile(null)}>Cancel</button>
                </div>
              </form>
            ) : (
              <dl className="details">
                <dt>Email</dt><dd>{user.email}</dd>
                <dt>Phone</dt><dd>{user.phone}</dd>
                <dt>Gender</dt><dd>{user.gender}</dd>
                <dt>Last donation</dt><dd>{formatDate(user.lastDonationDate)}</dd>
                <dt>Member since</dt><dd>{formatDate(user.createdAt)}</dd>
              </dl>
            )}
            <button className="btn btn--danger btn--sm" onClick={deleteAccount} disabled={busy}>Delete account</button>
          </div>
        </div>
      </div>
    </div>
  );
}
