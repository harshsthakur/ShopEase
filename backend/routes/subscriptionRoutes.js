const express = require('express');
const router = express.Router();
const SubscriptionPlan = require('../models/SubscriptionPlan');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect, admin } = require('../middleware/authMiddleware');

// Helper to auto-seed default subscription plans if empty
const seedDefaultPlans = async () => {
  try {
    const count = await SubscriptionPlan.countDocuments({});
    if (count === 0) {
      const defaultPlans = [
        {
          planId: 'immunity-booster',
          name: 'Immunity Booster Box',
          price: 499,
          includes: ['Amla Juice', 'Amla Candy', 'Amla Powder', 'Seasonal Health Product'],
          benefits: ['Rich in Vitamin C', 'Supports Immunity', 'Daily Wellness'],
          isActive: true,
          color: 'emerald',
          image: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=600&q=80'
        },
        {
          planId: 'mango-lover',
          name: 'Mango Lover Box',
          price: 699,
          includes: ['Alphonso Mango Products', 'Mango Pulp', 'Mango Jam', 'Seasonal Mango Special'],
          benefits: ['Seasonal Freshness', 'Premium Mango Collection'],
          isActive: true,
          color: 'amber',
          image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80'
        },
        {
          planId: 'traditional-modak',
          name: 'Traditional Modak Box',
          price: 599,
          includes: ['Ukadiche Modak', 'Dry Fruit Modak', 'Chocolate Modak', 'Festival Special Item'],
          benefits: ['Traditional Taste', 'Festival Collection'],
          isActive: true,
          color: 'orange',
          image: 'https://images.unsplash.com/photo-1605197585662-763f96f0bfbb?auto=format&fit=crop&w=600&q=80'
        },
        {
          planId: 'family-combo',
          name: 'Family Combo Box',
          price: 999,
          includes: ['Amla Products', 'Mango Products', 'Fruit Jam', 'Modak Collection'],
          benefits: ['Best Value', 'Family Pack'],
          isActive: true,
          color: 'rose',
          image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'
        }
      ];

      for (const plan of defaultPlans) {
        await SubscriptionPlan.create(plan);
      }
      console.log('✅ Default Subscription Plans seeded.');
    }
  } catch (error) {
    console.error('Seeding plans failed:', error);
  }
};

// Seed after a short delay to allow connectDB fallback logic to complete
setTimeout(seedDefaultPlans, 3000);

/* ==========================================================================
   SUBSCRIPTION PLANS (PUBLIC / ADMIN)
   ========================================================================== */

// @desc    Get all subscription plans
// @route   GET /api/subscriptions/plans
router.get('/plans', async (req, res) => {
  try {
    await seedDefaultPlans();
    const plans = await SubscriptionPlan.find({});
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching plans' });
  }
});

// @desc    Create subscription plan (Admin)
// @route   POST /api/subscriptions/plans
router.post('/plans', protect, admin, async (req, res) => {
  const { name, price, includes, benefits, color, image } = req.body;
  const planId = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  try {
    const planExists = await SubscriptionPlan.findOne({ planId });
    if (planExists) {
      return res.status(400).json({ message: 'Plan with this name already exists' });
    }

    const plan = await SubscriptionPlan.create({
      planId,
      name,
      price: Number(price),
      includes: Array.isArray(includes) ? includes : includes.split(',').map(i => i.trim()),
      benefits: Array.isArray(benefits) ? benefits : benefits.split(',').map(b => b.trim()),
      isActive: true,
      color: color || 'emerald',
      image: image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'
    });

    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ message: 'Error creating plan' });
  }
});

