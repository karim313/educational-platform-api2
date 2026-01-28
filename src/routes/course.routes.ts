import express from 'express';
import {
    getCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    addVideo,
    deleteVideo,
} from '../controllers/course.controller';
import { protect } from '../middleware/auth';
import { isAdmin } from '../middleware/isAdmin';
import { authorize } from '../middleware/authorize';

const router = express.Router();

// Public routes
/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Get all courses
 *     tags: [Courses]
 *     responses:
 *       200:
 *         description: List of courses
 */
router.get('/', getCourses);

/**
 * @swagger
 * /api/courses/{courseId}:
 *   get:
 *     summary: Get single course
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course details
 *       404:
 *         description: Course not found
 */
router.get('/:courseId', getCourseById);

// Admin routes

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Create a course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Course created
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 */
router.post('/', protect, isAdmin, createCourse);

/**
 * @swagger
 * /api/courses/{courseId}:
 *   put:
 *     summary: Update a course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Course'
 *     responses:
 *       200:
 *         description: Course updated
 *       404:
 *         description: Course not found
 */
router.put('/:courseId', protect, authorize('admin', 'teacher'), updateCourse);

/**
 * @swagger
 * /api/courses/{courseId}:
 *   delete:
 *     summary: Delete a course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Course not found
 */
router.delete('/:courseId', protect, isAdmin, deleteCourse);

/**
 * @swagger
 * /api/courses/{courseId}/videos:
 *   post:
 *     summary: Add video to course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - videoUrl
 *               - duration
 *             properties:
 *               title:
 *                 type: string
 *               videoUrl:
 *                 type: string
 *               duration:
 *                 type: number
 *     responses:
 *       201:
 *         description: Video added
 *       404:
 *         description: Course not found
 */
router.post('/:courseId/videos', protect, authorize('admin', 'teacher'), addVideo);
router.post('/:courseId/playlists/:playlistId/videos', protect, authorize('admin', 'teacher'), addVideo);

/**
 * @swagger
 * /api/courses/{courseId}/videos/{videoId}:
 *   delete:
 *     summary: Delete video from course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *       - in: path
 *         name: videoId
 *         required: true
 *     responses:
 *       200:
 *         description: Video deleted
 *       404:
 *         description: Course not found
 */
router.delete('/:courseId/videos/:videoId', protect, authorize('admin', 'teacher'), deleteVideo);

export default router;
