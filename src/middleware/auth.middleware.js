import logger from '../config/logger.js';
import { jwttoken } from '../utils/jwt.js';
import { db } from '../config/database.js';
import { users } from '../models/user.model.js';
import { eq } from 'drizzle-orm';

// Middleware to authenticate users
export const authenticate = async (req, res, next) => {
    try {
        // Get token from cookies or Authorization header
        let token = req.cookies?.token;
        
        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        if (!token) {
            return res.status(401).json({
                error: 'Access denied. No token provided.'
            });
        }

        // Verify token
        const decoded = jwttoken.verify(token);
        
        // Get user from database to ensure they still exist
        const [user] = await db
            .select({
                id: users.id,
                email: users.email,
                name: users.name,
                role: users.role
            })
            .from(users)
            .where(eq(users.id, decoded.id))
            .limit(1);

        if (!user) {
            return res.status(401).json({
                error: 'Access denied. User not found.'
            });
        }

        // Attach user to request
        req.user = user;
        next();

    } catch (error) {
        logger.error('Authentication error:', error);
        if (error.message === 'Failed to authenticate token') {
            return res.status(401).json({
                error: 'Access denied. Invalid token.'
            });
        }
        return res.status(500).json({
            error: 'Authentication error'
        });
    }
};

// Middleware to check if user is admin
export const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            error: 'Access denied. Authentication required.'
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            error: 'Access denied. Admin privileges required.'
        });
    }

    next();
};

// Middleware to check if user can access their own resource or if they're admin
export const requireSelfOrAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            error: 'Access denied. Authentication required.'
        });
    }

    const requestedUserId = parseInt(req.params.id);
    
    if (req.user.id !== requestedUserId && req.user.role !== 'admin') {
        return res.status(403).json({
            error: 'Access denied. You can only access your own resources.'
        });
    }

    next();
};