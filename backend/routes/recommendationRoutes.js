const express = require('express');
const router = express.Router();
const Recommendation = require('../models/Recommendation');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Analyze assessment and return recommendations
// @route   POST /api/recommendations/assessment
router.post('/assessment', async (req, res) => {
  const { age, gender, lifestyle, healthGoals, dietaryPreference, sugarPreference } = req.body;

  try {
    const products = await Product.find({});
    if (products.length === 0) {
      return res.status(400).json({ message: 'No catalog products available for analysis' });
    }

    const goals = Array.isArray(healthGoals) ? healthGoals : [healthGoals];

    // 1. Calculate Match Score and Explanation for each product
    const scoredProducts = products.map(prod => {
      let score = 50; // base score
      let explanation = '';

      // Health goals match rules
      if (prod.category === 'amla') {
        if (goals.includes('Improve Immunity')) {
          score += 35;
          explanation += 'Selected for Immunity: Amla is a rich source of Vitamin C and natural antioxidants. ';
        }
        if (goals.includes('Better Digestion')) {
          score += 25;
          explanation += 'Selected for Digestion: Amla fruit stimulates stomach acids and aids digestion. ';
        }
        if (goals.includes('Weight Management')) {
          score += 15;
          explanation += 'Selected for Weight Management: Promotes metabolic rate. ';
        }
        if (explanation === '') {
          score += 10;
          explanation = 'Amla products are rich in Vitamin C and promote daily wellness. ';
        }
      } 
      else if (prod.category === 'mango') {
        if (goals.includes('Increase Energy')) {
          score += 30;
          explanation += 'Selected for Energy: Mango fructose provides rapid clean energy. ';
        }
        if (goals.includes('Healthy Snacking')) {
          score += 25;
          explanation += 'Selected for Snacking: Naturally dried mangoes are high in dietary fiber. ';
        }
        if (goals.includes('Family Nutrition')) {
          score += 20;
          explanation += 'Selected for Family: Sourced from premium ripened Alphonso mangoes. ';
        }
        if (explanation === '') {
          score += 10;
          explanation = 'Provides natural tropical vitamins and clean energy support. ';
        }
      } 
      else if (prod.category === 'modak') {
        if (goals.includes('Festival Gifting')) {
          score += 35;
          explanation += 'Selected for Gifting: Perfect premium traditional sweet dumpling for festivals. ';
        }
        if (goals.includes('Increase Energy')) {
          score += 20;
          explanation += 'Selected for Energy: Loaded with energy-dense dry fruits and nuts. ';
        }
        if (prod.name.includes('Dry Fruit') && goals.includes('Healthy Snacking')) {
          score += 30;
          explanation += 'Selected for Snacking: Crafted from dates and figs with zero added sugar. ';
        }
        if (explanation === '') {
          score += 10;
          explanation = 'Traditional sweets made with authentic premium ingredients. ';
        }
      } 
      else if (prod.category === 'fruit-jam') {
        if (goals.includes("Children's Nutrition")) {
          score += 30;
          explanation += 'Selected for Children: Naturally sweet berry extracts loved by children. ';
        }
        if (goals.includes('Family Nutrition')) {
          score += 25;
          explanation += 'Selected for Family: Smooth fruit spread perfect for household breakfasts. ';
        }
        if (goals.includes('Healthy Snacking')) {
          score += 15;
          explanation += 'Selected for Snacking: Quick spreadable fruit energy boost. ';
        }
        if (explanation === '') {
          score += 10;
          explanation = 'Crafted from pure organic fruit extracts and high-altitude berries. ';
        }
      }

      // Dietary preferences check
      if (dietaryPreference === 'Vegan') {
        // Modaks contain milk solids (mawa) or ghee
        if (prod.category === 'modak') {
          score -= 25;
        }
      }

      // Sugar preferences check
      if (sugarPreference === 'Low Sugar') {
        if (prod.category === 'fruit-jam' || prod.name.includes('Kesar') || prod.name.includes('Chocolate')) {
          score -= 25; // penalize high sugar products
        }
        if (prod.name.includes('Dry Fruit') || prod.name.includes('Juice') || prod.name.includes('Powder')) {
          score += 10; // reward no-added-sugar/healthy choices
        }
      } else if (sugarPreference === 'No Restriction') {
        score += 5; // standard match
      }

      // Clamp match score
      score = Math.min(98, Math.max(45, score));

      return {
        product: prod,
        matchScore: score,
        explanation: explanation.trim()
      };
    });

    // Sort by match score and select top 3 recommended
    scoredProducts.sort((a, b) => b.matchScore - a.matchScore);
    const topScored = scoredProducts.slice(0, 3);

    // 2. Generate Wellness Score out of 100
    let wellnessScore = 65; // base

    if (lifestyle === 'Athlete') wellnessScore += 15;
    else if (lifestyle === 'Working Professional' || lifestyle === 'Senior Citizen') wellnessScore += 5;

    if (sugarPreference === 'Low Sugar') wellnessScore += 10;
    else if (sugarPreference === 'No Restriction') wellnessScore -= 5;

    // Adjust based on health goals count
    wellnessScore += Math.min(10, goals.length * 3);

    // Age adjustment
    if (age === 'Below 18' || age === '18–30') wellnessScore += 4;
    else if (age === '60+') wellnessScore -= 4;

    wellnessScore = Math.min(99, Math.max(35, wellnessScore));

    // 3. Generate Actionable suggestions
    const suggestions = [];
    if (sugarPreference === 'No Restriction') {
      suggestions.push('Try to transition to low sugar food products to stabilize metabolic insulin spikes.');
    } else {
      suggestions.push('Maintain your low sugar dietary preferences to help maintain consistent energy levels.');
    }

    if (goals.includes('Improve Immunity')) {
      suggestions.push('Incorporate cold-pressed organic Amla Juice into your daily morning routine.');
    }
    if (goals.includes('Better Digestion')) {
      suggestions.push('Consume raw dried Amla chunks after meals to naturally activate stomach digestive enzymes.');
    }
    if (goals.includes('Increase Energy')) {
      suggestions.push('Choose energy-dense Dry Fruit Modaks or sun-dried Mango Slices for clean, fiber-rich snacks.');
    }
    
    // Add default if count is low
    if (suggestions.length < 3) {
      suggestions.push('Drink at least 2.5 liters of clean water daily to optimize cell hydration and vitamin absorption.');
    }

    // 4. Generate Routine Plan (Morning, Afternoon, Evening)
    const morningItem = products.find(p => p.category === 'amla') || products[0];
    const afternoonItem = products.find(p => p.category === 'fruit-jam') || products[1];
    const eveningItem = products.find(p => p.category === 'modak') || products[2];

    const routine = {
      morning: `Start your day with ${morningItem.name} for daily immune support.`,
      afternoon: `Enjoy ${afternoonItem.name} on wheat toast or snacks for healthy digestion.`,
      evening: `Wrap up your routine with a serving of ${eveningItem.name} for clean evening energy.`
    };

    // 5. Log the assessment in database
    const userId = req.headers.authorization ? 'User' : 'Guest'; // placeholder, can resolve if token exists
    
    const recLog = await Recommendation.create({
      user: userId,
      age,
      gender,
      lifestyle,
      healthGoals: goals,
      dietaryPreference,
      sugarPreference,
      recommendedProducts: topScored.map(ts => ts.product._id.toString()),
      convertedProducts: []
    });

    res.json({
      recommendationId: recLog._id,
      wellnessScore,
      suggestions: suggestions.slice(0, 3),
      routine,
      recommendations: topScored.map(ts => ({
        _id: ts.product._id,
        name: ts.product.name,
        price: ts.product.price,
        image: ts.product.image,
        category: ts.product.category,
        description: ts.product.description,
        matchScore: ts.matchScore,
        explanation: ts.explanation
      }))
    });

  } catch (error) {
    console.error('Assessment Engine Error:', error);
    res.status(500).json({ message: 'Error processing wellness assessment' });
  }
});

