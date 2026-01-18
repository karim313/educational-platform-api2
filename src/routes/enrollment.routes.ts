import express from 'express';
import { purchaseCourse, getMyCourses, verifyEnrollment } from '../controllers/enrollment.controller';
import { protect } from '../middleware/auth';
import { isAdmin } from '../middleware/isAdmin';

const router = express.Router();

/**
 * @swagger
 * /api/enrollments/purchase/{courseId}:
 *   post:
 *     summary: Purchase/Enroll in a course
 *     tags: [Enrollments]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Successfully enrolled
 *       400:
 *         description: Already enrolled
 *       404:
 *         description: Course not found
 */
router.post('/purchase/:courseId', protect, purchaseCourse);

/**
 * @swagger
 * /api/enrollments/my-courses:
 *   get:
 *     summary: Get my enrolled courses
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of enrolled courses
 */
router.get('/my-courses', protect, getMyCourses);

/**
 * @swagger
 * /api/enrollments/verify/{enrollmentId}:
 *   put:
 *     summary: Admin verify enrollment
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: enrollmentId
 *         required: true
 *     responses:
 *       200:
 *         description: Verified
 */
router.put('/verify/:enrollmentId', protect, isAdmin, verifyEnrollment);

export default router;
