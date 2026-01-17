import { Request, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';

// Generate JWT Token
const generateToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password, role } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Check if an admin already exists
        const adminExists = await User.findOne({ role: 'admin' });

        let finalRole = 'student';

        // If no admin exists, we can allow the first registration to be an admin if they requested it
        // Or if the prompt means "only one admin is allowed", we ensure we don't create a second one.
        if (role === 'admin') {
            if (adminExists) {
                return res.status(400).json({ success: false, message: 'An admin already exists. Only one admin is allowed.' });
            } else {
                finalRole = 'admin';
            }
        }

        const user = await User.create({
            name,
            email,
            password,
            role: finalRole,
        });

        if (user) {
            res.status(201).json({
                success: true,
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id.toString()),
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: (error as Error).message });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user: any = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {
            res.json({
                success: true,
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id.toString()),
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: (error as Error).message });
    }
};
