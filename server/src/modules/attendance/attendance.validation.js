import { body } from 'express-validator';

export const recordAttendanceValidation = [
  body('courseId')
    .notEmpty()
    .withMessage('Course ID is required')
    .isMongoId()
    .withMessage('Invalid course ID format'),
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Date must be a valid ISO8601 date format'),
  body('records')
    .isArray({ min: 1 })
    .withMessage('Records must be a non-empty array of student attendance logs'),
  body('records.*.studentId')
    .notEmpty()
    .withMessage('Student ID is required for each record')
    .isMongoId()
    .withMessage('Invalid student ID format'),
  body('records.*.status')
    .notEmpty()
    .withMessage('Status is required for each record')
    .isIn(['Present', 'Absent', 'Leave'])
    .withMessage('Status must be Present, Absent, or Leave'),
];
