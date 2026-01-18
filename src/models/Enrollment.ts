import mongoose from 'mongoose';

interface IEnrollment extends mongoose.Document {
    user: mongoose.Schema.Types.ObjectId;
    course: mongoose.Schema.Types.ObjectId;
    paymentMethod: 'stripe' | 'vodafone_cash' | 'free';
    paymentStatus: 'pending' | 'completed' | 'failed';
    transactionId?: string;
    amount: number;
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
        paymentMethod: {
            type: String,
            enum: ['stripe', 'vodafone_cash', 'free'],
            default: 'free',
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'completed', 'failed'],
            default: 'pending',
        },
        transactionId: {
            type: String,
        },
        amount: {
            type: Number,
            required: true,
            default: 0
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
// Note: We might allow multiple attempts if previous ones failed, but for simplicity:
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

const Enrollment = mongoose.model<IEnrollment>('Enrollment', enrollmentSchema);

export default Enrollment;