// @desc    Edit subscription plan (Admin)
// @route   PUT /api/subscriptions/plans/:id
router.put('/plans/:id', protect, admin, async (req, res) => {
  const { name, price, includes, benefits, color, image, isActive } = req.body;

  try {
    const plan = await SubscriptionPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    const updateData = {
      name: name || plan.name,
      price: price !== undefined ? Number(price) : plan.price,
      includes: includes ? (Array.isArray(includes) ? includes : includes.split(',').map(i => i.trim())) : plan.includes,
      benefits: benefits ? (Array.isArray(benefits) ? benefits : benefits.split(',').map(b => b.trim())) : plan.benefits,
      color: color || plan.color,
      image: image || plan.image,
      isActive: isActive !== undefined ? isActive : plan.isActive
    };

    const updated = await SubscriptionPlan.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating plan' });
  }
});

// @desc    Delete subscription plan (Admin)
// @route   DELETE /api/subscriptions/plans/:id
router.delete('/plans/:id', protect, admin, async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    await SubscriptionPlan.findByIdAndDelete(req.params.id);
    res.json({ message: 'Plan deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting plan' });
  }
});

// @desc    Toggle plan active status (Admin)
// @route   PATCH /api/subscriptions/plans/:id/status
router.patch('/plans/:id/status', protect, admin, async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    plan.isActive = !plan.isActive;
    if (process.env.DB_MODE === 'json') {
      await SubscriptionPlan.findByIdAndUpdate(req.params.id, { isActive: plan.isActive });
    } else {
      await plan.save();
    }

    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: 'Error toggling plan status' });
  }
});


/* ==========================================================================
   CUSTOMER SUBSCRIPTION TRANSACTIONS
   ========================================================================== */

// @desc    Get user's subscriptions
// @route   GET /api/subscriptions/my
router.get('/my', protect, async (req, res) => {
  try {
    const subs = await Subscription.find({ user: req.user._id.toString() });
    res.json(subs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subscriptions' });
  }
});

// @desc    Subscribe to a plan
// @route   POST /api/subscriptions/subscribe
router.post('/subscribe', protect, async (req, res) => {
  const { planId, planName, price, deliveryAddress, products } = req.body;

  try {
    // Generate delivery and renewal dates (30 days from now)
    const now = new Date();
    const nextDelivery = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days later
    const nextRenewal = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days later

    const sub = await Subscription.create({
      user: req.user._id.toString(),
      planId,
      planName,
      price: Number(price),
      status: 'Active',
      deliveryAddress,
      products: products || [],
      nextDeliveryDate: nextDelivery.toISOString().split('T')[0],
      renewalDate: nextRenewal.toISOString().split('T')[0]
    });

    // Notify customer
    await Notification.create({
      user: req.user._id.toString(),
      message: `Subscription created successfully! Your first ${planName} will be prepared for delivery by ${nextDelivery.toISOString().split('T')[0]}.`,
      type: 'general'
    });

    res.status(201).json(sub);
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ message: 'Error processing subscription purchase' });
  }
});

