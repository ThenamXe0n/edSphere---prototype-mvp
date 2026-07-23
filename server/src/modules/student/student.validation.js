import { body } from 'express-validator';

export const createStudentValidation = [
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .trim(),
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .trim(),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('admissionNumber')
    .notEmpty()
    .withMessage('Admission number is required')
    .trim(),
  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date'),
  body('phone')
    .optional()
    .trim(),
  body('course')
    .optional()
    .trim(),
  body('status')
    .optional()
    .isIn(['Active', 'Suspended', 'Alumni'])
    .withMessage('Status must be Active, Suspended, or Alumni'),
];

export const updateStudentValidation = [
  body('firstName')
    .optional()
    .notEmpty()
    .withMessage('First name cannot be empty')
    .trim(),
  body('lastName')
    .optional()
    .notEmpty()
    .withMessage('Last name cannot be empty')
    .trim(),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('admissionNumber')
    .optional()
    .notEmpty()
    .withMessage('Admission number cannot be empty')
    .trim(),
  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date'),
  body('phone')
    .optional()
    .trim(),
  body('course')
    .optional()
    .trim(),
  body('status')
    .optional()
    .isIn(['Active', 'Suspended', 'Alumni'])
    .withMessage('Status must be Active, Suspended, or Alumni'),
];
