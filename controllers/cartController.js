const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Add item to cart
// @route   POST /api/cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const qty = Number(quantity) || 1;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (product.stock < qty) {
      return res.status(400).json({ message: 'Not enough stock' });
    }

    const user = await User.findById(req.user._id);
    const itemIndex = user.cart.findIndex((p) => p.product.toString() === productId);

    if (itemIndex > -1) {
      // Product exists in the cart, update the quantity
      user.cart[itemIndex].quantity += qty;
    } else {
      // Product does not exist in cart, add new item
      user.cart.push({ product: productId, quantity: qty });
    }

    await user.save();
    return res.status(200).json(user.cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user cart
// @route   GET /api/cart
const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.product', 'name price');
    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { addToCart, getCart };
