const router = require('express').Router();
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { protect, restrictTo } = require('../middleware/auth');
const { setStatus } = require('../services/simulator');

router.use(protect, restrictTo('admin'));

router.get('/stats', async (req, res, next) => {
  try {
    const [users, transactions, byStatus, volume] = await Promise.all([
      User.countDocuments(),
      Transaction.countDocuments(),
      Transaction.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Transaction.aggregate([{ $group: { _id: '$sendCurrency', total: { $sum: '$sendAmount' } } }]),
    ]);
    res.json({
      users, transactions,
      byStatus: byStatus.map((s) => ({ status: s._id, count: s.count })),
      volume: volume.map((v) => ({ currency: v._id, total: v.total })),
    });
  } catch (e) { next(e); }
});

router.get('/transactions', async (req, res, next) => {
  try {
    const filter = req.query.status ? { status: req.query.status } : {};
    const items = await Transaction.find(filter).populate('user', 'name email').sort({ createdAt: -1 }).limit(100);
    res.json({ items });
  } catch (e) { next(e); }
});

router.patch('/transactions/:id/status', async (req, res, next) => {
  try {
    const { status, note } = req.body;
    if (!['Initiated', 'Processing', 'Completed', 'Failed'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
    await setStatus(req.params.id, status, note || `Updated by admin ${req.user.name}`);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
