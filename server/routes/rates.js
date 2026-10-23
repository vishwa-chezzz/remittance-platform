const router = require('express').Router();
const { CURRENCIES, ETA_HOURS, FEE_PERCENT, getRate, calcFee } = require('../utils/rates');
const { protect } = require('../middleware/auth');

router.get('/currencies', (req, res) => res.json({ currencies: CURRENCIES }));

// GET /api/rates/quote?from=USD&to=INR&amount=500
router.get('/quote', protect, (req, res) => {
  const from = String(req.query.from || '').toUpperCase();
  const to = String(req.query.to || '').toUpperCase();
  const amount = Number(req.query.amount);
  const rate = getRate(from, to);
  if (!rate || !(amount > 0)) return res.status(400).json({ message: 'Invalid from/to/amount' });
  const fee = calcFee(amount);
  res.json({
    from, to, rate, fee, feePercent: FEE_PERCENT,
    receiveAmount: +((amount - fee) * rate).toFixed(2),
    estimatedHours: ETA_HOURS[to],
  });
});

module.exports = router;
