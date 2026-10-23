// Run: npm run seed   -> creates an admin, a demo user, and sample transactions
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const Notification = require('./models/Notification');
const { getRate, calcFee } = require('./utils/rates');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([User.deleteMany({}), Transaction.deleteMany({}), Notification.deleteMany({})]);

  await User.create({ name: 'Admin', email: 'admin@remit.com', password: 'Admin@123', role: 'admin' });
  const demo = await User.create({ name: 'Demo User', email: 'demo@remit.com', password: 'Demo@1234', country: 'USA' });

  const pairs = [['USD', 'INR'], ['USD', 'EUR'], ['USD', 'GBP'], ['USD', 'AED'], ['USD', 'INR']];
  const statuses = ['Completed', 'Completed', 'Completed', 'Failed', 'Processing'];
  const docs = [];
  for (let i = 0; i < 15; i++) {
    const [from, to] = pairs[i % pairs.length];
    const amount = 100 + Math.round(Math.random() * 900);
    const rate = getRate(from, to), fee = calcFee(amount);
    const created = new Date(Date.now() - i * 9 * 24 * 3600 * 1000 / 2);
    docs.push({
      user: demo._id, referenceId: 'RMT-SEED' + String(i).padStart(3, '0'),
      sender: { name: demo.name, country: demo.country },
      recipient: { name: ['Asha Rao', 'Luca Rossi', 'Tom Hall', 'Omar Ali'][i % 4], country: 'Abroad', bankName: 'Sample Bank', accountNumber: '12345678' + i },
      sendAmount: amount, sendCurrency: from, receiveCurrency: to, exchangeRate: rate, fee,
      receiveAmount: +((amount - fee) * rate).toFixed(2),
      status: statuses[i % statuses.length],
      statusHistory: [{ status: 'Initiated', at: created }],
      createdAt: created, updatedAt: created,
    });
  }
  await Transaction.insertMany(docs, { timestamps: false });
  console.log('Seeded.\n  admin@remit.com / Admin@123\n  demo@remit.com  / Demo@1234');
  process.exit(0);
})();
