import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Field } from '../components/ui';
import BloodGroupPicker from '../components/BloodGroupPicker';
import LocationPicker from '../components/LocationPicker';
import { canDonateTo, groupLabel } from '../utils/blood';

const EMPTY = {
  name: '', email: '', password: '', phone: '', gender: 'male', dateOfBirth: '', weight: '',
  bloodGroup: '', isDonor: true, lastDonationDate: '', address: '', location: null,
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.bloodGroup) return toast.error('Please select your blood group');
    if (!form.location?.lat) return toast.error('Please set your location');
    if (!form.location.city) return toast.error('Please type your city');
    setBusy(true);
    try {
      const { location, ...rest } = form;
      await register({
        ...rest,
        weight: Number(form.weight) || undefined,
        lastDonationDate: form.lastDonationDate || null,
        lat: location.lat,
        lng: location.lng,
        city: location.city,
      });
      toast.success('Account created - welcome to RaktSetu! 🩸');
      navigate('/passport');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
    return undefined;
  };

  return (
    <div className="container auth auth--wide">
      <form className="card auth__card" onSubmit={submit}>
        <h1>Join RaktSetu ❤️</h1>
        <p className="muted">One account lets you both donate and request blood.</p>

        <h3 className="form-section">1. About you</h3>
        <div className="grid-2">
          <Field label="Full name"><input className="input" required value={form.name} onChange={set('name')} /></Field>
          <Field label="Phone" hint="Shared only with patients you pledge to help"><input className="input" required inputMode="tel" placeholder="9876543210" value={form.phone} onChange={set('phone')} /></Field>
          <Field label="Email"><input className="input" type="email" required value={form.email} onChange={set('email')} /></Field>
          <Field label="Password" hint="At least 6 characters"><input className="input" type="password" minLength={6} required value={form.password} onChange={set('password')} /></Field>
          <Field label="Gender">
            <select className="input" value={form.gender} onChange={set('gender')}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </Field>
          <Field label="Date of birth"><input className="input" type="date" required value={form.dateOfBirth} onChange={set('dateOfBirth')} /></Field>
          <Field label="Weight (kg)" hint="Donors must be at least 50 kg"><input className="input" type="number" min="30" max="250" value={form.weight} onChange={set('weight')} /></Field>
          <Field label="Last donation (if any)"><input className="input" type="date" value={form.lastDonationDate} onChange={set('lastDonationDate')} max={new Date().toISOString().slice(0, 10)} /></Field>
        </div>

        <h3 className="form-section">2. Blood group</h3>
        <BloodGroupPicker value={form.bloodGroup} onChange={(g) => setForm({ ...form, bloodGroup: g })} highlight={form.bloodGroup ? canDonateTo(form.bloodGroup) : []} />
        {form.bloodGroup && (
          <p className="field__hint">
            As {groupLabel(form.bloodGroup)} you can donate to: <b>{canDonateTo(form.bloodGroup).map(groupLabel).join(', ')}</b>
          </p>
        )}
        <label className="check">
          <input type="checkbox" checked={form.isDonor} onChange={set('isDonor')} /> I want to be listed as a blood donor
        </label>

        <h3 className="form-section">3. Location</h3>
        <LocationPicker value={form.location} onChange={(location) => setForm({ ...form, location })} />
        <div className="grid-2">
          <Field label="City">
            <input className="input" required value={form.location?.city || ''} onChange={(e) => setForm({ ...form, location: { ...(form.location || {}), city: e.target.value } })} />
          </Field>
          <Field label="Area / address (optional)"><input className="input" value={form.address} onChange={set('address')} /></Field>
        </div>

        <button className="btn btn--primary btn--block btn--lg" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
        <p className="muted center">Already registered? <Link to="/login">Log in</Link></p>
      </form>
    </div>
  );
}
