import express from 'express';
import { createTeacher, getTeachers } from './user.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('Super Admin', 'Institute Admin'));

router.post('/teachers', createTeacher);
router.get('/teachers', getTeachers);

export default router;
