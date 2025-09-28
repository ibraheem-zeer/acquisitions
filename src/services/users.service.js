import logger from '../config/logger.js'
import { db } from '../config/database.js'
import { users } from '../models/user.model.js'
import { eq } from 'drizzle-orm'
import { hashPass } from './auth.service.js'

export const getAllUsers = async() => {
    try{
        return await db.select({
            id:users.id,
            email:users.email,
            name:users.name,
            role:users.role,
            created_at:users.created_at,
            updated_at:users.updated_at
        }).from(users)
    } catch(e) {
        logger.error(`Error getting users: ${e}`);
        throw e;
    }
}

export const getUserById = async(id) => {
    try {
        const [user] = await db.select({
            id: users.id,
            email: users.email,
            name: users.name,
            role: users.role,
            created_at: users.created_at,
            updated_at: users.updated_at
        }).from(users).where(eq(users.id, id)).limit(1);
        
        if (!user) {
            throw new Error('User not found');
        }
        
        return user;
    } catch(e) {
        logger.error(`Error getting user by id ${id}: ${e}`);
        throw e;
    }
}

export const updateUser = async(id, updates) => {
    try {
        // First check if user exists
        const existingUser = await getUserById(id);
        
        // Prepare update data
        const updateData = { ...updates };
        
        // Hash password if it's being updated
        if (updateData.password) {
            updateData.password = await hashPass(updateData.password);
        }
        
        // Add updated timestamp
        updateData.updated_at = new Date();
        
        // Check if email is being changed and if it already exists
        if (updateData.email && updateData.email !== existingUser.email) {
            const [emailExists] = await db.select()
                .from(users)
                .where(eq(users.email, updateData.email))
                .limit(1);
                
            if (emailExists) {
                throw new Error('Email already exists');
            }
        }
        
        const [updatedUser] = await db
            .update(users)
            .set(updateData)
            .where(eq(users.id, id))
            .returning({
                id: users.id,
                email: users.email,
                name: users.name,
                role: users.role,
                created_at: users.created_at,
                updated_at: users.updated_at
            });
        
        logger.info(`User ${id} updated successfully`);
        return updatedUser;
    } catch(e) {
        logger.error(`Error updating user ${id}: ${e}`);
        throw e;
    }
}

export const deleteUser = async(id) => {
    try {
        // First check if user exists
        const existingUser = await getUserById(id);
        
        const [deletedUser] = await db
            .delete(users)
            .where(eq(users.id, id))
            .returning({
                id: users.id,
                email: users.email,
                name: users.name,
                role: users.role
            });
        
        logger.info(`User ${id} deleted successfully`);
        return deletedUser;
    } catch(e) {
        logger.error(`Error deleting user ${id}: ${e}`);
        throw e;
    }
}
