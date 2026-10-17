import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { campApi } from '../api/endpoints';
import { useAsync } from '../hooks/useAsync';
import { useAuth } from '../context/AuthContext';
import MapView from '../components/MapView';
import LocationPicker from '../components/LocationPicker';
import { EmptyState, ErrorBox, Field, Loader, ProgressBar } from '../components/ui';
import { formatDate, toInputDate } from '../utils/format';
import { DEFAULT_CENTER } from '../utils/cities';

const EMPTY = { name: '', description: '', date: '', startTime: '09:00', endTime: '17:00', venue: '', capacity: 50, contactPhone: '', location: null };

export default function Camps() {
  const { user } = useAuth();
  const [when, setWhen] = useState('upcoming');
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const { data, loading, error, reload } = useAsync(() => campApi.list({ when }), [when, user?._id]);

  const run = async (fn, msg) => {
    setBusy(true);
    try {
      await fn();
      toast.success(msg);
      await reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const save = (e) => {
    e.preventDefault();
    if (!form.location?.lat) return toast.error('Set the camp location on the map');
    const { _id, location, ...rest } = form;
    const body = { ...rest, capacity: Number(rest.capacity), contactPhone: rest.contactPhone || undefined, lat: location.lat, lng: location.lng, city: location.city };
    run(async () => {
      const res = await (_id ? campApi.update(_id, body) : campApi.create(body));
      setForm(null);
      if (res.notified !== undefined) toast(`📣 ${res.notified} donors nearby were notified`);
    }, _id ? 'Camp updated' : 'Camp created');
    return undefined;
  };

  const edit = (c) => {
    const [lng, lat] = c.location.coordinates;
    setForm({ ...c, date: toInputDate(c.date), description: c.description || '', contactPhone: c.contactPhone || '', location: { lat, lng, city: c.city } });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const camps = data?.camps || [];
  const markers = camps.map((c) => ({ id: c._id, lat: c.location.coordinates[1], lng: c.location.coordinates[0], color: '#7c3aed', radius: 10, popup: <><b>{c.name}</b><br />{formatDate(c.date)} · {c.venue}</> }));

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <h1>Donation camps</h1>
          <p className="muted">Book a slot. Seat booking is atomic, so a camp can never be overbooked.</p>
        </div>
        {user ? <button className="btn btn--primary" onClick={() => setForm(form ? null : EMPTY)}>{form ? 'Close form' : '+ Organize a camp'}</button>
          : <Link to="/login" className="btn btn--ghost">Log in to organize</Link>}
      </div>

      {form && (
        <form className="card stack" onSubmit={save}>
          <h2>{form._id ? 'Edit camp' : 'Organize a camp'}</h2>
          <div className="grid-2">
            <Field label="Camp name"><input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Venue"><input className="input" required value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} /></Field>
            <Field label="Date"><input className="input" type="date" required min={toInputDate(new Date())} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
            <div className="grid-2">
              <Field label="From"><input className="input" type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} /></Field>
              <Field label="To"><input className="input" type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} /></Field>
            </div>
            <Field label="Capacity (donors)"><input className="input" type="number" min="1" max="1000" required value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} /></Field>
            <Field label="Contact phone"><input className="input" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} /></Field>
          </div>
          <Field label="Description"><textarea className="input" rows="2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          <LocationPicker value={form.location} onChange={(location) => setForm({ ...form, location })} height={200} />
          <Field label="City"><input className="input" required value={form.location?.city || ''} onChange={(e) => setForm({ ...form, location: { ...(form.location || {}), city: e.target.value } })} /></Field>
          <button className="btn btn--primary" disabled={busy}>{form._id ? 'Save changes' : 'Create camp & notify donors within 20 km'}</button>
        </form>
      )}

      <div className="tabs">
        {['upcoming', 'past'].map((w) => <button key={w} className={`tab ${when === w ? 'is-active' : ''}`} onClick={() => setWhen(w)}>{w === 'upcoming' ? '📅 Upcoming' : '🕘 Past'}</button>)}
      </div>

      <ErrorBox error={error} onRetry={reload} />
      {loading ? <Loader /> : camps.length === 0 ? <EmptyState icon="🏕️" title="No camps here yet">Be the first to organize one!</EmptyState> : (
        <>
          <MapView center={camps[0] ? { lat: camps[0].location.coordinates[1], lng: camps[0].location.coordinates[0] } : DEFAULT_CENTER} zoom={9} markers={markers} height={300} />
          <div className="camp-grid">
            {camps.map((c) => (
              <div key={c._id} className="card camp">
                <div className="camp__date">
                  <b>{new Date(c.date).getDate()}</b>
                  <span>{new Date(c.date).toLocaleString('en-IN', { month: 'short' })}</span>
                </div>
                <div className="camp__body stack">
                  <h3>{c.name}</h3>
                  <p className="muted small">📍 {c.venue}, {c.city}{c.distanceKm !== undefined && ` · ${c.distanceKm} km`} · 🕘 {c.startTime}–{c.endTime}</p>
                  {c.description && <p className="small">{c.description}</p>}
                  <ProgressBar value={c.registeredCount} max={c.capacity} />
                  <p className="small muted">{c.registeredCount}/{c.capacity} booked · <b>{c.seatsLeft} seats left</b> · by {c.organizer?.name}</p>
                  {when === 'upcoming' && (
                    <div className="row">
                      {!user ? <Link to="/login" className="btn btn--ghost btn--sm">Log in to book</Link>
                        : c.isRegistered ? <button className="btn btn--ghost btn--sm" disabled={busy} onClick={() => run(() => campApi.unregister(c._id), 'Booking cancelled')}>✓ Booked – cancel</button>
                        : <button className="btn btn--primary btn--sm" disabled={busy || c.seatsLeft === 0} onClick={() => run(() => campApi.register(c._id), 'Seat booked! 🎉')}>{c.seatsLeft === 0 ? 'Full' : 'Book a seat'}</button>}
                      {c.isOrganizer && <button className="btn btn--ghost btn--sm" onClick={() => edit(c)}>✏️ Edit</button>}
                      {c.isOrganizer && <button className="btn btn--danger btn--sm" disabled={busy} onClick={() => window.confirm('Delete this camp? Registered donors will be notified.') && run(() => campApi.remove(c._id), 'Camp deleted')}>🗑</button>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
