const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const { cache } = require('../middleware/cache');

// All routes are protected and require admin role
router.use(protect);

// Cache GET requests for 5 minutes
router.get('/', authorize('admin'), cache(300), userController.getUsers);
router.get('/:id', cache(300), userController.getUser);
router.put('/:id', authorize('admin'), userController.updateUser);
router.delete('/:id', authorize('admin'), userController.deleteUser);

module.exports = router;
