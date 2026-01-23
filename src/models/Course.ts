import mongoose from 'mongoose';

interface IVideo {
    title: string;
    videoUrl: string;
    duration: number;
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
    tag?: string;
    videos: IVideo[];
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
        },
        lessons: {
            type: Number,
            required: [true, 'Please add total number of lessons'],
        },
        category: {
            type: String,
            required: [true, 'Please add a category'],
        },
        level: {
            type: String,
            required: [true, 'Please add a course level'],
            enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
        },
        image: {
            type: String,
            required: [true, 'Please add a course image URL'],
        },
        tag: {
            type: String,
        },
        videos: [videoSchema],
    },
    {
        timestamps: true,
    }
);

const Course = mongoose.model<ICourse>('Course', courseSchema);

export default Course;
