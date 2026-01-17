import mongoose from 'mongoose';

interface IVideo {
    title: string;
    videoUrl: string;
    duration: number;
}

interface IPlaylist extends mongoose.Document {
    title: string;
    videos: IVideo[];
}

interface ICourse extends mongoose.Document {
    title: string;
    description: string;
    price: number;
    playlists: mongoose.Types.DocumentArray<IPlaylist>;
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
        playlists: [playlistSchema],
    },
    {
        timestamps: true,
    }
);

const Course = mongoose.model<ICourse>('Course', courseSchema);

export default Course;
