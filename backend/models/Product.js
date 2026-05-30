const mongoose = require('mongoose');
const { getLocalModel } = require('../utils/localDb');

const productSchemaDefinition = {
  name: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
  description: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  reviews: { type: Array, default: [] },
  ingredients: { type: String, default: '' },
  weight: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
};

const localModel = getLocalModel('Product', productSchemaDefinition);
const schema = new mongoose.Schema(productSchemaDefinition, { timestamps: true });
const mongooseModel = mongoose.models.Product || mongoose.model('Product', schema);

const ProductModel = new Proxy(function() {}, {
  construct(target, args) {
    const activeModel = process.env.DB_MODE === 'json' ? localModel : mongooseModel;
    return new activeModel(...args);
  },
  get(target, prop) {
    const activeModel = process.env.DB_MODE === 'json' ? localModel : mongooseModel;
    return activeModel[prop];
  }
});

module.exports = ProductModel;
