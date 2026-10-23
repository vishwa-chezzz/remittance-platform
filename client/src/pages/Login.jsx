import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try { await login(form.email, form.password); nav('/'); } catch (err) { setError(err.message); }
  };

  return (
    <form className="card narrow" onSubmit={submit}>
      <h2>Welcome back</h2>
      {error && <p className="error">{error}</p>}
      <label>Email<input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
      <label>Password<input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
      <button className="btn">Login</button>
      <p className="muted">No account? <Link to="/register">Register</Link></p>
      <p className="muted small">Demo: demo@remit.com / Demo@1234</p>
    </form>
  );
}
