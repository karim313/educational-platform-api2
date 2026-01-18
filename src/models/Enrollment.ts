import mongoose from 'mongoose';

interface IEnrollment extends mongoose.Document {
    user: mongoose.Schema.Types.ObjectId;
    course: mongoose.Schema.Types.ObjectId;
    enrolledAt: Date;
}

const enrollmentSchema = new mongoose.Schema<IEnrollment>(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
        },
        enrolledAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent duplicate enrollments (One student can enroll only once per course)
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

const Enrollment = mongoose.model<IEnrollment>('Enrollment', enrollmentSchema);

export default Enrollment;
