const Transaction = require('../models/Transaction');
const { notifyStatus } = require('./notify');

async function setStatus(id, status, note) {
  const tx = await Transaction.findById(id);
  if (!tx || ['Completed', 'Failed'].includes(tx.status)) return;
  tx.status = status;
  tx.statusHistory.push({ status, note });
  await tx.save();
  await notifyStatus(tx);
}

// DEMO ONLY: moves a transaction Initiated -> Processing -> Completed/Failed
// so you can watch real-time tracking without a real bank network.
exports.simulate = (id) => {
  if (process.env.SIMULATE_STATUS === 'false') return;
  setTimeout(() => setStatus(id, 'Processing', 'Sent to bank network').catch(console.error), 8000);
  setTimeout(() => {
    const ok = Math.random() > 0.1; // 10% failure rate
    setStatus(id, ok ? 'Completed' : 'Failed', ok ? 'Funds delivered' : 'Rejected by receiving bank').catch(console.error);
  }, 20000);
};

exports.setStatus = setStatus;
