const mongoose = require('mongoose');
const { getLocalModel } = require('../utils/localDb');

const subscriptionSchemaDefinition = {
  user: { type: String, required: true }, // User ID string
  planId: { type: String, required: true }, // planId (e.g. 'immunity', 'custom')
  planName: { type: String, required: true },
  price: { type: Number, required: true },
  status: { type: String, required: true, default: 'Active' }, // 'Active', 'Paused', 'Cancelled'
  deliveryAddress: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, default: 'India' }
  },
  products: { type: Array, default: [] }, // items included (e.g. [{ name, qty }])
  nextDeliveryDate: { type: String, required: true },
  renewalDate: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
};

const localModel = getLocalModel('Subscription', subscriptionSchemaDefinition);
const schema = new mongoose.Schema(subscriptionSchemaDefinition, { timestamps: true });
const mongooseModel = mongoose.models.Subscription || mongoose.model('Subscription', schema);

const SubscriptionModel = new Proxy(function() {}, {
  construct(target, args) {
    const activeModel = process.env.DB_MODE === 'json' ? localModel : mongooseModel;
    return new activeModel(...args);
  },
  get(target, prop) {
    const activeModel = process.env.DB_MODE === 'json' ? localModel : mongooseModel;
    return activeModel[prop];
  }
});

module.exports = SubscriptionModel;
