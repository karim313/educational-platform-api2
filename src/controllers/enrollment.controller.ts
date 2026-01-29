import { Request, Response } from 'express';
import Enrollment from '../models/Enrollment';
import Course from '../models/Course';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
let stripe: Stripe | null = null;

if (stripeSecretKey) {
    stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2023-10-16' as any,
    });
} else {
    console.warn('⚠️ STRIPE_SECRET_KEY is missing. Payment features will be disabled.');
}

/**
 * @desc    Purchase/Enroll in a course
 * @route   POST /api/enrollments/purchase/:courseId
 * @access  Private
 */
export const purchaseCourse = async (req: Request, res: Response) => {
    try {
        const courseId = req.params.courseId;
        const userId = (req as any).user._id;
        const { paymentMethod, transactionId } = req.body;

        if (!['stripe', 'vodafone_cash'].includes(paymentMethod)) {
            return res.status(400).json({ success: false, message: 'Please provide a valid payment method (stripe or vodafone_cash)' });
        }

        // 1. Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // 2. Check if already enrolled
        const existingEnrollment = await Enrollment.findOne({ user: userId, course: courseId });
        if (existingEnrollment) {
            // If it failed or pending, maybe allow retry, but for now:
            if (existingEnrollment.paymentStatus === 'completed') {
                return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
            }
        }

        // 3. Handle Stripe Payment
        if (paymentMethod === 'stripe') {
            if (!stripe) {
                return res.status(500).json({
                    success: false,
                    message: 'Stripe is not configured on the server. Please check environment variables.'
                });
            }
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: course.title,
                                description: course.description,
                            },
                            unit_amount: Math.round(course.price * 100),
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,
                metadata: {
                    userId: userId.toString(),
                    courseId: courseId.toString(),
                },
            });

            // Create a pending enrollment
            if (!existingEnrollment) {
                await Enrollment.create({
                    user: userId,
                    course: courseId,
                    paymentMethod: 'stripe',
                    paymentStatus: 'pending',
                    transactionId: session.id,
                    amount: course.price,
                });
            } else {
                existingEnrollment.transactionId = session.id;
                existingEnrollment.paymentMethod = 'stripe';
                await existingEnrollment.save();
            }

            return res.status(200).json({
                success: true,
                url: session.url,
                sessionId: session.id
            });
        }

        // 4. Handle Vodafone Cash Payment
        if (paymentMethod === 'vodafone_cash') {
            const vcNumber = process.env.VODAFONE_CASH_NUMBER || '010XXXXXXXX';
            if (!transactionId) {
                return res.status(400).json({
                    success: false,
                    message: `To enroll, please transfer the course price to Vodafone Cash: ${vcNumber}. Once done, send the Transaction ID here to complete your request.`
                });
            }

            const enrollment = await Enrollment.create({
                user: userId,
                course: courseId,
                paymentMethod: 'vodafone_cash',
                paymentStatus: 'pending',
                transactionId: transactionId,
                amount: course.price,
            });

            return res.status(201).json({
                success: true,
                message: 'Enrollment request submitted. Pending admin verification.',
                data: enrollment
            });
        }

    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Get courses the current user is enrolled in
 * @route   GET /api/enrollments/my-courses
 * @access  Private
 */
export const getMyCourses = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;

        // Only show completed enrollments
        const enrollments = await Enrollment.find({
            user: userId,
            paymentStatus: 'completed'
        }).populate('course');

        const courses = enrollments.map(enrollment => enrollment.course);

        res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Admin: Verify Vodafone Cash payment
 * @route   PUT /api/enrollments/verify/:enrollmentId
 * @access  Private (Admin)
 */
export const verifyEnrollment = async (req: Request, res: Response) => {
    try {
        const { status } = req.body; // 'completed' or 'failed'
        const enrollment = await Enrollment.findById(req.params.enrollmentId);

        if (!enrollment) {
            return res.status(404).json({ success: false, message: 'Enrollment not found' });
        }

        enrollment.paymentStatus = status;
        await enrollment.save();

        res.status(200).json({
            success: true,
            message: `Enrollment marked as ${status}`,
            data: enrollment
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
