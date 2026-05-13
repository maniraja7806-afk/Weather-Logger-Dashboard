const express = require('express');
const router = express.Router();
const { getProducts, createProduct, updateProduct } = require('../controllers/productController');
const { createProductReview, getProductReviews } = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getProducts)
  .post(protect, admin, createProduct);

router.route('/:id')
  .put(protect, admin, updateProduct);

router.route('/:id/reviews')
  .get(getProductReviews)
  .post(protect, createProductReview);

module.exports = router;
