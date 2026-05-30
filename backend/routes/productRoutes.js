const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = require('../middleware/uploadMiddleware');

// @desc    Fetch all products with filtering, search, and sorting
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
  const { keyword, category, minPrice, maxPrice, minRating, sort } = req.query;
  
  let query = {};

  if (keyword) {
    query.name = new RegExp(keyword, 'i');
  }

  if (category && category !== 'All') {
    query.category = category;
  }

  // Price filtering
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  try {
    let products = await Product.find(query);

    // Convert back from localDb class model instances to plain objects if needed,
    // though both Mongoose and localDb instances support basic properties.
    let productList = products.map(p => {
      const item = typeof p.toObject === 'function' ? p.toObject() : p;
      
      // Calculate average rating dynamically
      const reviews = item.reviews || [];
      const numReviews = reviews.length;
      const rating = numReviews > 0 
        ? parseFloat((reviews.reduce((acc, rev) => acc + Number(rev.rating), 0) / numReviews).toFixed(1))
        : 0;

      // Convert relative image path to full URL
      let image = item.image;
      if (image && image.startsWith('/uploads/')) {
        image = `${req.protocol}://${req.get('host')}${image}`;
      }

      return { ...item, image, rating, numReviews };
    });

    // Rating filtering
    if (minRating) {
      productList = productList.filter(p => p.rating >= Number(minRating));
    }

    // Sorting logic
    if (sort) {
      if (sort === 'price-asc') {
        productList.sort((a, b) => a.price - b.price);
      } else if (sort === 'price-desc') {
        productList.sort((a, b) => b.price - a.price);
      } else if (sort === 'rating') {
        productList.sort((a, b) => b.rating - a.rating);
      } else if (sort === 'newest') {
        productList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
    }

    res.json(productList);
  } catch (error) {
    console.error('Fetch Products Error:', error);
    res.status(500).json({ message: 'Server error fetching products' });
  }
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (product) {
      const item = typeof product.toObject === 'function' ? product.toObject() : product;
      const reviews = item.reviews || [];
      const numReviews = reviews.length;
      const rating = numReviews > 0 
        ? parseFloat((reviews.reduce((acc, rev) => acc + Number(rev.rating), 0) / numReviews).toFixed(1))
        : 0;

      // Convert relative image path to full URL
      let image = item.image;
      if (image && image.startsWith('/uploads/')) {
        image = `${req.protocol}://${req.get('host')}${image}`;
      }

      res.json({ ...item, image, rating, numReviews });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Fetch Product Error:', error);
    res.status(500).json({ message: 'Server error fetching product' });
  }
});

// @desc    Create a product review
// @route   POST /api/products/:id/reviews
// @access  Private
router.post('/:id/reviews', protect, async (req, res) => {
  const { rating, comment } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      const item = typeof product.toObject === 'function' ? product.toObject() : product;
      
      const alreadyReviewed = item.reviews.find(
        (r) => r.user === req.user._id.toString()
      );

      if (alreadyReviewed) {
        return res.status(400).json({ message: 'Product already reviewed' });
      }

      const review = {
        _id: Math.random().toString(36).substring(2, 9),
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id.toString(),
        createdAt: new Date().toISOString(),
      };

      if (process.env.DB_MODE === 'json') {
        await Product.findByIdAndUpdate(req.params.id, { $push: { reviews: review } });
      } else {
        product.reviews.push(review);
        await product.save();
      }

      res.status(201).json({ message: 'Review added successfully' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Create Review Error:', error);
    res.status(500).json({ message: 'Server error creating review' });
  }
});
// @desc    Upload product image (base64 to static disk file)
// @route   POST /api/products/upload
// @access  Private/Admin
router.post('/upload', protect, admin, async (req, res) => {
  const { image } = req.body; // base64 string
  
  if (!image) {
    return res.status(400).json({ message: 'No image data provided' });
  }

  try {
    const fs = require('fs');
    const path = require('path');

    // Matches e.g. "data:image/png;base64,iVBORw0KG..."
    const matches = image.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ message: 'Invalid image format. Must be base64 data URL.' });
    }

    const rawExtension = matches[1].toLowerCase();
    const allowedExtensions = ['jpeg', 'jpg', 'png', 'webp'];
    if (!allowedExtensions.includes(rawExtension)) {
      return res.status(400).json({ message: 'Invalid file type. Only JPG, JPEG, PNG, and WEBP formats are allowed!' });
    }

    const fileExtension = rawExtension === 'jpeg' ? 'jpg' : rawExtension;
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    if (buffer.length > 10 * 1024 * 1024) {
      return res.status(400).json({ message: 'File size exceeds the 10MB limit. Please upload a smaller file.' });
    }

    const filename = `product-${Date.now()}.${fileExtension}`;
    const uploadsDir = path.join(__dirname, '..', 'uploads');

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    fs.writeFileSync(path.join(uploadsDir, filename), buffer);

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
    res.json({ imageUrl });
  } catch (error) {
    console.error('Image Upload Error:', error);
    res.status(500).json({ message: 'Server error saving uploaded image', error: error.message });
  }
});

// @desc    Upload product image via file (multipart/form-data)
// @route   POST /api/products/upload-file
// @access  Private/Admin
router.post('/upload-file', protect, admin, (req, res) => {
  upload.single('image')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File size exceeds the 10MB limit. Please upload a smaller file.' });
      }
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  });
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  const { name, price, description, image, category, stock, ingredients, weight } = req.body;

  try {
    const product = await Product.create({
      name,
      price: Number(price),
      description,
      image,
      category,
      stock: Number(stock),
      reviews: [],
      ingredients: ingredients || '',
      weight: weight || ''
    });

    const responseData = typeof product.toObject === 'function' ? product.toObject() : product;
    if (responseData.image && responseData.image.startsWith('/uploads/')) {
      responseData.image = `${req.protocol}://${req.get('host')}${responseData.image}`;
    }
    res.status(201).json(responseData);
  } catch (error) {
    console.error('Create Product Error:', error);
    res.status(500).json({ message: 'Server error creating product' });
  }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  const { name, price, description, image, category, stock, ingredients, weight } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      const updateData = {
        name: name || product.name,
        price: price !== undefined ? Number(price) : product.price,
        description: description || product.description,
        image: image || product.image,
        category: category || product.category,
        stock: stock !== undefined ? Number(stock) : product.stock,
        ingredients: ingredients !== undefined ? ingredients : product.ingredients,
        weight: weight !== undefined ? weight : product.weight
      };

      const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
      const responseData = typeof updatedProduct.toObject === 'function' ? updatedProduct.toObject() : updatedProduct;
      if (responseData.image && responseData.image.startsWith('/uploads/')) {
        responseData.image = `${req.protocol}://${req.get('host')}${responseData.image}`;
      }
      res.json(responseData);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Update Product Error:', error);
    res.status(500).json({ message: 'Server error updating product' });
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (product) {
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Delete Product Error:', error);
    res.status(500).json({ message: 'Server error deleting product' });
  }
});

module.exports = router;
