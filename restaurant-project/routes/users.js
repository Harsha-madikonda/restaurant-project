const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { ensureAuth, ensureAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', ensureAdmin, userController.getAllUsers);
router.put('/:id/role', ensureAdmin, userController.updateUserRole);
router.delete('/:id', ensureAdmin, userController.deleteUser);
router.get('/profile', ensureAuth, userController.getProfile);
router.put('/profile', ensureAuth, upload.single('avatar'), userController.updateProfile);
router.put('/profile/password', ensureAuth, userController.changePassword);

module.exports = router;
