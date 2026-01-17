import express from 'express';
import {
    getCourses,
    getCourseById,
    createCourse,
    deleteCourse,
    addPlaylist,
    addVideo,
} from '../controllers/course.controller';
import { protect } from '../middleware/auth';
import { isAdmin } from '../middleware/isAdmin';

const router = express.Router();

// Public routes
router.get('/', getCourses);
router.get('/:courseId', getCourseById);

// Admin routes
router.post('/', protect, isAdmin, createCourse);
router.delete('/:courseId', protect, isAdmin, deleteCourse);
router.post('/:courseId/playlists', protect, isAdmin, addPlaylist);
router.post('/:courseId/playlists/:playlistId/videos', protect, isAdmin, addVideo);

export default router;
