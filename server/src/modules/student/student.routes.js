import express from 'express';
import {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} from './student.controller.js';
import { createStudentValidation, updateStudentValidation } from './student.validation.js';
import validate from '../../middlewares/validate.middleware.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import upload from '../../middlewares/upload.middleware.js';

const router = express.Router();

// Apply authenticate middleware to all student routes
router.use(authenticate);

// Admin-only creation
router.post(
  '/',
  authorize('Super Admin', 'Institute Admin'),
  upload.single('profileImage'),
  createStudentValidation,
  validate,
  createStudent
);

// Read routes: Accessible by Admins and Teachers
router.get(
  '/',
  authorize('Super Admin', 'Institute Admin', 'Teacher'),
  getAllStudents
);

router.get('/:id', getStudentById);

// Update/Delete routes: Accessible by Admins
router.put(
  '/:id',
  authorize('Super Admin', 'Institute Admin'),
  upload.single('profileImage'),
  updateStudentValidation,
  validate,
  updateStudent
);

router.delete(
  '/:id',
  authorize('Super Admin', 'Institute Admin'),
  deleteStudent
);

export default router;