// @desc    Pause subscription
// @route   POST /api/subscriptions/:id/pause
router.post('/:id/pause', protect, async (req, res) => {
  try {
    const sub = await Subscription.findById(req.params.id);
    if (!sub) return res.status(404).json({ message: 'Subscription not found' });
    if (sub.user !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updated = await Subscription.findByIdAndUpdate(req.params.id, { status: 'Paused' }, { new: true });

    await Notification.create({
      user: sub.user,
      message: `Your ${sub.planName} subscription has been paused. We won't ship new deliveries until you resume.`,
      type: 'general'
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error pausing subscription' });
  }
});

// @desc    Resume subscription
// @route   POST /api/subscriptions/:id/resume
router.post('/:id/resume', protect, async (req, res) => {
  try {
    const sub = await Subscription.findById(req.params.id);
    if (!sub) return res.status(404).json({ message: 'Subscription not found' });
    if (sub.user !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updated = await Subscription.findByIdAndUpdate(req.params.id, { status: 'Active' }, { new: true });

    await Notification.create({
      user: sub.user,
      message: `Welcome back! Your ${sub.planName} subscription is active again.`,
      type: 'general'
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error resuming subscription' });
  }
});

// @desc    Cancel subscription
// @route   POST /api/subscriptions/:id/cancel
router.post('/:id/cancel', protect, async (req, res) => {
  try {
    const sub = await Subscription.findById(req.params.id);
    if (!sub) return res.status(404).json({ message: 'Subscription not found' });
    if (sub.user !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updated = await Subscription.findByIdAndUpdate(req.params.id, { status: 'Cancelled' }, { new: true });

    await Notification.create({
      user: sub.user,
      message: `Your ${sub.planName} subscription has been cancelled. Thank you for being a member!`,
      type: 'general'
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling subscription' });
  }
});

// @desc    Change subscription shipping address
// @route   PUT /api/subscriptions/:id/address
router.put('/:id/address', protect, async (req, res) => {
  const { name, phone, address, city, postalCode, country } = req.body;

  try {
    const sub = await Subscription.findById(req.params.id);
    if (!sub) return res.status(404).json({ message: 'Subscription not found' });
    if (sub.user !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updated = await Subscription.findByIdAndUpdate(req.params.id, {
      deliveryAddress: { name, phone, address, city, postalCode, country: country || 'India' }
    }, { new: true });

    await Notification.create({
      user: sub.user,
      message: `Shipping address for your ${sub.planName} box was updated successfully.`,
      type: 'general'
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error changing address' });
  }
});

// @desc    Upgrade or Downgrade subscription plan
// @route   PUT /api/subscriptions/:id/change-plan
router.put('/:id/change-plan', protect, async (req, res) => {
  const { newPlanId, newPlanName, newPrice, newProducts } = req.body;

  try {
    const sub = await Subscription.findById(req.params.id);
    if (!sub) return res.status(404).json({ message: 'Subscription not found' });
    if (sub.user !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updated = await Subscription.findByIdAndUpdate(req.params.id, {
      planId: newPlanId,
      planName: newPlanName,
      price: Number(newPrice),
      products: newProducts || []
    }, { new: true });

    await Notification.create({
      user: sub.user,
      message: `Your subscription was successfully changed to ${newPlanName} (₹${newPrice}/month).`,
      type: 'general'
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error modifying plan' });
  }
});


// @desc    Simulate monthly renewal of subscription
// @route   POST /api/subscriptions/:id/renew-simulate
router.post('/:id/renew-simulate', protect, async (req, res) => {
  try {
    const sub = await Subscription.findById(req.params.id);
    if (!sub) return res.status(404).json({ message: 'Subscription not found' });

    // 1. Advance dates by 30 days
    const nextRenewal = new Date(new Date(sub.renewalDate).getTime() + 30 * 24 * 60 * 60 * 1000);
    const nextDelivery = new Date(new Date(sub.nextDeliveryDate).getTime() + 30 * 24 * 60 * 60 * 1000);

    const updatedSub = await Subscription.findByIdAndUpdate(req.params.id, {
      renewalDate: nextRenewal.toISOString().split('T')[0],
      nextDeliveryDate: nextDelivery.toISOString().split('T')[0]
    }, { new: true });

    // 2. Add 50 Wellness Points to User
    const user = await User.findById(sub.user);
    if (user) {
      const updatedPoints = (user.wellnessPoints || 0) + 50;
      await User.findByIdAndUpdate(sub.user, { wellnessPoints: updatedPoints });
    }

    // 3. Create Renewal Success Notification
    await Notification.create({
      user: sub.user,
      message: `Renewal Successful! Your ${sub.planName} has renewed for ₹${sub.price}. You earned 50 Wellness Points!`,
      type: 'renewal_success'
    });

    // 4. Create Pre-renewal notification mock (alert 3 days before next renewal)
    const alertDate = new Date(nextRenewal.getTime() - 3 * 24 * 60 * 60 * 1000);
    await Notification.create({
      user: sub.user,
      message: `Renewal Alert: Your ${sub.planName} subscription will automatically renew on ${nextRenewal.toISOString().split('T')[0]}.`,
      type: 'renewal_alert',
      createdAt: alertDate
    });

    res.json({ subscription: updatedSub, pointsEarned: 50 });
  } catch (error) {
    console.error('Renewal simulation failed:', error);
    res.status(500).json({ message: 'Simulation failed' });
  }
});


// @desc    Redeem wellness points
// @route   POST /api/subscriptions/redeem-points
router.post('/redeem-points', protect, async (req, res) => {
  const { rewardType, cost } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const currentPoints = user.wellnessPoints || 0;
    if (currentPoints < cost) {
      return res.status(400).json({ message: 'Insufficient wellness points' });
    }

    const code = rewardType.toUpperCase().replace(/\s+/g, '') + '-' + Math.floor(100000 + Math.random() * 900000);

    const updatedPoints = currentPoints - cost;
    await User.findByIdAndUpdate(req.user._id, { wellnessPoints: updatedPoints });

    await Notification.create({
      user: req.user._id.toString(),
      message: `Successfully redeemed ${cost} points for: ${rewardType}. Claim Code: ${code}`,
      type: 'general'
    });

    res.json({ success: true, newPoints: updatedPoints, code });
  } catch (error) {
    res.status(500).json({ message: 'Points redemption failed' });
  }
});


// @desc    Get user notifications
// @route   GET /api/subscriptions/notifications
router.get('/notifications', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id.toString() });
    res.json(notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});


/* ==========================================================================
   ADMIN SUBSCRIPTION DASHBOARD LOGIC
   ========================================================================== */

// @desc    Get all system subscribers (Admin)
// @route   GET /api/subscriptions/admin/list
router.get('/admin/list', protect, admin, async (req, res) => {
  try {
    const subs = await Subscription.find({});
    // Hydrate subscriber details with User email / name
    const hydrated = [];
    for (const sub of subs) {
      const u = await User.findById(sub.user);
      hydrated.push({
        ...sub.toObject ? sub.toObject() : sub,
        userEmail: u ? u.email : 'Unknown User',
        userName: u ? u.name : 'Unknown User'
      });
    }
    res.json(hydrated);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subscription list' });
  }
});

// @desc    Get dashboard metrics analytics (Admin)
// @route   GET /api/subscriptions/admin/analytics
router.get('/admin/analytics', protect, admin, async (req, res) => {
  try {
    const subs = await Subscription.find({});
    
    const activeSubscribers = subs.filter(s => s.status === 'Active');
    const totalSubscriptions = subs.length;
    const mrr = activeSubscribers.reduce((acc, s) => acc + s.price, 0);
    
    res.json({
      activeSubscribers: activeSubscribers.length,
      monthlyRecurringRevenue: mrr,
      totalSubscriptions,
      growthRate: '+14.6%'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error loading analytics stats' });
  }
});

// @desc    Manage subscriber deliveries (Admin)
// @route   PUT /api/subscriptions/admin/:id/delivery
router.put('/admin/:id/delivery', protect, admin, async (req, res) => {
  const { deliveryStatus } = req.body; // 'Shipped' or 'Delivered'

  try {
    const sub = await Subscription.findById(req.params.id);
    if (!sub) return res.status(404).json({ message: 'Subscription not found' });

    if (deliveryStatus === 'Shipped') {
      await Notification.create({
        user: sub.user,
        message: `Exciting news! Your monthly ${sub.planName} box has been shipped and is on its way.`,
        type: 'shipped'
      });
    } else if (deliveryStatus === 'Delivered') {
      // 1. Advance next delivery date by 30 days
      const now = new Date(sub.nextDeliveryDate || new Date());
      const nextDelivery = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      await Subscription.findByIdAndUpdate(req.params.id, {
        nextDeliveryDate: nextDelivery.toISOString().split('T')[0]
      });

      // 2. Notify delivery
      await Notification.create({
        user: sub.user,
        message: `Your monthly ${sub.planName} box was successfully delivered. Enjoy!`,
        type: 'delivered'
      });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error updating delivery state' });
  }
});

module.exports = router;
