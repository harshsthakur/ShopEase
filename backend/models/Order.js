const mongoose = require('mongoose');
const { getLocalModel } = require('../utils/localDb');

const orderSchemaDefinition = {
  user: { type: String, required: true }, // User ID reference
  orderItems: { type: Array, required: true }, // [{ product, name, qty, image, price }]
  shippingAddress: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  paymentMethod: { type: String, required: true, default: 'Credit Card' },
  totalPrice: { type: Number, required: true, default: 0.0 },
  isPaid: { type: Boolean, required: true, default: true }, // Automatic payment since it is a simulator
  paidAt: { type: Date, default: Date.now },
  isDelivered: { type: Boolean, required: true, default: false },
  deliveredAt: { type: Date },
  status: { type: String, required: true, default: 'Order Placed' }, // Order Placed, Processing, Packed, Shipped, Delivered
  giftDetails: {
    isGift: { type: Boolean, default: false },
    recipientName: { type: String },
    recipientPhone: { type: String },
    deliveryAddress: { type: String },
    giftMessage: { type: String },
    deliveryDate: { type: String },
    giftWrapping: { type: Boolean, default: false },
    greetingCard: { type: Boolean, default: false }
  },
  campaignKey: { type: String },
  createdAt: { type: Date, default: Date.now }
};

const localModel = getLocalModel('Order', orderSchemaDefinition);
const schema = new mongoose.Schema(orderSchemaDefinition, { timestamps: true });
const mongooseModel = mongoose.models.Order || mongoose.model('Order', schema);

const OrderModel = new Proxy(function() {}, {
  construct(target, args) {
    const activeModel = process.env.DB_MODE === 'json' ? localModel : mongooseModel;
    return new activeModel(...args);
  },
  get(target, prop) {
    const activeModel = process.env.DB_MODE === 'json' ? localModel : mongooseModel;
    return activeModel[prop];
  }
});

module.exports = OrderModel;
