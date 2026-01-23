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
        const {
            title,
            description,
            price,
            instructor,
            rating,
            reviews,
            hours,
            lessons,
            category,
            level,
            image,
            tag,
            videos,
        } = req.body;

        const course = await Course.create({
            title,
            description,
            price,
            instructor,
            rating,
            reviews,
            hours,
            lessons,
            category,
            level,
            image,
            tag,
            videos: videos || [],
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

        if (!course.playlists) {
            course.playlists = [] as any;
        }

        course.playlists!.push({ title, videos: [] } as any);
        await course.save();

        res.status(201).json({ success: true, data: course });
    } catch (error) {
        res.status(500).json({ success: false, message: (error as Error).message });
    }
};

// @desc    Add video to course or playlist
// @route   POST /api/courses/:courseId/videos
// @route   POST /api/courses/:courseId/playlists/:playlistId/videos
// @access  Private/Admin
export const addVideo = async (req: Request, res: Response) => {
    try {
        const { title, videoUrl, duration } = req.body;
        const { courseId, playlistId } = req.params;
        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        if (playlistId) {
            // Add to specific playlist
            if (!course.playlists) {
                return res.status(404).json({ success: false, message: 'No playlists found in this course' });
            }
            const playlist = course.playlists.id(playlistId);
            if (!playlist) {
                return res.status(404).json({ success: false, message: 'Playlist not found' });
            }
            playlist.videos.push({ title, videoUrl, duration });
        } else {
            // Add directly to course
            if (!course.videos) {
                course.videos = [];
            }
            course.videos.push({ title, videoUrl, duration });
        }

        await course.save();
        res.status(201).json({ success: true, data: course });
    } catch (error) {
        res.status(500).json({ success: false, message: (error as Error).message });
    }
};
