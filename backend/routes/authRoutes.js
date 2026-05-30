const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'shopease_secret_jwt_token_2026_super_secure', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  const trimmedEmail = email ? email.trim().toLowerCase() : '';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(trimmedEmail)) {
    return res.status(400).json({ message: 'Please enter a valid email address.' });
  }

  try {
    const userExists = await User.findOne({ email: trimmedEmail });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: trimmedEmail,
      password: hashedPassword,
      role: role || 'customer',
      wishlist: []
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        wishlist: user.wishlist,
        wellnessPoints: user.wellnessPoints || 0,
        badges: user.badges || [],
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const trimmedEmail = email ? email.trim().toLowerCase() : '';

  try {
    const user = await User.findOne({ email: trimmedEmail });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        wishlist: user.wishlist || [],
        wellnessPoints: user.wellnessPoints || 0,
        badges: user.badges || [],
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        wishlist: user.wishlist || [],
        wellnessPoints: user.wellnessPoints || 0,
        badges: user.badges || [],
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// @desc    Update user profile details
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      
      if (req.body.email) {
        const trimmedEmail = req.body.email.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
          return res.status(400).json({ message: 'Please enter a valid email address.' });
        }
        
        const emailExists = await User.findOne({ email: trimmedEmail });
        if (emailExists && emailExists._id.toString() !== user._id.toString()) {
          return res.status(400).json({ message: 'Email address is already in use' });
        }
        
        user.email = trimmedEmail;
      }
      
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        wishlist: updatedUser.wishlist || [],
        wellnessPoints: updatedUser.wellnessPoints || 0,
        badges: updatedUser.badges || [],
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// @desc    Add product to wishlist
// @route   POST /api/auth/wishlist
// @access  Private
router.post('/wishlist', protect, async (req, res) => {
  const { productId } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.wishlist = user.wishlist || [];
    if (!user.wishlist.includes(productId)) {
      if (process.env.DB_MODE === 'json') {
        // In local DB mode, we update using findByIdAndUpdate since instance updates require matching API
        await User.findByIdAndUpdate(user._id, { $push: { wishlist: productId } });
      } else {
        user.wishlist.push(productId);
        await user.save();
      }
      res.status(200).json({ message: 'Added to wishlist', wishlist: [...user.wishlist, productId] });
    } else {
      res.status(400).json({ message: 'Item already in wishlist', wishlist: user.wishlist });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error updating wishlist' });
  }
});

// @desc    Remove product from wishlist
// @route   DELETE /api/auth/wishlist/:id
// @access  Private
router.delete('/wishlist/:id', protect, async (req, res) => {
  const productId = req.params.id;

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.wishlist = user.wishlist || [];
    if (user.wishlist.includes(productId)) {
      if (process.env.DB_MODE === 'json') {
        await User.findByIdAndUpdate(user._id, { $pull: { wishlist: productId } });
      } else {
        user.wishlist = user.wishlist.filter(id => id !== productId);
        await user.save();
      }
      res.status(200).json({ message: 'Removed from wishlist', wishlist: user.wishlist.filter(id => id !== productId) });
    } else {
      res.status(400).json({ message: 'Item not in wishlist', wishlist: user.wishlist });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error updating wishlist' });
  }
});

module.exports = router;
