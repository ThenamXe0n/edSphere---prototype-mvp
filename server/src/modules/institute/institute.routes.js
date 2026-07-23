import express from 'express';
import { getAllInstitutes, createInstitute } from './institute.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('Super Admin'));

router.get('/', getAllInstitutes);
router.post('/', createInstitute);

export default router;
