import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { api } from '../api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [unread, setUnread] = useState(0);

  // poll unread notification count every 10s
  useEffect(() => {
    if (!user) return;
    const load = () => api('/notifications').then((d) => setUnread(d.unread)).catch(() => {});
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, [user]);

  return (
    <header className="nav">
      <Link to="/" className="brand">🌍 RemitTrack</Link>
      {user ? (
        <nav>
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/send">Send Money</NavLink>
          <NavLink to="/transactions">History</NavLink>
          <NavLink to="/notifications">Alerts{unread > 0 && <span className="dot">{unread}</span>}</NavLink>
          {user.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
          <button className="link" onClick={() => { logout(); nav('/login'); }}>Logout ({user.name.split(' ')[0]})</button>
        </nav>
      ) : (
        <nav><NavLink to="/login">Login</NavLink><NavLink to="/register">Register</NavLink></nav>
      )}
    </header>
  );
}
