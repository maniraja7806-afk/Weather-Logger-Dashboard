const Product = require('../models/Product');
const Category = require('../models/Category');

// @desc    Get all products with searching, sorting, and filtering
// @route   GET /api/products
const getProducts = async (req, res) => {
  try {
    const { keyword, category, sort } = req.query;

    let query = {};

    // Search by name
    if (keyword) {
      query.name = { $regex: keyword, $options: 'i' };
    }

    // Filter by category
    if (category) {
      const categoryObj = await Category.findOne({ name: { $regex: category, $options: 'i' } });
      if (categoryObj) {
        query.category = categoryObj._id;
      }
    }

    // Sort options
    let sortOptions = {};
    if (sort === 'price_asc') sortOptions.price = 1;
    if (sort === 'price_desc') sortOptions.price = -1;
    if (sort === 'rating_desc') sortOptions.rating = -1;

    const products = await Product.find(query).populate('category', 'name').sort(sortOptions);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
};

// @desc    Create a product (Admin only)
// @route   POST /api/products
const createProduct = async (req, res) => {
  try {
    const { name, price, description, categoryId, stock } = req.body;
    
    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    const product = new Product({
      name,
      price,
      description,
      category: categoryId,
      stock,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create product', error: error.message });
  }
};

// @desc    Update a product / Manage inventory (Admin only)
// @route   PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const { name, price, description, stock, categoryId } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.price = price !== undefined ? price : product.price;
      product.description = description || product.description;
      product.stock = stock !== undefined ? stock : product.stock;
      if (categoryId) product.category = categoryId;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to update product' });
  }
};

module.exports = { getProducts, createProduct, updateProduct };
