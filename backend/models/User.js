const mongoose = require('mongoose');
const { getLocalModel } = require('../utils/localDb');

const userSchemaDefinition = {
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, default: 'customer' },
  wishlist: { type: Array, default: [] },
  wellnessPoints: { type: Number, default: 0 },
  badges: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now }
};

const localModel = getLocalModel('User', userSchemaDefinition);
const schema = new mongoose.Schema(userSchemaDefinition, { timestamps: true });
const mongooseModel = mongoose.models.User || mongoose.model('User', schema);

const UserModel = new Proxy(function() {}, {
  construct(target, args) {
    const activeModel = process.env.DB_MODE === 'json' ? localModel : mongooseModel;
    return new activeModel(...args);
  },
  get(target, prop) {
    const activeModel = process.env.DB_MODE === 'json' ? localModel : mongooseModel;
    return activeModel[prop];
  }
});

module.exports = UserModel;
