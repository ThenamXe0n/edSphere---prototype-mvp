import express from 'express';
import {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  addLesson,
  updateLesson,
  deleteLesson,
  markLessonComplete,
  getCourseProgress,
} from './course.controller.js';
import { createCourseValidation, addLessonValidation } from './course.validation.js';
import validate from '../../middlewares/validate.middleware.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import upload from '../../middlewares/upload.middleware.js';

const router = express.Router();

// Apply authenticate middleware to all course routes
router.use(authenticate);

// Course CRUD routes
router.post(
  '/',
  authorize('Super Admin', 'Institute Admin', 'Teacher'),
  upload.single('thumbnail'),
  createCourseValidation,
  validate,
  createCourse
);

router.get('/', getAllCourses);
router.get('/:id', getCourseById);

router.put(
  '/:id',
  authorize('Super Admin', 'Institute Admin', 'Teacher'),
  upload.single('thumbnail'),
  updateCourse
);

router.delete(
  '/:id',
  authorize('Super Admin', 'Institute Admin', 'Teacher'),
  deleteCourse
);

// Lesson Management routes
router.post(
  '/:courseId/lessons',
  authorize('Super Admin', 'Institute Admin', 'Teacher'),
  addLessonValidation,
  validate,
  addLesson
);

router.put(
  '/:courseId/lessons/:lessonId',
  authorize('Super Admin', 'Institute Admin', 'Teacher'),
  addLessonValidation,
  validate,
  updateLesson
);

router.delete(
  '/:courseId/lessons/:lessonId',
  authorize('Super Admin', 'Institute Admin', 'Teacher'),
  deleteLesson
);

// Student progress routes
router.post(
  '/:courseId/lessons/:lessonId/complete',
  authorize('Student'),
  markLessonComplete
);

router.get(
  '/:courseId/progress',
  getCourseProgress
);

export default router;
