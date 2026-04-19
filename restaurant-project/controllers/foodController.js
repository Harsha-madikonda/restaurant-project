const Food = require('../models/Food');
const fs = require('fs');
const path = require('path');

// GET /food - List all food items
exports.getAllFood = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};
    if (category && ['Veg', 'Non-Veg'].includes(category)) query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };

    const foods = await Food.find(query).sort({ createdAt: -1 }).lean();
    res.render('food/list', { title: 'Food Menu', foods, category, search });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load food items.');
    res.redirect('/dashboard');
  }
};

// GET /food/add
exports.getAddFood = (req, res) => {
  res.render('food/add', { title: 'Add Food Item' });
};

// POST /food/add
exports.postAddFood = async (req, res) => {
  try {
    const { name, description, price, category, available } = req.body;

    if (!name || !description || !price || !category) {
      req.flash('error', 'All fields are required.');
      return res.redirect('/food/add');
    }

    const foodData = {
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      category,
      available: available === 'on' || available === 'true',
    };

    if (req.file) {
      foodData.image = '/uploads/' + req.file.filename;
    }

    await Food.create(foodData);
    req.flash('success', 'Food item added successfully!');
    res.redirect('/food');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to add food item.');
    res.redirect('/food/add');
  }
};

// GET /food/edit/:id
exports.getEditFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id).lean();
    if (!food) {
      req.flash('error', 'Food item not found.');
      return res.redirect('/food');
    }
    res.render('food/edit', { title: 'Edit Food Item', food });
  } catch (err) {
    req.flash('error', 'Food item not found.');
    res.redirect('/food');
  }
};

// PUT /food/edit/:id
exports.putEditFood = async (req, res) => {
  try {
    const { name, description, price, category, available } = req.body;
    const food = await Food.findById(req.params.id);

    if (!food) {
      req.flash('error', 'Food item not found.');
      return res.redirect('/food');
    }

    food.name = name.trim();
    food.description = description.trim();
    food.price = parseFloat(price);
    food.category = category;
    food.available = available === 'on' || available === 'true';

    if (req.file) {
      // Delete old image if exists
      if (food.image) {
        const oldPath = path.join(__dirname, '../public', food.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      food.image = '/uploads/' + req.file.filename;
    }

    await food.save();
    req.flash('success', 'Food item updated successfully!');
    res.redirect('/food');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to update food item.');
    res.redirect('/food');
  }
};

// DELETE /food/:id
exports.deleteFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      req.flash('error', 'Food item not found.');
      return res.redirect('/food');
    }

    // Delete image file if exists
    if (food.image) {
      const imgPath = path.join(__dirname, '../public', food.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await Food.findByIdAndDelete(req.params.id);
    req.flash('success', 'Food item deleted successfully!');
    res.redirect('/food');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to delete food item.');
    res.redirect('/food');
  }
};
