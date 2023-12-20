// routes/admin.js

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { body } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');

// Update Admin Information
router.put(
  '/update',
  authMiddleware,
  [
    body('currentPassword').exists().withMessage('Current password is required'),
    body('newPassword').optional().isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
    body('newUsername').optional().isString().withMessage('Invalid username').trim(),
  ],
  adminController.updateAdmin
);

// Add New Admin
router.post(
  '/add',
  authMiddleware,
  [
    body('newAdminUsername').isString().withMessage('Invalid username').trim(),
    body('newAdminPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  adminController.addAdmin
);

// GET all admins
router.get('/admins', authMiddleware, adminController.getAllAdmins);
router.get('/getAllAdmins', adminController.getAllAdmins);

// POST login admin
router.post(
  '/login',
  [
    body('username', 'Username is required').not().isEmpty(),
    body('password', 'Password is required').not().isEmpty(),
  ],
  adminController.loginAdmin
);

// DELETE admin
router.delete('/admins/:adminId', adminController.deleteAdmin);

module.exports = router;
