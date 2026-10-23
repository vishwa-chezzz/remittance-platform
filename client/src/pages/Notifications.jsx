import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Notifications() {
  const [items, setItems] = useState([]);
  const load = () => api('/notifications').then((d) => setItems(d.items));
  useEffect(() => { load(); }, []);

  const readAll = async () => { await api('/notifications/read-all', { method: 'PATCH' }); load(); };
  const readOne = async (id) => { await api(`/notifications/${id}/read`, { method: 'PATCH' }); load(); };

  return (
    <div className="card">
      <div className="row between"><h2>Notifications</h2><button className="btn secondary" onClick={readAll}>Mark all read</button></div>
      {items.length === 0 && <p className="muted">Nothing yet.</p>}
      {items.map((n) => (
        <div key={n._id} className={`notice ${n.type} ${n.read ? 'read' : ''}`} onClick={() => !n.read && readOne(n._id)}>
          <b>{n.title}</b>
          <p>{n.message}</p>
          <small className="muted">{new Date(n.createdAt).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
}
