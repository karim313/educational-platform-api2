import mongoose from 'mongoose';

interface IVideo {
    title: string;
    videoUrl: string;
    duration: number;
}


interface IPlaylist {
    title: string;
    videos: IVideo[];
}

interface ICourse extends mongoose.Document {
    title: string;
    description: string;
    price: number;
    instructor: string;
    rating: number;
    reviews: number;
    hours: number;
    lessons: number;
    category: string;
    level: string;
    image: string;
    imageCover?: string;
    tag?: string;
    videos: IVideo[];
    playlists: IPlaylist[];
}

const videoSchema = new mongoose.Schema<IVideo>({
    title: {
        type: String,
        required: [true, 'Please add a video title'],
    },
    videoUrl: {
        type: String,
        required: [true, 'Please add a video URL'],
    },
    duration: {
        type: Number, // duration in minutes
        required: [true, 'Please add a video duration'],
    },
});

const playlistSchema = new mongoose.Schema<IPlaylist>({
    title: {
        type: String,
        required: [true, 'Please add a playlist title'],
    },
    videos: [videoSchema],
});


const courseSchema = new mongoose.Schema<ICourse>(
    {
        title: {
            type: String,
            required: [true, 'Please add a course title'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Please add a course description'],
        },
        price: {
            type: Number,
            required: [true, 'Please add a course price'],
        },
        instructor: {
            type: String,
            required: [true, 'Please add an instructor name'],
            default: 'Admin Instructor',
        },
        rating: {
            type: Number,
            default: 0,
        },
        reviews: {
            type: Number,
            default: 0,
        },
        hours: {
            type: Number,
            required: [true, 'Please add total course hours'],
            default: 0,
        },
        lessons: {
            type: Number,
            required: [true, 'Please add total number of lessons'],
            default: 0,
        },
        category: {
            type: String,
            required: [true, 'Please add a category'],
            default: 'General',
        },
        level: {
            type: String,
            required: [true, 'Please add a course level'],
            enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
            default: 'All Levels',
        },
        image: {
            type: String,
            required: [true, 'Please add a course image URL'],
            default: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=800',
        },
        imageCover: {
            type: String,
            default: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=1200',
        },
        tag: {
            type: String,
            default: '',
        },
        videos: {
            type: [videoSchema],
            default: [],
        },
        playlists: {
            type: [playlistSchema],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

const Course = mongoose.model<ICourse>('Course', courseSchema);

export default Course;
