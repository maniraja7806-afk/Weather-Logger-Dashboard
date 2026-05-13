const Review = require('../models/Review');
const Product = require('../models/Product');

// @desc    Create new review
// @route   POST /api/products/:id/reviews
const createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;

    const product = await Product.findById(productId);

    if (product) {
      const alreadyReviewed = await Review.findOne({ user: req.user._id, product: productId });

      if (alreadyReviewed) {
        return res.status(400).json({ message: 'Product already reviewed' });
      }

      const review = new Review({
        user: req.user._id,
        product: productId,
        rating: Number(rating),
        comment,
      });

      await review.save();

      // Recalculate average rating
      const reviews = await Review.find({ product: productId });
      product.numReviews = reviews.length;
      product.rating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

      await product.save();
      res.status(201).json({ message: 'Review added' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get reviews for a product
// @route   GET /api/products/:id/reviews
const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.id }).populate('user', 'name');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createProductReview, getProductReviews };
