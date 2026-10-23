const mongoose = require('mongoose');

const STATUSES = ['Initiated', 'Processing', 'Completed', 'Failed'];

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    referenceId: { type: String, unique: true, index: true },
    sender: { name: String, country: String },
    recipient: {
      name: { type: String, required: true },
      email: String,
      country: { type: String, required: true },
      bankName: { type: String, required: true },
      accountNumber: { type: String, required: true },
    },
    sendAmount: { type: Number, required: true, min: 1 },
    sendCurrency: { type: String, required: true, uppercase: true },
    receiveCurrency: { type: String, required: true, uppercase: true },
    exchangeRate: { type: Number, required: true }, // locked at creation time
    fee: { type: Number, required: true },
    receiveAmount: { type: Number, required: true },
    status: { type: String, enum: STATUSES, default: 'Initiated', index: true },
    estimatedDelivery: Date,
    statusHistory: [
      { status: { type: String, enum: STATUSES }, note: String, at: { type: Date, default: Date.now } },
    ],
  },
  { timestamps: true }
);

transactionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
module.exports.STATUSES = STATUSES;
