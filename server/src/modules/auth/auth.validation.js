import { body } from 'express-validator';

export const registerValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .trim(),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('instituteName')
    .notEmpty()
    .withMessage('Institute name is required')
    .trim(),
  body('instituteCode')
    .notEmpty()
    .withMessage('Institute code is required')
    .trim()
    .toUpperCase(),
];

export const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];
