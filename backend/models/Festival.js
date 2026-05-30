const mongoose = require('mongoose');
const { getLocalModel } = require('../utils/localDb');

const festivalSchemaDefinition = {
  name: { type: String, required: true },
  key: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  bannerImage: { type: String, required: true },
  theme: {
    primaryColor: { type: String },
    secondaryColor: { type: String },
    textColor: { type: String },
    bgColor: { type: String },
    borderColor: { type: String },
    badgeBg: { type: String },
    badgeText: { type: String },
    badgeLabel: { type: String }
  },
  featuredProducts: { type: Array, default: [] },
  offers: { type: Array, default: [] },
  giftBoxes: { type: Array, default: [] },
  analytics: {
    revenue: { type: Number, default: 0 },
    orderCount: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now }
};

const localModel = getLocalModel('Festival', festivalSchemaDefinition);
const schema = new mongoose.Schema(festivalSchemaDefinition, { timestamps: true });
const mongooseModel = mongoose.models.Festival || mongoose.model('Festival', schema);

const FestivalModel = new Proxy(function() {}, {
  construct(target, args) {
    const activeModel = process.env.DB_MODE === 'json' ? localModel : mongooseModel;
    return new activeModel(...args);
  },
  get(target, prop) {
    const activeModel = process.env.DB_MODE === 'json' ? localModel : mongooseModel;
    return activeModel[prop];
  }
});

module.exports = FestivalModel;
