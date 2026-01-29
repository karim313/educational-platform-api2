import express from 'express';
import {
    getCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    addVideo,
    deleteVideo,
    deleteAllVideos,
    deleteAllCourses,
} from '../controllers/course.controller';
import { protect } from '../middleware/auth';
import { isAdmin } from '../middleware/isAdmin';
import { authorize } from '../middleware/authorize';

const router = express.Router();

// Public routes
router.get('/', getCourses);
router.get('/:courseId', getCourseById);

// Admin/Instructor routes
router.post('/', protect, isAdmin, createCourse);
router.put('/:courseId', protect, authorize('admin', 'teacher'), updateCourse);
router.delete('/:courseId', protect, isAdmin, deleteCourse);
router.delete('/', protect, isAdmin, deleteAllCourses);

// Video management
router.post('/:courseId/videos', protect, authorize('admin', 'teacher'), addVideo);
router.post('/:courseId/playlists/:playlistId/videos', protect, authorize('admin', 'teacher'), addVideo);
router.delete('/:courseId/videos/:videoId', protect, authorize('admin', 'teacher'), deleteVideo);
router.delete('/:courseId/videos', protect, authorize('admin', 'teacher'), deleteAllVideos);

export default router;
