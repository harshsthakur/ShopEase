const mongoose = require('mongoose');
const { getLocalModel } = require('../utils/localDb');

const categorySchemaDefinition = {
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
};

const localModel = getLocalModel('Category', categorySchemaDefinition);
const schema = new mongoose.Schema(categorySchemaDefinition, { timestamps: true });
const mongooseModel = mongoose.models.Category || mongoose.model('Category', schema);

const CategoryModel = new Proxy(function() {}, {
  construct(target, args) {
    const activeModel = process.env.DB_MODE === 'json' ? localModel : mongooseModel;
    return new activeModel(...args);
  },
  get(target, prop) {
    const activeModel = process.env.DB_MODE === 'json' ? localModel : mongooseModel;
    return activeModel[prop];
  }
});

module.exports = CategoryModel;
