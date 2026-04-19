const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { ensureAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', ensureAuth, userController.getProfile);
router.put('/', ensureAuth, upload.single('avatar'), userController.updateProfile);
router.put('/password', ensureAuth, userController.changePassword);

module.exports = router;
