import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import StatusBadge from '../components/StatusBadge';

const empty = { q: '', status: '', currency: '', from: '', to: '', minAmount: '', maxAmount: '' };

export default function Transactions() {
  const [filters, setFilters] = useState(empty);
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], pages: 1, total: 0 });
  const [error, setError] = useState('');
  const set = (k) => (e) => { setFilters({ ...filters, [k]: e.target.value }); setPage(1); };

  useEffect(() => {
    const t = setTimeout(() => {
      api('/transactions', { params: { ...filters, page, limit: 10 } }).then(setData).catch((e) => setError(e.message));
    }, 300);
    return () => clearTimeout(t);
  }, [filters, page]);

  return (
    <div className="card">
      <h2>Transaction history <small className="muted">({data.total})</small></h2>
      {error && <p className="error">{error}</p>}

      <div className="filters">
        <input placeholder="Search name or reference" value={filters.q} onChange={set('q')} />
        <select value={filters.status} onChange={set('status')}>
          <option value="">All statuses</option>
          {['Initiated', 'Processing', 'Completed', 'Failed'].map((s) => <option key={s}>{s}</option>)}
        </select>
        <input placeholder="Currency (USD)" value={filters.currency} onChange={set('currency')} />
        <input type="date" value={filters.from} onChange={set('from')} />
        <input type="date" value={filters.to} onChange={set('to')} />
        <input type="number" placeholder="Min amt" value={filters.minAmount} onChange={set('minAmount')} />
        <input type="number" placeholder="Max amt" value={filters.maxAmount} onChange={set('maxAmount')} />
        <button className="btn secondary" onClick={() => { setFilters(empty); setPage(1); }}>Clear</button>
      </div>

      <div className="scroll">
        <table>
          <thead><tr><th>Date</th><th>Ref</th><th>Recipient</th><th>Sent</th><th>Received</th><th>Rate</th><th>Status</th></tr></thead>
          <tbody>
            {data.items.map((t) => (
              <tr key={t._id}>
                <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                <td><Link to={`/transactions/${t._id}`}>{t.referenceId}</Link></td>
                <td>{t.recipient.name}</td>
                <td>{t.sendAmount} {t.sendCurrency}</td>
                <td>{t.receiveAmount} {t.receiveCurrency}</td>
                <td>{t.exchangeRate}</td>
                <td><StatusBadge status={t.status} /></td>
              </tr>
            ))}
            {data.items.length === 0 && <tr><td colSpan="7" className="muted">No transactions found.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="row between">
        <button className="btn secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
        <span>Page {page} of {data.pages || 1}</span>
        <button className="btn secondary" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>
  );
}
