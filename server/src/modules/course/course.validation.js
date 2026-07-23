import { body } from 'express-validator';

export const createCourseValidation = [
  body('title')
    .notEmpty()
    .withMessage('Course title is required')
    .trim(),
  body('description')
    .optional()
    .trim(),
  body('category')
    .optional()
    .trim(),
  body('instructor')
    .optional()
    .isMongoId()
    .withMessage('Instructor must be a valid User ID'),
  body('status')
    .optional()
    .isIn(['Draft', 'Published'])
    .withMessage('Status must be Draft or Published'),
];

export const addLessonValidation = [
  body('title')
    .notEmpty()
    .withMessage('Lesson title is required')
    .trim(),
  body('videoUrl')
    .optional()
    .trim(),
  body('description')
    .optional()
    .trim(),
  body('duration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Duration must be a positive integer'),
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer'),
];
