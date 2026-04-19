const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');
const { ensureAuth, ensureAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', ensureAuth, foodController.getAllFood);
router.get('/add', ensureAdmin, foodController.getAddFood);
router.post('/add', ensureAdmin, upload.single('image'), foodController.postAddFood);
router.get('/edit/:id', ensureAdmin, foodController.getEditFood);
router.put('/edit/:id', ensureAdmin, upload.single('image'), foodController.putEditFood);
router.delete('/:id', ensureAdmin, foodController.deleteFood);

module.exports = router;
