import logger from '../config/logger.js';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../services/users.service.js';
import {
  userIdSchema,
  updateUserSchema,
} from '../validations/users.validation.js';
import { formatValidationError } from '../utils/format.js';

export const fetchAllUsers = async (req, res, next) => {
  try {
    logger.info('Getting users...');
    const allUsers = await getAllUsers();

    return res.json({
      message: 'Successfully retrieved users',
      users: allUsers,
      count: allUsers.length,
    });
  } catch (e) {
    logger.error('Error fetching all users:', e);
    next(e);
  }
};

export const fetchUserById = async (req, res, next) => {
  try {
    // Validate request params
    const validationResult = userIdSchema.safeParse(req.params);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(validationResult.error),
      });
    }

    const { id } = validationResult.data;

    logger.info(`Getting user by ID: ${id}`);
    const user = await getUserById(id);

    return res.json({
      message: 'Successfully retrieved user',
      user,
    });
  } catch (e) {
    logger.error('Error fetching user by ID:', e);
    if (e.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    next(e);
  }
};

export const updateUserById = async (req, res, next) => {
  try {
    // Validate request params
    const paramsValidation = userIdSchema.safeParse(req.params);
    if (!paramsValidation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(paramsValidation.error),
      });
    }

    // Validate request body
    const bodyValidation = updateUserSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(bodyValidation.error),
      });
    }

    const { id } = paramsValidation.data;
    const updates = bodyValidation.data;

    // Check if user is trying to update their own info or if they're admin
    const isUpdatingSelf = req.user.id === id;
    const isAdmin = req.user.role === 'admin';

    // Only admins can change roles
    if (updates.role && !isAdmin) {
      return res.status(403).json({
        error: 'Access denied. Only admins can change user roles.',
      });
    }

    // Non-admin users can only update their own information
    if (!isUpdatingSelf && !isAdmin) {
      return res.status(403).json({
        error: 'Access denied. You can only update your own information.',
      });
    }

    logger.info(`Updating user ${id}. Updated by user ${req.user.id}`);
    const updatedUser = await updateUser(id, updates);

    return res.json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (e) {
    logger.error('Error updating user:', e);
    if (e.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    if (e.message === 'Email already exists') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    next(e);
  }
};

export const deleteUserById = async (req, res, next) => {
  try {
    // Validate request params
    const validationResult = userIdSchema.safeParse(req.params);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(validationResult.error),
      });
    }

    const { id } = validationResult.data;

    // Check if user is trying to delete their own account or if they're admin
    const isDeletingSelf = req.user.id === id;
    const isAdmin = req.user.role === 'admin';

    // Users can delete their own account, admins can delete any account
    if (!isDeletingSelf && !isAdmin) {
      return res.status(403).json({
        error: 'Access denied. You can only delete your own account.',
      });
    }

    // Prevent admin from deleting themselves (optional business rule)
    if (isDeletingSelf && req.user.role === 'admin') {
      logger.warn(
        `Admin user ${req.user.id} attempting to delete their own account`
      );
    }

    logger.info(`Deleting user ${id}. Deleted by user ${req.user.id}`);
    const deletedUser = await deleteUser(id);

    return res.json({
      message: 'User deleted successfully',
      user: deletedUser,
    });
  } catch (e) {
    logger.error('Error deleting user:', e);
    if (e.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    next(e);
  }
};
