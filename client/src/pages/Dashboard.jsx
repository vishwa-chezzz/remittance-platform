import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid } from 'recharts';
import { api } from '../api';
import StatusBadge from '../components/StatusBadge';

const COLORS = { Initiated: '#6c8cff', Processing: '#f5a623', Completed: '#22a06b', Failed: '#e5484d' };

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api('/analytics/summary'), api('/transactions', { params: { limit: 5 } })])
      .then(([a, t]) => { setStats(a); setRecent(t.items); })
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!stats) return <p className="center">Loading...</p>;

  return (
    <>
      <div className="row between"><h2>Dashboard</h2><Link className="btn" to="/send">+ Send money</Link></div>

      <div className="grid3">
        <div className="card stat"><span>Total transfers</span><b>{stats.totals.count}</b></div>
        <div className="card stat"><span>Total sent</span><b>{stats.totals.sent.toLocaleString()}</b></div>
        <div className="card stat"><span>Fees paid</span><b>{stats.totals.fees.toFixed(2)}</b></div>
      </div>

      <div className="grid2">
        <div className="card">
          <h3>Monthly sending trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.monthly}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} /></BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3>Transfers by status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={stats.byStatus} dataKey="count" nameKey="status" outerRadius={85} label>
                {stats.byStatus.map((s) => <Cell key={s.status} fill={COLORS[s.status]} />)}
              </Pie>
              <Tooltip /><Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div className="row between"><h3>Recent transfers</h3><Link to="/transactions">View all</Link></div>
        {recent.length === 0 ? <p className="muted">No transfers yet.</p> : (
          <table>
            <thead><tr><th>Ref</th><th>Recipient</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              {recent.map((t) => (
                <tr key={t._id}>
                  <td><Link to={`/transactions/${t._id}`}>{t.referenceId}</Link></td>
                  <td>{t.recipient.name}</td>
                  <td>{t.sendAmount} {t.sendCurrency} → {t.receiveAmount} {t.receiveCurrency}</td>
                  <td><StatusBadge status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
