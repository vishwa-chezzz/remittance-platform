// Demo exchange rates relative to 1 USD. In production, replace getRate()
// with a call to a real FX API (e.g. exchangerate.host, Open Exchange Rates).
const BASE = { USD: 1, INR: 83.2, EUR: 0.92, GBP: 0.79, AED: 3.67, SGD: 1.35, CAD: 1.36, AUD: 1.52, JPY: 151.0 };

// Estimated processing time in hours per receiving currency
const ETA_HOURS = { USD: 24, INR: 12, EUR: 24, GBP: 24, AED: 6, SGD: 12, CAD: 48, AUD: 48, JPY: 48 };

const CURRENCIES = Object.keys(BASE);

// small random drift (+-0.3%) so the rate looks "live" for demo purposes
function getRate(from, to) {
  if (!BASE[from] || !BASE[to]) return null;
  const drift = 1 + (Math.random() - 0.5) * 0.006;
  return +((BASE[to] / BASE[from]) * drift).toFixed(4);
}

const FEE_PERCENT = 1; // 1% transfer fee
const calcFee = (amount) => +Math.max(2, (amount * FEE_PERCENT) / 100).toFixed(2);

module.exports = { CURRENCIES, ETA_HOURS, FEE_PERCENT, getRate, calcFee };