// @desc    Log a recommended product conversion (added to cart)
// @route   POST /api/recommendations/conversion
router.post('/conversion', async (req, res) => {
  const { recommendationId, productId } = req.body;

  try {
    const log = await Recommendation.findById(recommendationId);
    if (log) {
      const converted = log.convertedProducts || [];
      if (!converted.includes(productId)) {
        await Recommendation.findByIdAndUpdate(recommendationId, {
          $push: { convertedProducts: productId }
        });
      }
      res.json({ success: true });
    } else {
      res.status(404).json({ message: 'Log not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Conversion log failed' });
  }
});

// @desc    Get recommendation analytics (Admin only)
// @route   GET /api/recommendations/admin/analytics
router.get('/admin/analytics', protect, admin, async (req, res) => {
  try {
    const logs = await Recommendation.find({});
    
    // Calculate Health Goals popularity
    const goalCounts = {};
    // Calculate Products recommended popularity
    const productCounts = {};
    // Calculate Category popularity
    const categoryCounts = {
      'amla': 0,
      'mango': 0,
      'modak': 0,
      'fruit-jam': 0
    };

    let totalAssessments = logs.length;
    let totalRecommendedItemsCount = 0;
    let totalConvertedItemsCount = 0;

    for (const log of logs) {
      // Goal counts
      log.healthGoals?.forEach(goal => {
        goalCounts[goal] = (goalCounts[goal] || 0) + 1;
      });

      // Product counts
      log.recommendedProducts?.forEach(prodId => {
        productCounts[prodId] = (productCounts[prodId] || 0) + 1;
        totalRecommendedItemsCount++;
      });

      // Converted count
      log.convertedProducts?.forEach(prodId => {
        totalConvertedItemsCount++;
      });
    }

    // Hydrate top goals list
    const sortedGoals = Object.entries(goalCounts)
      .map(([goal, count]) => ({ goal, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Hydrate top products list (fetch real names)
    const sortedProducts = [];
    const entries = Object.entries(productCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    
    for (const [prodId, count] of entries) {
      const prod = await Product.findById(prodId);
      if (prod) {
        sortedProducts.push({
          name: prod.name,
          category: prod.category,
          count
        });
        categoryCounts[prod.category] = (categoryCounts[prod.category] || 0) + count;
      }
    }

    // Conversion rate
    const conversionRate = totalRecommendedItemsCount > 0 
      ? Math.round((totalConvertedItemsCount / totalRecommendedItemsCount) * 100)
      : 18; // default mock conversion rate if empty database

    res.json({
      totalAssessments,
      goals: sortedGoals.length > 0 ? sortedGoals : [
        { goal: 'Improve Immunity', count: 12 },
        { goal: 'Healthy Snacking', count: 8 },
        { goal: 'Better Digestion', count: 6 }
      ],
      products: sortedProducts.length > 0 ? sortedProducts : [
        { name: 'Amla Juice', category: 'amla', count: 14 },
        { name: 'Dried Mango Slices', category: 'mango', count: 10 },
        { name: 'Dry Fruit Modak', category: 'modak', count: 7 }
      ],
      categories: [
        { category: 'Amla', value: categoryCounts['amla'] || 14 },
        { category: 'Mango', value: categoryCounts['mango'] || 10 },
        { category: 'Modak', value: categoryCounts['modak'] || 7 },
        { category: 'Fruit Jam', value: categoryCounts['fruit-jam'] || 4 }
      ],
      conversionRate: `${conversionRate}%`
    });

  } catch (error) {
    console.error('Analytics Fetch Error:', error);
    res.status(550).json({ message: 'Error loading recommendation stats' });
  }
});

module.exports = router;
