const mongoose = require('mongoose');
const { getLocalModel } = require('../utils/localDb');

const notificationSchemaDefinition = {
  user: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, required: true }, // 'renewal_alert', 'renewal_success', 'shipped', 'delivered', 'general'
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
};

const localModel = getLocalModel('Notification', notificationSchemaDefinition);
const schema = new mongoose.Schema(notificationSchemaDefinition, { timestamps: true });
const mongooseModel = mongoose.models.Notification || mongoose.model('Notification', schema);

const NotificationModel = new Proxy(function() {}, {
  construct(target, args) {
    const activeModel = process.env.DB_MODE === 'json' ? localModel : mongooseModel;
    return new activeModel(...args);
  },
  get(target, prop) {
    const activeModel = process.env.DB_MODE === 'json' ? localModel : mongooseModel;
    return activeModel[prop];
  }
});

module.exports = NotificationModel;
