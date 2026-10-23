import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';
import StatusBadge from '../components/StatusBadge';

const STEPS = ['Initiated', 'Processing', 'Completed'];

export default function TransactionDetail() {
  const { id } = useParams();
  const [tx, setTx] = useState(null);
  const [error, setError] = useState('');

  // Real-time tracking: poll every 4s until the transfer is finished
  useEffect(() => {
    let timer;
    const load = async () => {
      try {
        const d = await api(`/transactions/${id}`);
        setTx(d.transaction);
        if (!['Completed', 'Failed'].includes(d.transaction.status)) timer = setTimeout(load, 4000);
      } catch (e) { setError(e.message); }
    };
    load();
    return () => clearTimeout(timer);
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!tx) return <p className="center">Loading...</p>;

  const failed = tx.status === 'Failed';
  const current = failed ? 1 : STEPS.indexOf(tx.status);

  return (
    <div className="card">
      <Link to="/transactions">← Back</Link>
      <div className="row between"><h2>{tx.referenceId}</h2><StatusBadge status={tx.status} /></div>

      <div className="tracker">
        {STEPS.map((s, i) => {
          const label = failed && i === 2 ? 'Failed' : s;
          const cls = failed && i === 2 ? 'failed' : i <= current ? 'done' : '';
          return <div key={s} className={`step ${cls}`}><div className="circle">{i + 1}</div><span>{label}</span></div>;
        })}
      </div>

      <div className="grid2">
        <div>
          <h3>Amounts</h3>
          <p>Sent: <b>{tx.sendAmount} {tx.sendCurrency}</b></p>
          <p>Fee: {tx.fee} {tx.sendCurrency}</p>
          <p>Locked rate: 1 {tx.sendCurrency} = {tx.exchangeRate} {tx.receiveCurrency}</p>
          <p>Recipient gets: <b>{tx.receiveAmount} {tx.receiveCurrency}</b></p>
          {!['Completed', 'Failed'].includes(tx.status) && <p>Estimated delivery: {new Date(tx.estimatedDelivery).toLocaleString()}</p>}
        </div>
        <div>
          <h3>Recipient</h3>
          <p>{tx.recipient.name} ({tx.recipient.country})</p>
          <p>{tx.recipient.bankName}</p>
          <p>Account: ****{tx.recipient.accountNumber.slice(-4)}</p>
        </div>
      </div>

      <h3>Timeline</h3>
      <ul className="timeline">
        {[...tx.statusHistory].reverse().map((h, i) => (
          <li key={i}><StatusBadge status={h.status} /> {h.note} <small className="muted">{new Date(h.at).toLocaleString()}</small></li>
        ))}
      </ul>
    </div>
  );
}
