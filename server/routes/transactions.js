const router = require('express').Router();
const crypto = require('crypto');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');
const { getRate, calcFee, ETA_HOURS, CURRENCIES } = require('../utils/rates');
const { notifyStatus } = require('../services/notify');
const { simulate } = require('../services/simulator');

router.use(protect);

// CREATE a remittance
router.post('/', async (req, res, next) => {
  try {
    const { recipient, sendAmount, sendCurrency, receiveCurrency } = req.body;
    const amount = Number(sendAmount);
    const from = String(sendCurrency || '').toUpperCase();
    const to = String(receiveCurrency || '').toUpperCase();

    if (!recipient?.name || !recipient?.country || !recipient?.bankName || !recipient?.accountNumber) {
      return res.status(400).json({ message: 'Recipient name, country, bank and account number are required' });
    }
    if (!/^[A-Za-z0-9]{6,34}$/.test(recipient.accountNumber)) {
      return res.status(400).json({ message: 'Account number must be 6-34 letters/digits' });
    }
    if (!CURRENCIES.includes(from) || !CURRENCIES.includes(to) || from === to) {
      return res.status(400).json({ message: 'Choose two different supported currencies' });
    }
    if (!(amount >= 1) || amount > 1_000_000) return res.status(400).json({ message: 'Amount must be between 1 and 1,000,000' });

    const rate = getRate(from, to);
    const fee = calcFee(amount);
    const tx = await Transaction.create({
      user: req.user._id,
      referenceId: 'RMT-' + crypto.randomBytes(4).toString('hex').toUpperCase(),
      sender: { name: req.user.name, country: req.user.country },
      recipient,
      sendAmount: amount, sendCurrency: from, receiveCurrency: to,
      exchangeRate: rate, fee,
      receiveAmount: +((amount - fee) * rate).toFixed(2),
      estimatedDelivery: new Date(Date.now() + (ETA_HOURS[to] || 24) * 3600 * 1000),
      statusHistory: [{ status: 'Initiated', note: 'Transfer created' }],
    });
    await notifyStatus(tx);
    simulate(tx._id);
    res.status(201).json({ transaction: tx });
  } catch (e) { next(e); }
});

// LIST with search + filters + pagination
router.get('/', async (req, res, next) => {
  try {
    const { status, currency, q, from, to, minAmount, maxAmount, page = 1, limit = 10 } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;
    if (currency) filter.$or = [{ sendCurrency: currency.toUpperCase() }, { receiveCurrency: currency.toUpperCase() }];
    if (q) {
      const rx = new RegExp(String(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$and = [{ $or: [{ 'recipient.name': rx }, { referenceId: rx }] }];
    }
    if (from || to) filter.createdAt = { ...(from && { $gte: new Date(from) }), ...(to && { $lte: new Date(to + 'T23:59:59') }) };
    if (minAmount || maxAmount) filter.sendAmount = { ...(minAmount && { $gte: +minAmount }), ...(maxAmount && { $lte: +maxAmount }) };

    const p = Math.max(1, +page), l = Math.min(50, Math.max(1, +limit));
    const [items, total] = await Promise.all([
      Transaction.find(filter).sort({ createdAt: -1 }).skip((p - 1) * l).limit(l),
      Transaction.countDocuments(filter),
    ]);
    res.json({ items, total, page: p, pages: Math.ceil(total / l) });
  } catch (e) { next(e); }
});

// GET one (only owner can see it)
router.get('/:id', async (req, res, next) => {
  try {
    const tx = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!tx) return res.status(404).json({ message: 'Transaction not found' });
    res.json({ transaction: tx });
  } catch (e) { next(e); }
});

module.exports = router;
