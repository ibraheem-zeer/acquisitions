import logger from "../config/logger.js"
import bcrypt from 'bcrypt'
import {db} from '../config/database.js'
import { users } from "../models/user.model.js"
import {eq} from 'drizzle-orm'

export const hashPass = async (password) => {
    try{
        return await bcrypt.hash(password,10)

    } catch (e) {
        logger.error(`Error hashing the password ${e}`);
        throw new Error(`Error hashing`)
    }
}

export const comparePassword = async (password, hashedPassword) => {
    try {
        return await bcrypt.compare(password, hashedPassword);
    } catch (e) {
        logger.error(`Error comparing password: ${e}`);
        throw new Error('Error comparing password');
    }
}

export const authenticateUser = async ({email, password}) => {
    try {
        const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
        
        if (!user) {
            throw new Error('User not found');
        }
        
        const isPasswordValid = await comparePassword(password, user.password);
        
        if (!isPasswordValid) {
            throw new Error('Invalid password');
        }
        
        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        logger.info(`User ${user.email} authenticated successfully`);
        return userWithoutPassword;
    } catch (e) {
        logger.error(`Error authenticating user: ${e}`);
        throw e;
    }
}

export const createUser = async ({name , email , password , role ='user'}) => {
    try {
        const existingUser = await db.select().from(users).where(eq(users.email , email)).limit(1)
        if(existingUser.length >0) throw new Error(`User with this email already exists`)
        const passHash = await hashPass(password)
        const [newUser] = await db
        .insert(users)
        .values({name, email , password:passHash , role})
        .returning({
            id:users.id,
            name:users.name,
            email:users.email,
            role:users.role,
            created_at:users.created_at
        })
        logger.info(`User ${newUser.email} created successfully`);
        return newUser;
    }catch(e){
        logger.error(`Error creating the user ${e}`);
        throw e;
    }
}
