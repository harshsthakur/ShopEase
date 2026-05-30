const mongoose = require('mongoose');
const { getLocalModel } = require('../utils/localDb');

const subscriptionPlanSchemaDefinition = {
  planId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  includes: { type: Array, default: [] },
  benefits: { type: Array, default: [] },
  isActive: { type: Boolean, default: true },
  color: { type: String, default: 'slate' },
  image: { type: String, default: '' }
};

const localModel = getLocalModel('SubscriptionPlan', subscriptionPlanSchemaDefinition);
const schema = new mongoose.Schema(subscriptionPlanSchemaDefinition, { timestamps: true });
const mongooseModel = mongoose.models.SubscriptionPlan || mongoose.model('SubscriptionPlan', schema);

const SubscriptionPlanModel = new Proxy(function() {}, {
  construct(target, args) {
    const activeModel = process.env.DB_MODE === 'json' ? localModel : mongooseModel;
    return new activeModel(...args);
  },
  get(target, prop) {
    const activeModel = process.env.DB_MODE === 'json' ? localModel : mongooseModel;
    return activeModel[prop];
  }
});

module.exports = SubscriptionPlanModel;
