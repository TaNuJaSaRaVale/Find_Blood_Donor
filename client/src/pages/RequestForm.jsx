import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { requestApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { Field, Loader, BloodBadge } from '../components/ui';
import BloodGroupPicker from '../components/BloodGroupPicker';
import LocationPicker from '../components/LocationPicker';
import { URGENCY, canReceiveFrom, groupLabel } from '../utils/blood';
import { toInputDate } from '../utils/format';

/** Used for both "new request" and "edit request" (/requests/:id/edit). */
export default function RequestForm() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const isSos = params.get('sos') === '1';
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(Boolean(id));
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState(null);
  const [form, setForm] = useState({
    patientName: '', bloodGroup: params.get('bloodGroup') || '', unitsNeeded: 1, hospital: '',
    urgency: isSos ? 'critical' : 'urgent', contactPhone: user?.phone || '', requiredBy: '', note: '', location: null,
  });

  useEffect(() => {
    if (!id) return;
    requestApi.get(id)
      .then(({ request: r }) => {
        if (!r.isOwner) { toast.error('You can only edit your own requests'); navigate(`/requests/${id}`); return; }
        const [lng, lat] = r.location.coordinates;
        setForm({ ...r, requiredBy: toInputDate(r.requiredBy), note: r.note || '', location: { lat, lng, city: r.city } });
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.bloodGroup) return toast.error('Select the patient’s blood group');
    if (!form.location?.lat) return toast.error('Set the hospital location');
    if (!form.location.city) return toast.error('Type the city');
    setBusy(true);
    const body = {
      patientName: form.patientName, bloodGroup: form.bloodGroup, unitsNeeded: Number(form.unitsNeeded),
      hospital: form.hospital, urgency: form.urgency, contactPhone: form.contactPhone, note: form.note,
      requiredBy: form.requiredBy || undefined, lat: form.location.lat, lng: form.location.lng, city: form.location.city,
    };
    try {
      if (id) {
        await requestApi.update(id, body);
        toast.success('Request updated');
        navigate(`/requests/${id}`);
      } else {
        setCreated(await requestApi.create(body));
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
    return undefined;
  };

  if (loading) return <Loader />;

  // Success screen after an SOS / request: show who got alerted
  if (created) {
    return (
      <div className="container page narrow">
        <div className="card center stack">
          <div className="big-emoji">📣</div>
          <h1>Request is live!</h1>
          <p className="lead"><b>{created.notifiedCount}</b> compatible, eligible donor{created.notifiedCount === 1 ? '' : 's'} nearby {created.notifiedCount === 1 ? 'was' : 'were'} alerted.</p>
          {created.topMatches.length > 0 && (
            <div className="stack">
              <h3>Best matches</h3>
              {created.topMatches.map((d) => (
                <div key={d._id} className="donor-card card">
                  <BloodBadge group={d.bloodGroup} size="sm" />
                  <div className="donor-card__info"><b>{d.name}</b><span className="muted">{d.distanceKm} km · {d.city}</span></div>
                  <div className="score"><b>{d.matchScore}</b><span>match</span></div>
                </div>
              ))}
            </div>
          )}
          <p className="muted">You will get a notification with the donor’s phone number as soon as someone pledges.</p>
          <div className="row center">
            <button className="btn btn--primary" onClick={() => navigate(`/requests/${created.request._id}`)}>View request</button>
            <a className="btn btn--whatsapp" target="_blank" rel="noreferrer" href={`https://wa.me/?text=${encodeURIComponent(`🩸 URGENT: ${groupLabel(created.request.bloodGroup)} blood needed for ${created.request.patientName} at ${created.request.hospital}, ${created.request.city}. Contact ${created.request.contactPhone}. Help via RaktSetu: ${window.location.origin}/requests/${created.request._id}`)}`}>
              Share on WhatsApp
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container page narrow">
      <form className={`card stack ${isSos ? 'card--sos' : ''}`} onSubmit={submit}>
        <h1>{id ? 'Edit request' : isSos ? '🚨 Emergency SOS' : 'Request blood'}</h1>
        {isSos && <p className="muted">Fill the essentials. Every compatible, eligible donor within 25 km is alerted the moment you submit.</p>}

        <h3>Patient blood group</h3>
        <BloodGroupPicker value={form.bloodGroup} onChange={(g) => setForm({ ...form, bloodGroup: g })} highlight={form.bloodGroup ? canReceiveFrom(form.bloodGroup) : []} />
        {form.bloodGroup && <p className="field__hint">Donors with {canReceiveFrom(form.bloodGroup).map(groupLabel).join(', ')} will be alerted.</p>}

        <div className="grid-2">
          <Field label="Patient name"><input className="input" required value={form.patientName} onChange={set('patientName')} /></Field>
          <Field label="Units needed"><input className="input" type="number" min="1" max="10" required value={form.unitsNeeded} onChange={set('unitsNeeded')} /></Field>
          <Field label="Hospital"><input className="input" required value={form.hospital} onChange={set('hospital')} /></Field>
          <Field label="Contact phone"><input className="input" required inputMode="tel" value={form.contactPhone} onChange={set('contactPhone')} /></Field>
        </div>

        <h3>Urgency</h3>
        <div className="urgency-picker">
          {Object.entries(URGENCY).map(([key, u]) => (
            <button type="button" key={key} className={`urgency-option urgency-option--${key} ${form.urgency === key ? 'is-active' : ''}`} onClick={() => setForm({ ...form, urgency: key })}>
              <b>{u.icon} {u.label}</b>
              <span>{u.hint}</span>
            </button>
          ))}
        </div>

        <h3>Hospital location</h3>
        <LocationPicker value={form.location} onChange={(location) => setForm({ ...form, location })} />
        <div className="grid-2">
          <Field label="City"><input className="input" required value={form.location?.city || ''} onChange={(e) => setForm({ ...form, location: { ...(form.location || {}), city: e.target.value } })} /></Field>
          <Field label="Required by (optional)"><input className="input" type="date" value={form.requiredBy} onChange={set('requiredBy')} /></Field>
        </div>
        <Field label="Note for donors (optional)"><textarea className="input" rows="3" maxLength={500} value={form.note} onChange={set('note')} /></Field>

        <button className={`btn btn--block btn--lg ${isSos ? 'btn--sos' : 'btn--primary'}`} disabled={busy}>
          {busy ? 'Saving…' : id ? 'Save changes' : isSos ? '🚨 Send SOS to nearby donors' : 'Post request & alert donors'}
        </button>
      </form>
    </div>
  );
}
