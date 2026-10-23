import { useEffect, useState } from 'react';
import { api } from '../api';
import StatusBadge from '../components/StatusBadge';

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const load = () => {
    api('/admin/stats').then(setStats).catch((e) => setError(e.message));
    api('/admin/transactions', { params: { status } }).then((d) => setItems(d.items)).catch((e) => setError(e.message));
  };
  useEffect(load, [status]);

  const update = async (id, newStatus) => { await api(`/admin/transactions/${id}/status`, { method: 'PATCH', body: { status: newStatus } }); load(); };

  return (
    <>
      <h2>Admin monitoring</h2>
      {error && <p className="error">{error}</p>}
      {stats && (
        <div className="grid3">
          <div className="card stat"><span>Users</span><b>{stats.users}</b></div>
          <div className="card stat"><span>Transactions</span><b>{stats.transactions}</b></div>
          <div className="card stat"><span>By status</span><small>{stats.byStatus.map((s) => `${s.status}: ${s.count}`).join(' • ')}</small></div>
        </div>
      )}
      <div className="card">
        <div className="row between">
          <h3>All transactions</h3>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>{['Initiated', 'Processing', 'Completed', 'Failed'].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="scroll">
          <table>
            <thead><tr><th>Ref</th><th>User</th><th>Amount</th><th>Status</th><th>Change status</th></tr></thead>
            <tbody>
              {items.map((t) => (
                <tr key={t._id}>
                  <td>{t.referenceId}</td>
                  <td>{t.user?.email}</td>
                  <td>{t.sendAmount} {t.sendCurrency}</td>
                  <td><StatusBadge status={t.status} /></td>
                  <td>
                    <select value="" onChange={(e) => e.target.value && update(t._id, e.target.value)}>
                      <option value="">Set...</option>
                      {['Processing', 'Completed', 'Failed'].map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
