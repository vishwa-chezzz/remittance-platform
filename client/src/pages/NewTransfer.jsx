import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

const CURRENCIES = ['USD', 'INR', 'EUR', 'GBP', 'AED', 'SGD', 'CAD', 'AUD', 'JPY'];

export default function NewTransfer() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    sendAmount: 500, sendCurrency: 'USD', receiveCurrency: 'INR',
    recipient: { name: '', email: '', country: '', bankName: '', accountNumber: '' },
  });
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const setTop = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setRec = (k) => (e) => setForm({ ...form, recipient: { ...form.recipient, [k]: e.target.value } });

  // Live quote: re-fetch whenever amount/currencies change (debounced 400ms)
  useEffect(() => {
    const { sendAmount, sendCurrency, receiveCurrency } = form;
    if (!(sendAmount > 0) || sendCurrency === receiveCurrency) return setQuote(null);
    const t = setTimeout(() => {
      api('/rates/quote', { params: { from: sendCurrency, to: receiveCurrency, amount: sendAmount } })
        .then(setQuote).catch(() => setQuote(null));
    }, 400);
    return () => clearTimeout(t);
  }, [form.sendAmount, form.sendCurrency, form.receiveCurrency]);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      const d = await api('/transactions', { method: 'POST', body: form });
      nav(`/transactions/${d.transaction._id}`);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  return (
    <form className="card" onSubmit={submit}>
      <h2>Send money abroad</h2>
      {error && <p className="error">{error}</p>}

      <div className="grid3">
        <label>You send<input type="number" min="1" step="0.01" required value={form.sendAmount} onChange={setTop('sendAmount')} /></label>
        <label>From<select value={form.sendCurrency} onChange={setTop('sendCurrency')}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select></label>
        <label>To<select value={form.receiveCurrency} onChange={setTop('receiveCurrency')}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select></label>
      </div>

      {quote ? (
        <div className="quote">
          <div>Exchange rate: <b>1 {quote.from} = {quote.rate} {quote.to}</b></div>
          <div>Fee ({quote.feePercent}%): <b>{quote.fee} {quote.from}</b></div>
          <div>Recipient gets: <b>{quote.receiveAmount} {quote.to}</b></div>
          <div>Estimated delivery: <b>~{quote.estimatedHours} hours</b></div>
          <small className="muted">The final rate is locked when you confirm.</small>
        </div>
      ) : <p className="muted">Choose two different currencies to see a quote.</p>}

      <h3>Recipient details</h3>
      <div className="grid2">
        <label>Full name<input required value={form.recipient.name} onChange={setRec('name')} /></label>
        <label>Email (optional)<input type="email" value={form.recipient.email} onChange={setRec('email')} /></label>
        <label>Country<input required value={form.recipient.country} onChange={setRec('country')} /></label>
        <label>Bank name<input required value={form.recipient.bankName} onChange={setRec('bankName')} /></label>
        <label>Account number<input required pattern="[A-Za-z0-9]{6,34}" title="6-34 letters or digits" value={form.recipient.accountNumber} onChange={setRec('accountNumber')} /></label>
      </div>

      <button className="btn" disabled={busy}>{busy ? 'Sending...' : 'Confirm transfer'}</button>
    </form>
  );
}
