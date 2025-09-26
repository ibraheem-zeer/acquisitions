import logger from "../config/logger.js"
import { createUser, authenticateUser } from "../services/auth.service.js";
import { cookies } from "../utils/cookies.js";
import { formatValidationError } from "../utils/format.js";
import { jwttoken } from "../utils/jwt.js";
import { signupSchema, signinSchema } from "../validations/auth.validation.js"

export const signup = async (req,res,next) => {
    try {
        const validationRes = signupSchema.safeParse(req.body);
        if(!validationRes.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: formatValidationError(validationRes.error)
            })
        }

        const {name , email ,password, role} = validationRes.data;

        const user = await createUser({name,email,password , role})
        const token = jwttoken.sign({
            id:user.id,
            email:user.email,
            role:user.role
        })

        cookies.set(res,'token',token);

        logger.info(`User registered successfully: ${email}`)
        res.status(201).json({
            message:'User registered',
            user: {
                id:user.id,
                name:user.name,
                email:user.email,
                role:user.role
            }
        })

    } catch(e){
        logger.error('Signup errors',e)
        if(e.message ==='User with this email already exists')
            return res.status(409).json({error: 'Email already exist'})
        next(e);
    }
}

export const signin = async (req, res, next) => {
    try {
        const validationRes = signinSchema.safeParse(req.body);
        if (!validationRes.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: formatValidationError(validationRes.error)
            });
        }

        const { email, password } = validationRes.data;

        const user = await authenticateUser({ email, password });
        const token = jwttoken.sign({
            id: user.id,
            email: user.email,
            role: user.role
        });

        cookies.set(res, 'token', token);

        logger.info(`User signed in successfully: ${email}`);
        res.status(200).json({
            message: 'User signed in',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (e) {
        logger.error('Signin errors', e);
        if (e.message === 'User not found') {
            return res.status(404).json({ error: 'User not found' });
        }
        if (e.message === 'Invalid password') {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        next(e);
    }
}

export const signout = async (req, res, next) => {
    try {
        // Clear the token cookie
        cookies.clear(res, 'token');

        logger.info('User signed out successfully');
        res.status(200).json({
            message: 'User signed out successfully'
        });

    } catch (e) {
        logger.error('Signout errors', e);
        next(e);
    }
}
