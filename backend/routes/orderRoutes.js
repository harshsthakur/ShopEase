const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, async (req, res) => {
  const { orderItems, shippingAddress, totalPrice } = req.body;

  if (orderItems && orderItems.length === 0) {
    return res.status(400).json({ message: 'No order items' });
  }

  try {
    // 1. Validate & update inventory stock levels
    for (const item of orderItems) {
      if (item.isSubscription || (item.product && item.product.startsWith('giftbox-'))) {
        // Skip DB stock check for subscriptions and custom/curated gift boxes
        continue;
      }
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.name} not found` });
      }
      
      const currentStock = Number(product.stock || 0);
      const requestedQty = Number(item.qty || 0);

      if (currentStock < requestedQty) {
        return res.status(400).json({ message: `Insufficient stock for ${item.name}. Available: ${currentStock}` });
      }
      
      // Deduct stock
      const newStock = currentStock - requestedQty;
      await Product.findByIdAndUpdate(item.product, { stock: newStock });
    }

    // 2. Detect active campaign
    const Festival = require('../models/Festival');
    const User = require('../models/User');
    const now = new Date();
    const festivals = await Festival.find({});
    const activeFestival = festivals.find(f => new Date(f.startDate) <= now && new Date(f.endDate) >= now);

    // 3. Create the order record
    const order = await Order.create({
      user: req.user._id.toString(),
      orderItems,
      shippingAddress,
      totalPrice: Number(totalPrice),
      isPaid: true,
      paidAt: new Date().toISOString(),
      status: 'Order Placed',
      giftDetails: req.body.giftDetails,
      campaignKey: activeFestival ? activeFestival.key : undefined
    });

    // 3.5 Create Subscription if order contains subscription items
    const Subscription = require('../models/Subscription');
    const Notification = require('../models/Notification');
    for (const item of orderItems) {
      if (item.isSubscription) {
        const subStartDate = new Date();
        const nextDelivery = new Date(subStartDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days later
        const nextRenewal = new Date(subStartDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days later

        await Subscription.create({
          user: req.user._id.toString(),
          planId: item.planId || item.product,
          planName: item.name,
          price: Number(item.price),
          status: 'Active',
          deliveryAddress: {
            name: shippingAddress.name,
            phone: shippingAddress.phone,
            address: shippingAddress.address,
            city: shippingAddress.city,
            postalCode: shippingAddress.postalCode,
            country: shippingAddress.country || 'India'
          },
          products: item.products || [],
          nextDeliveryDate: nextDelivery.toISOString().split('T')[0],
          renewalDate: nextRenewal.toISOString().split('T')[0]
        });

        // Create notification for the user
        await Notification.create({
          user: req.user._id.toString(),
          message: `Subscription created successfully! Your first ${item.name} will be prepared for delivery by ${nextDelivery.toISOString().split('T')[0]}.`,
          type: 'general'
        });
      }
    }

    // 4. Update campaign analytics
    if (activeFestival) {
      const analytics = activeFestival.analytics || { views: 0, revenue: 0, orderCount: 0, conversions: 0 };
      analytics.orderCount = (analytics.orderCount || 0) + 1;
      analytics.revenue = (analytics.revenue || 0) + Number(totalPrice);
      await Festival.findByIdAndUpdate(activeFestival._id, { analytics });
    }

    // 5. Update achievements / badges
    const user = await User.findById(req.user._id);
    if (user) {
      user.badges = user.badges || [];
      const newBadges = [...user.badges];
      
      if (req.body.giftDetails && req.body.giftDetails.isGift) {
        if (!newBadges.includes('🏅 Festival Gift Master')) {
          newBadges.push('🏅 Festival Gift Master');
        }
      }
      
      const isGaneshActive = activeFestival && activeFestival.key === 'ganesh-chaturthi';
      const boughtModak = orderItems.some(item => 
        item.name.toLowerCase().includes('modak') || 
        item.name.includes('Ganesh Chaturthi Box')
      );
      if (isGaneshActive && boughtModak) {
        if (!newBadges.includes('🏅 Ganesh Chaturthi Shopper')) {
          newBadges.push('🏅 Ganesh Chaturthi Shopper');
        }
      }

      const isMangoActive = activeFestival && activeFestival.key === 'mango-season';
      const boughtMango = orderItems.some(item => 
        item.name.toLowerCase().includes('mango') || 
        item.name.includes('Mango Celebration Box')
      );
      if (isMangoActive && boughtMango) {
        if (!newBadges.includes('🏅 Mango Season Explorer')) {
          newBadges.push('🏅 Mango Season Explorer');
        }
      }

      const boughtWellness = orderItems.some(item => 
        item.name.toLowerCase().includes('amla') || 
        item.name.includes('Diwali Wellness Box')
      );
      if (boughtWellness) {
        if (!newBadges.includes('🏅 Wellness Champion')) {
          newBadges.push('🏅 Wellness Champion');
        }
      }

      if (newBadges.length > user.badges.length) {
        await User.findByIdAndUpdate(user._id, { badges: newBadges });
      }
    }

    res.status(201).json(order);
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({ message: 'Server error processing order' });
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id.toString() });
    res.json(orders);
  } catch (error) {
    console.error('Fetch My Orders Error:', error);
    res.status(500).json({ message: 'Server error fetching your orders' });
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      // Check authorization (must be either the order owner or an admin)
      if (order.user !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to view this order' });
      }
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error('Fetch Order ID Error:', error);
    res.status(500).json({ message: 'Server error fetching order details' });
  }
});

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find({});
    res.json(orders);
  } catch (error) {
    console.error('Fetch All Orders Error:', error);
    res.status(500).json({ message: 'Server error fetching all orders' });
  }
});

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, admin, async (req, res) => {
  const { status } = req.body; // 'Order Placed', 'Processing', 'Packed', 'Shipped', 'Delivered'

  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      const updateData = { status };
      
      if (status === 'Delivered') {
        updateData.isDelivered = true;
        updateData.deliveredAt = new Date().toISOString();
      }

      const updatedOrder = await Order.findByIdAndUpdate(req.params.id, updateData, { new: true });
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error('Update Order Status Error:', error);
    res.status(500).json({ message: 'Server error updating order status' });
  }
});

module.exports = router;
