const mongoose = require('mongoose');
const { getLocalModel } = require('../utils/localDb');

const recommendationSchemaDefinition = {
  user: { type: String, required: true, default: 'Guest' }, // User ID string or 'Guest'
  age: { type: String, required: true },
  gender: { type: String, required: true },
  lifestyle: { type: String, required: true },
  healthGoals: { type: Array, default: [] },
  dietaryPreference: { type: String, required: true },
  sugarPreference: { type: String, required: true },
  recommendedProducts: { type: Array, default: [] }, // Array of Product ID strings
  convertedProducts: { type: Array, default: [] }, // Array of Product IDs added to cart
  createdAt: { type: Date, default: Date.now }
};

const localModel = getLocalModel('Recommendation', recommendationSchemaDefinition);
const schema = new mongoose.Schema(recommendationSchemaDefinition, { timestamps: true });
const mongooseModel = mongoose.models.Recommendation || mongoose.model('Recommendation', schema);

const RecommendationModel = new Proxy(function() {}, {
  construct(target, args) {
    const activeModel = process.env.DB_MODE === 'json' ? localModel : mongooseModel;
    return new activeModel(...args);
  },
  get(target, prop) {
    const activeModel = process.env.DB_MODE === 'json' ? localModel : mongooseModel;
    return activeModel[prop];
  }
});

module.exports = RecommendationModel;
