import express from 'express';
import { register, login, refreshToken, me, logout } from './auth.controller.js';
import { registerValidation, loginValidation } from './auth.validation.js';
import validate from '../../middlewares/validate.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authLimiter } from '../../middlewares/rateLimiter.middleware.js';

const router = express.Router();

router.post('/register', authLimiter, registerValidation, validate, register);
router.post('/login', authLimiter, loginValidation, validate, login);
router.post('/refresh-token', refreshToken);
router.get('/me', authenticate, me);
router.post('/logout', logout);

export default router;
