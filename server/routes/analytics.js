const router = require('express').Router();
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');

router.use(protect);

// Uses MongoDB aggregation pipelines
router.get('/summary', async (req, res, next) => {
  try {
    const uid = new mongoose.Types.ObjectId(req.user._id);
    const match = { $match: { user: uid } };

    const [byStatus, byCurrency, monthly, totals] = await Promise.all([
      Transaction.aggregate([match, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      Transaction.aggregate([match, { $group: { _id: '$sendCurrency', total: { $sum: '$sendAmount' }, count: { $sum: 1 } } }, { $sort: { total: -1 } }]),
      Transaction.aggregate([
        match,
        { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, total: { $sum: '$sendAmount' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $limit: 12 },
      ]),
      Transaction.aggregate([match, { $group: { _id: null, count: { $sum: 1 }, fees: { $sum: '$fee' }, sent: { $sum: '$sendAmount' } } }]),
    ]);

    res.json({
      totals: totals[0] || { count: 0, fees: 0, sent: 0 },
      byStatus: byStatus.map((s) => ({ status: s._id, count: s.count })),
      byCurrency: byCurrency.map((c) => ({ currency: c._id, total: c.total, count: c.count })),
      monthly: monthly.map((m) => ({ month: m._id, total: m.total, count: m.count })),
    });
  } catch (e) { next(e); }
});

module.exports = router;
