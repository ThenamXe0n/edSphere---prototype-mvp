import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './modules/auth/auth.routes.js';
import studentRoutes from './modules/student/student.routes.js';
import courseRoutes from './modules/course/course.routes.js';
import attendanceRoutes from './modules/attendance/attendance.routes.js';
import instituteRoutes from './modules/institute/institute.routes.js';
import userRoutes from './modules/user/user.routes.js';

import errorMiddleware from './middlewares/error.middleware.js';
import { apiLimiter } from './middlewares/rateLimiter.middleware.js';
import AppError from './utils/AppError.js';

const app = express();

// ES module path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Enable CORS
const allowedOrigins = process.env.FRONTEND_URL 

app.use(
  cors({
    origin: [allowedOrigins,"http://localhost:3000"],
    credentials: true, // Allow sharing cookies
  })
);

// Body parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Static Files (Uploaded profile images/thumbnails)
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Apply rate limiter to all API endpoints
app.use('/api', apiLimiter);

// Mounting modular routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/institutes', instituteRoutes);
app.use('/api/users', userRoutes);

// Catch undefined routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Central error-handling middleware
app.use(errorMiddleware);

export default app;
