import { Request, Response } from 'express';
import Course from '../models/Course';

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
export const getCourses = async (req: Request, res: Response) => {
    try {
        const courses = await Course.find({});
        res.json({ success: true, count: courses.length, data: courses });
    } catch (error) {
        res.status(500).json({ success: false, message: (error as Error).message });
    }
};

// @desc    Get single course
// @route   GET /api/courses/:courseId
// @access  Public
export const getCourseById = async (req: Request, res: Response) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }
        res.json({ success: true, data: course });
    } catch (error) {
        res.status(500).json({ success: false, message: (error as Error).message });
    }
};

// @desc    Create a course
// @route   POST /api/courses
// @access  Private/Admin
export const createCourse = async (req: Request, res: Response) => {
    try {
        const { title, description, price } = req.body;
        const course = await Course.create({
            title,
            description,
            price,
            playlists: [],
        });
        res.status(201).json({ success: true, data: course });
    } catch (error) {
        res.status(500).json({ success: false, message: (error as Error).message });
    }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:courseId
// @access  Private/Admin
export const deleteCourse = async (req: Request, res: Response) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }
        res.json({ success: true, message: 'Course deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: (error as Error).message });
    }
};

// @desc    Add playlist to course
// @route   POST /api/courses/:courseId/playlists
// @access  Private/Admin
export const addPlaylist = async (req: Request, res: Response) => {
    try {
        const { title } = req.body;
        const course = await Course.findById(req.params.courseId);

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        course.playlists.push({ title, videos: [] } as any);
        await course.save();

        res.status(201).json({ success: true, data: course });
    } catch (error) {
        res.status(500).json({ success: false, message: (error as Error).message });
    }
};

// @desc    Add video to playlist
// @route   POST /api/courses/:courseId/playlists/:playlistId/videos
// @access  Private/Admin
export const addVideo = async (req: Request, res: Response) => {
    try {
        const { title, videoUrl, duration } = req.body;
        const course = await Course.findById(req.params.courseId);

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        const playlist = course.playlists.id(req.params.playlistId);

        if (!playlist) {
            return res.status(404).json({ success: false, message: 'Playlist not found' });
        }

        playlist.videos.push({ title, videoUrl, duration });
        await course.save();

        res.status(201).json({ success: true, data: course });
    } catch (error) {
        res.status(500).json({ success: false, message: (error as Error).message });
    }
};
