import { Request, Response } from 'express';
import User from '../models/User';
import Enrollment from '../models/Enrollment';

/**
 * @desc    Get all users information for instructor dashboard
 * @route   GET /api/instructor/users
 * @access  Private/Admin/Teacher
 */
export const getAllUsersInfo = async (req: Request, res: Response) => {
    try {
        const users = await User.find({}).select('-password');

        // Enhance with enrollment count for each user
        const usersWithStats = await Promise.all(users.map(async (user) => {
            const enrollmentCount = await Enrollment.countDocuments({ user: user._id });
            return {
                ...user.toObject(),
                enrollmentCount
            };
        }));

        res.json({
            success: true,
            count: usersWithStats.length,
            data: usersWithStats
        });
    } catch (error) {
        res.status(500).json({ success: false, message: (error as Error).message });
    }
};
