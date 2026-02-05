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
            imageCover,
            tag,
            videos,
            playlists,
        } = req.body;

        const course = await Course.create({
            title,
            description,
            price,
            instructor,
            rating,
            reviews,
            hours,

            lessons: (Array.isArray(lessons) ? lessons.length : lessons),
            category,
            level,
            image,
            imageCover: imageCover || image, // Default to image if imageCover not provided
            tag,
            videos: videos || [],
            playlists: playlists || [],
        });
        res.status(201).json({ success: true, data: course });
    } catch (error) {
        res.status(500).json({ success: false, message: (error as Error).message });
    }
};

// @desc    Update a course
// @route   PUT /api/courses/:courseId
// @access  Private/Admin
export const updateCourse = async (req: Request, res: Response) => {
    try {
        if (req.body.lessons && Array.isArray(req.body.lessons)) {
            req.body.lessons = req.body.lessons.length;
        }

        const course = await Course.findByIdAndUpdate(req.params.courseId, req.body, {
            new: true,
            runValidators: true,
        });
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }
        res.json({ success: true, data: course });
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
            // Find the playlist using mongoose .id() method
            const playlist = (course.playlists as any).id(playlistId);
            if (!playlist) {
                return res.status(404).json({ success: false, message: 'Playlist not found' });
            }
            if (!playlist.videos) playlist.videos = [];
            playlist.videos.push({ title, videoUrl, duration });
        } else {
            // Add directly to course videos array
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

// @desc    Get all videos for a course
// @route   GET /api/courses/:courseId/videos
// @access  Public
export const getVideos = async (req: Request, res: Response) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }
        res.json({ success: true, count: course.videos.length, data: course.videos });
    } catch (error) {
        res.status(500).json({ success: false, message: (error as Error).message });
    }
};

// @desc    Get videos from a specific playlist
// @route   GET /api/courses/:courseId/playlists/:playlistId/videos
// @access  Public
export const getPlaylistVideos = async (req: Request, res: Response) => {
    try {
        const { courseId, playlistId } = req.params;
        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        const playlist = (course.playlists as any).id(playlistId);
        if (!playlist) {
            return res.status(404).json({ success: false, message: 'Playlist not found' });
        }

        res.json({ success: true, count: playlist.videos.length, data: playlist.videos });
    } catch (error) {
        res.status(500).json({ success: false, message: (error as Error).message });
    }
};

// @desc    Delete video from course
// @route   DELETE /api/courses/:courseId/videos/:videoId
// @access  Private/Admin/Teacher
export const deleteVideo = async (req: Request, res: Response) => {
    try {
        const { courseId, videoId } = req.params;
        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Use mongoose pull to remove subdocument
        (course.videos as any).pull(videoId);

        await course.save();
        res.json({ success: true, data: course });
    } catch (error) {
        res.status(500).json({ success: false, message: (error as Error).message });
    }
};

// @desc    Delete all videos from a course
// @route   DELETE /api/courses/:courseId/videos
// @access  Private/Admin/Teacher
export const deleteAllVideos = async (req: Request, res: Response) => {
    try {
        const course = await Course.findById(req.params.courseId);

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        course.videos = [];
        // Clear videos from all playlists too
        if (course.playlists) {
            course.playlists.forEach(playlist => {
                playlist.videos = [];
            });
        }

        await course.save();
        res.json({ success: true, message: 'All videos deleted from course', data: course });
    } catch (error) {
        res.status(500).json({ success: false, message: (error as Error).message });
    }
};

// @desc    Delete all courses
// @route   DELETE /api/courses
// @access  Private/Admin
export const deleteAllCourses = async (req: Request, res: Response) => {
    try {
        await Course.deleteMany({});
        res.json({ success: true, message: 'All courses deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: (error as Error).message });
    }
};

