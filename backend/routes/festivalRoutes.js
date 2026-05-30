const express = require('express');
const router = express.Router();
const Festival = require('../models/Festival');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Get active or next upcoming festival campaign
// @route   GET /api/festivals/active
// @access  Public
router.get('/active', async (req, res) => {
  try {
    const festivals = await Festival.find({});
    const now = new Date();
    
    // Sort festivals so we evaluate consistently
    festivals.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    
    // Find currently active campaign
    const activeFestival = festivals.find(f => {
      const start = new Date(f.startDate);
      const end = new Date(f.endDate);
      return start <= now && end >= now;
    });

    if (activeFestival) {
      return res.json({ activeFestival, upcomingFestival: null });
    }

    // Find next upcoming campaign
    const upcomingFestival = festivals
      .filter(f => new Date(f.startDate) > now)
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))[0] || null;

    res.json({ activeFestival: null, upcomingFestival });
  } catch (error) {
    console.error('Active festival fetch error:', error);
    res.status(500).json({ message: 'Error checking active campaigns' });
  }
});

// @desc    Get all campaigns (Admin dashboard / analytics)
// @route   GET /api/festivals
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const festivals = await Festival.find({});
    res.json(festivals);
  } catch (error) {
    console.error('Fetch festivals error:', error);
    res.status(500).json({ message: 'Error fetching campaigns' });
  }
});

// @desc    Get details of a specific campaign by key & increment views
// @route   GET /api/festivals/key/:key
// @access  Public
router.get('/key/:key', async (req, res) => {
  try {
    const festival = await Festival.findOne({ key: req.params.key });
    
    if (festival) {
      // Increment views count
      const analytics = festival.analytics || { views: 0, revenue: 0, orderCount: 0, conversions: 0 };
      analytics.views = (analytics.views || 0) + 1;
      
      await Festival.findByIdAndUpdate(festival._id, { analytics });
      res.json(festival);
    } else {
      res.status(404).json({ message: 'Campaign not found' });
    }
  } catch (error) {
    console.error('Get festival by key error:', error);
    res.status(500).json({ message: 'Error fetching campaign details' });
  }
});

// @desc    Create a new campaign
// @route   POST /api/festivals
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  const { name, key, description, startDate, endDate, bannerImage, theme, featuredProducts, offers, giftBoxes } = req.body;

  try {
    const exists = await Festival.findOne({ key });
    if (exists) {
      return res.status(400).json({ message: 'Campaign with this key already exists' });
    }

    const festival = await Festival.create({
      name,
      key,
      description,
      startDate,
      endDate,
      bannerImage,
      theme,
      featuredProducts: featuredProducts || [],
      offers: offers || [],
      giftBoxes: giftBoxes || [],
      analytics: { revenue: 0, orderCount: 0, views: 0, conversions: 0 }
    });

    res.status(201).json(festival);
  } catch (error) {
    console.error('Create festival error:', error);
    res.status(500).json({ message: 'Error creating campaign' });
  }
});

// @desc    Update a campaign
// @route   PUT /api/festivals/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  const { name, key, description, startDate, endDate, bannerImage, theme, featuredProducts, offers, giftBoxes, analytics } = req.body;

  try {
    const festival = await Festival.findById(req.params.id);
    if (!festival) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    const updated = await Festival.findByIdAndUpdate(req.params.id, {
      name: name || festival.name,
      key: key || festival.key,
      description: description || festival.description,
      startDate: startDate || festival.startDate,
      endDate: endDate || festival.endDate,
      bannerImage: bannerImage || festival.bannerImage,
      theme: theme || festival.theme,
      featuredProducts: featuredProducts !== undefined ? featuredProducts : festival.featuredProducts,
      offers: offers !== undefined ? offers : festival.offers,
      giftBoxes: giftBoxes !== undefined ? giftBoxes : festival.giftBoxes,
      analytics: analytics !== undefined ? analytics : festival.analytics
    }, { new: true });

    res.json(updated);
  } catch (error) {
    console.error('Update festival error:', error);
    res.status(500).json({ message: 'Error updating campaign' });
  }
});

// @desc    Delete a campaign
// @route   DELETE /api/festivals/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const festival = await Festival.findById(req.params.id);
    if (!festival) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    await Festival.findByIdAndDelete(req.params.id);
    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Delete festival error:', error);
    res.status(500).json({ message: 'Error deleting campaign' });
  }
});

