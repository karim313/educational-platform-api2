import express from 'express';
import { getAllUsersInfo } from '../controllers/instructor.controller';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = express.Router();

router.get('/users', protect, authorize('admin', 'teacher'), getAllUsersInfo);

export default router;
