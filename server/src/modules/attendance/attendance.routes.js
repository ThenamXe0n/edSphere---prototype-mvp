import express from 'express';
import { recordAttendance, getStudentAttendance } from './attendance.controller.js';
import { recordAttendanceValidation } from './attendance.validation.js';
import validate from '../../middlewares/validate.middleware.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Apply authenticate to all attendance routes
router.use(authenticate);

// Record bulk attendance (Admins and Teachers)
router.post(
  '/',
  authorize('Super Admin', 'Institute Admin', 'Teacher'),
  recordAttendanceValidation,
  validate,
  recordAttendance
);

// Get student attendance logs and stats (All authenticated roles can access, but Student role is scoped to themselves inside controller)
router.get('/student/:studentId', getStudentAttendance);

export default router;
