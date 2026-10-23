import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', country: '' });
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try { await register(form); nav('/'); } catch (err) { setError(err.message); }
  };

  return (
    <form className="card narrow" onSubmit={submit}>
      <h2>Create account</h2>
      {error && <p className="error">{error}</p>}
      <label>Full name<input required value={form.name} onChange={set('name')} /></label>
      <label>Email<input type="email" required value={form.email} onChange={set('email')} /></label>
      <label>Country<input value={form.country} onChange={set('country')} placeholder="e.g. USA" /></label>
      <label>Password (min 8 chars)<input type="password" minLength={8} required value={form.password} onChange={set('password')} /></label>
      <button className="btn">Register</button>
      <p className="muted">Already registered? <Link to="/login">Login</Link></p>
    </form>
  );
}
