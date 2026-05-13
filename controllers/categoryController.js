const Category = require('../models/Category');

// @desc    Create a category (Admin only)
// @route   POST /api/categories
const createCategory = async (req, res) => {
  const { name, description } = req.body;
  try {
    const category = await Category.create({ name, description });
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: 'Category already exists or invalid data' });
  }
};

// @desc    Get all categories
// @route   GET /api/categories
const getCategories = async (req, res) => {
  const categories = await Category.find({});
  res.json(categories);
};

module.exports = { createCategory, getCategories };