// @desc    AI Recommendation Engine for Festival Gifting & Party Planning
// @route   POST /api/festivals/recommend
// @access  Public
router.post('/recommend', async (req, res) => {
  const { festivalKey, budget, peopleCount, purpose } = req.body;
  const targetBudget = Number(budget || 1000);
  const targetPeople = Number(peopleCount || 2);

  try {
    const products = await Product.find({});
    const festivals = await Festival.find({});
    
    // Find active or specified festival
    let selectedFestival = festivals.find(f => f.key === festivalKey);
    if (!selectedFestival) {
      const now = new Date();
      selectedFestival = festivals.find(f => new Date(f.startDate) <= now && new Date(f.endDate) >= now) || festivals[0];
    }

    // Determine target categories based on campaign
    let primaryCategories = [];
    if (selectedFestival) {
      const key = selectedFestival.key;
      if (key.includes('ganesh')) {
        primaryCategories = ['modak'];
      } else if (key.includes('mango')) {
        primaryCategories = ['mango'];
      } else if (key.includes('winter') || key.includes('diwali')) {
        primaryCategories = ['amla', 'modak', 'fruit-jam'];
      } else {
        primaryCategories = ['modak', 'amla', 'mango', 'fruit-jam'];
      }
    }

    // Filter available products
    const matchingProducts = products.filter(p => p.stock > 0);
    
    // Prioritize products in primary category
    const prioritized = matchingProducts.filter(p => primaryCategories.includes(p.category));
    const secondary = matchingProducts.filter(p => !primaryCategories.includes(p.category));
    const sortedCatalog = [...prioritized, ...secondary];

    // Check for gift box within budget
    let recommendedGiftBox = null;
    if (selectedFestival && selectedFestival.giftBoxes && selectedFestival.giftBoxes.length > 0) {
      // Find a gift box matching the budget
      const fits = selectedFestival.giftBoxes.filter(box => box.price <= targetBudget);
      if (fits.length > 0) {
        // Recommend the highest priced box that still fits the budget
        fits.sort((a, b) => b.price - a.price);
        recommendedGiftBox = fits[0];
      }
    }

    // Calculate a combination of individual products that fits the remaining budget
    let remainingBudget = targetBudget;
    if (recommendedGiftBox) {
      remainingBudget -= recommendedGiftBox.price;
    }

    const suggestedItems = [];
    let accumulatedTotal = 0;

    for (const prod of sortedCatalog) {
      if (prod.price <= remainingBudget && (accumulatedTotal + prod.price) <= remainingBudget) {
        suggestedItems.push({
          _id: prod._id,
          name: prod.name,
          price: prod.price,
          category: prod.category,
          image: prod.image,
          weight: prod.weight
        });
        accumulatedTotal += prod.price;
      }
    }

    const finalTotal = (recommendedGiftBox ? recommendedGiftBox.price : 0) + accumulatedTotal;
    const savings = targetBudget - finalTotal;

    // AI Narrative generation
    let rationale = '';
    switch (purpose) {
      case 'Family Celebration':
        rationale = `This bundle is perfectly scaled for a family of ${targetPeople}. We prioritized our traditional sweets and wellness juices so that children and elders alike can participate in the festivities with clean, healthy options.`;
        break;
      case 'Corporate Gift':
        rationale = `An executive-level corporate presentation pack. Combining premium gift packaging with high-grade organic treats makes this an impactful token of appreciation for professional partners.`;
        break;
      case 'Personal Use':
        rationale = `A curated personal indulgence selection. Enjoy the pure tastes of the season from the comfort of your home, perfectly structured within your ₹${targetBudget} budget limit.`;
        break;
      case 'Friends & Relatives':
        rationale = `Spread seasonal cheer! This combination offers an assortment of delicious treats, complete with greeting card attachments, ready to surprise your friends and relatives.`;
        break;
      default:
        rationale = `A balanced festive selection. Combining rich traditional options and immune-boosting wellness snacks, customized for a group of ${targetPeople}.`;
    }

    // Trigger conversion tracker increment on the campaign
    if (selectedFestival) {
      const analytics = selectedFestival.analytics || { views: 0, revenue: 0, orderCount: 0, conversions: 0 };
      analytics.conversions = (analytics.conversions || 0) + 1;
      await Festival.findByIdAndUpdate(selectedFestival._id, { analytics });
    }

    res.json({
      festivalName: selectedFestival ? selectedFestival.name : 'Seasonal Special',
      budget: targetBudget,
      finalTotal,
      savings,
      recommendedGiftBox,
      recommendedProducts: suggestedItems,
      rationale
    });
  } catch (error) {
    console.error('AI Recommendation fetch error:', error);
    res.status(500).json({ message: 'Error generating health/gift recommendations' });
  }
});

module.exports = router;
