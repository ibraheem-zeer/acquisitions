import express from 'express';
import {
  fetchAllUsers,
  fetchUserById,
  updateUserById,
  deleteUserById,
} from '../controllers/users.controller.js';
import {
  authenticate,
  requireSelfOrAdmin,
} from '../middleware/auth.middleware.js';

const router = express.Router();

// GET /users - Get all users (requires authentication)
router.get('/', authenticate, fetchAllUsers);

// GET /users/:id - Get user by ID (requires authentication, user can access own data or admin can access any)
router.get('/:id', authenticate, requireSelfOrAdmin, fetchUserById);

// PUT /users/:id - Update user by ID (requires authentication, user can update own data or admin can update any)
router.put('/:id', authenticate, updateUserById);

// DELETE /users/:id - Delete user by ID (requires authentication, user can delete own account or admin can delete any)
router.delete('/:id', authenticate, requireSelfOrAdmin, deleteUserById);

export default router;
