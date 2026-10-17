import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Field } from '../components/ui';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(location.state?.from || '/passport', { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container auth">
      <form className="card auth__card" onSubmit={submit}>
        <h1>Welcome back 👋</h1>
        <p className="muted">Log in to respond to requests and manage your Donor Passport.</p>
        <Field label="Email">
          <input className="input" type="email" required autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </Field>
        <Field label="Password">
          <input className="input" type="password" required autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </Field>
        <button className="btn btn--primary btn--block" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
        <button type="button" className="btn btn--ghost btn--block" onClick={() => setForm({ email: 'demo@raktsetu.in', password: 'demo1234' })}>
          Use demo account
        </button>
        <p className="muted center">New here? <Link to="/register">Create an account</Link></p>
      </form>
    </div>
  );
}
