import { Request, Response } from 'express';
import Enrollment from '../models/Enrollment';
import Course from '../models/Course';

/**
 * @desc    Purchase/Enroll in a course
 * @route   POST /api/enrollments/purchase/:courseId
 * @access  Private
 */
export const purchaseCourse = async (req: Request, res: Response) => {
    try {
        const courseId = req.params.courseId;
        const userId = (req as any).user._id;

        // 1. Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // 2. Check if already enrolled
        const existingEnrollment = await Enrollment.findOne({ user: userId, course: courseId });
        if (existingEnrollment) {
            return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
        }

        // 3. Create enrollment
        const enrollment = await Enrollment.create({
            user: userId,
            course: courseId,
        });

        res.status(201).json({
            success: true,
            message: 'Successfully enrolled in course',
            data: enrollment
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Get courses the current user is enrolled in
 * @route   GET /api/enrollments/my-courses
 * @access  Private
 */
export const getMyCourses = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;

        const enrollments = await Enrollment.find({ user: userId }).populate('course');

        const courses = enrollments.map(enrollment => enrollment.course);

        res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
