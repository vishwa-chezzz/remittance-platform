const Notification = require('../models/Notification');

const MAP = {
  Initiated: ['Transfer initiated', 'Your transfer %REF% has been created.', 'info'],
  Processing: ['Transfer processing', 'Your transfer %REF% is being processed by the bank network.', 'info'],
  Completed: ['Transfer completed', 'Your transfer %REF% has been delivered to the recipient.', 'success'],
  Failed: ['Transfer failed', 'Your transfer %REF% could not be completed. Funds will be returned.', 'error'],
};

exports.notifyStatus = async (tx) => {
  const [title, msg, type] = MAP[tx.status];
  await Notification.create({
    user: tx.user,
    transaction: tx._id,
    title,
    message: msg.replace('%REF%', tx.referenceId),
    type,
  });
};
