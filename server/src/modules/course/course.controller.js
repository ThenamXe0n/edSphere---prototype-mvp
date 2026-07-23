import { Course, CourseProgress } from './course.model.js';
import User from '../user/user.model.js';
import AppError from '../../utils/AppError.js';
import catchAsync from '../../utils/catchAsync.js';
import fs from 'fs';
import path from 'path';

// Create Course (Teacher or Admin)
export const createCourse = catchAsync(async (req, res, next) => {
  const { title, description, category, instructor, status } = req.body;

  // Determine institute
  const instituteId = req.user.role === 'Super Admin' ? req.body.institute : req.user.institute;
  if (!instituteId) {
    return next(new AppError('Institute ID is required', 400));
  }

  // Determine instructor
  let instructorId;
  if (req.user.role === 'Teacher') {
    instructorId = req.user._id;
  } else {
    // Admin or Super Admin assigning course to a teacher
    instructorId = instructor || req.user._id;
    // Verify instructor exists and belongs to the same institute
    const instructorUser = await User.findById(instructorId);
    if (!instructorUser || instructorUser.role !== 'Teacher') {
      return next(new AppError('Invalid instructor. Must be a valid Teacher account.', 400));
    }
    if (req.user.role !== 'Super Admin' && instructorUser.institute.toString() !== instituteId.toString()) {
      return next(new AppError('Teacher must belong to the same institute', 403));
    }
  }

  // Thumbnail upload
  let thumbnail = '';
  if (req.file) {
    thumbnail = `/uploads/${req.file.filename}`;
  }

  const course = await Course.create({
    title,
    description,
    category,
    instructor: instructorId,
    thumbnail,
    status: status || 'Draft',
    institute: instituteId,
  });

  res.status(201).json({
    status: 'success',
    data: {
      course,
    },
  });
});

// Get all courses (Filtered by Institute and role)
export const getAllCourses = catchAsync(async (req, res, next) => {
  const query = {};

  // Institute isolation
  if (req.user.role !== 'Super Admin') {
    query.institute = req.user.institute;
  } else if (req.query.institute) {
    query.institute = req.query.institute;
  }

  // Role permissions: students can only see published courses
  if (req.user.role === 'Student') {
    query.status = 'Published';
  }

  // Teacher filters: show all or only their own courses
  if (req.user.role === 'Teacher' && req.query.myCourses === 'true') {
    query.instructor = req.user._id;
  }

  const courses = await Course.find(query)
    .populate('instructor', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: courses.length,
    data: {
      courses,
    },
  });
});

// Get Course by ID
export const getCourseById = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id)
    .populate('instructor', 'name email')
    .populate('institute', 'name code');

  if (!course) {
    return next(new AppError('No course found with that ID', 404));
  }

  // Isolation check
  const courseInstId = course.institute?._id || course.institute;
  if (req.user.role !== 'Super Admin' && courseInstId.toString() !== req.user.institute.toString()) {
    return next(new AppError('You do not have permission to access this course', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      course,
    },
  });
});

// Update Course
export const updateCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new AppError('No course found with that ID', 404));
  }

  // Isolation and permissions check
  if (req.user.role !== 'Super Admin') {
    if (course.institute.toString() !== req.user.institute.toString()) {
      return next(new AppError('You do not have permission to update this course', 403));
    }
    // Teacher can only update their own courses
    if (req.user.role === 'Teacher' && course.instructor.toString() !== req.user._id.toString()) {
      return next(new AppError('You can only update courses taught by you', 403));
    }
  }

  const { title, description, category, instructor, status } = req.body;

  // Handle instructor assignment change by admins
  if (instructor && instructor !== course.instructor.toString()) {
    if (req.user.role === 'Teacher') {
      return next(new AppError('Teachers cannot reassign course instructors', 403));
    }
    const checkInstructor = await User.findById(instructor);
    if (!checkInstructor || checkInstructor.role !== 'Teacher') {
      return next(new AppError('Invalid instructor. Must be a valid Teacher account.', 400));
    }
  }

  // Update thumbnail
  if (req.file) {
    // Delete old thumbnail if exists
    if (course.thumbnail && course.thumbnail.startsWith('/uploads/')) {
      const oldPath = path.join('public', course.thumbnail);
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
        } catch (e) {
          console.error(`Failed to delete old thumbnail: ${e.message}`);
        }
      }
    }
    course.thumbnail = `/uploads/${req.file.filename}`;
  }

  if (title) course.title = title;
  if (description) course.description = description;
  if (category) course.category = category;
  if (instructor && req.user.role !== 'Teacher') course.instructor = instructor;
  if (status) course.status = status;

  await course.save();

  res.status(200).json({
    status: 'success',
    data: {
      course,
    },
  });
});

// Delete Course
export const deleteCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new AppError('No course found with that ID', 404));
  }

  // Isolation and permissions check
  if (req.user.role !== 'Super Admin') {
    if (course.institute.toString() !== req.user.institute.toString()) {
      return next(new AppError('You do not have permission to delete this course', 403));
    }
    if (req.user.role === 'Teacher' && course.instructor.toString() !== req.user._id.toString()) {
      return next(new AppError('You can only delete courses taught by you', 403));
    }
  }

  // Delete thumbnail image file if exists
  if (course.thumbnail && course.thumbnail.startsWith('/uploads/')) {
    const imgPath = path.join('public', course.thumbnail);
    if (fs.existsSync(imgPath)) {
      try {
        fs.unlinkSync(imgPath);
      } catch (e) {
        console.error(`Failed to delete thumbnail: ${e.message}`);
      }
    }
  }

  await Course.findByIdAndDelete(req.params.id);
  // Also clean up course progress logs for this course
  await CourseProgress.deleteMany({ courseId: req.params.id });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Add Lesson to Course (Teacher or Admin)
export const addLesson = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId);

  if (!course) {
    return next(new AppError('No course found with that ID', 404));
  }

  // Isolation & authorization checks
  if (req.user.role !== 'Super Admin') {
    if (course.institute.toString() !== req.user.institute.toString()) {
      return next(new AppError('You do not have permission to edit this course', 403));
    }
    if (req.user.role === 'Teacher' && course.instructor.toString() !== req.user._id.toString()) {
      return next(new AppError('You can only add lessons to courses taught by you', 403));
    }
  }

  const { title, videoUrl, description, duration, order } = req.body;

  // Determine lesson order
  const lessonOrder = order !== undefined ? order : course.lessons.length + 1;

  course.lessons.push({
    title,
    videoUrl,
    description,
    duration: duration || 0,
    order: lessonOrder,
  });

  // Sort lessons by order
  course.lessons.sort((a, b) => a.order - b.order);
  await course.save();

  res.status(201).json({
    status: 'success',
    data: {
      lessons: course.lessons,
    },
  });
});

// Update Lesson
export const updateLesson = catchAsync(async (req, res, next) => {
  const { courseId, lessonId } = req.params;
  const course = await Course.findById(courseId);

  if (!course) {
    return next(new AppError('No course found with that ID', 404));
  }

  // Isolation & authorization checks
  if (req.user.role !== 'Super Admin') {
    if (course.institute.toString() !== req.user.institute.toString()) {
      return next(new AppError('You do not have permission to edit this course', 403));
    }
    if (req.user.role === 'Teacher' && course.instructor.toString() !== req.user._id.toString()) {
      return next(new AppError('You can only update lessons of courses taught by you', 403));
    }
  }

  const lesson = course.lessons.id(lessonId);
  if (!lesson) {
    return next(new AppError('Lesson not found', 404));
  }

  const { title, videoUrl, description, duration, order } = req.body;

  if (title) lesson.title = title;
  if (videoUrl !== undefined) lesson.videoUrl = videoUrl;
  if (description !== undefined) lesson.description = description;
  if (duration !== undefined) lesson.duration = duration;
  if (order !== undefined) lesson.order = order;

  course.lessons.sort((a, b) => a.order - b.order);
  await course.save();

  res.status(200).json({
    status: 'success',
    data: {
      lesson,
    },
  });
});

// Delete Lesson
export const deleteLesson = catchAsync(async (req, res, next) => {
  const { courseId, lessonId } = req.params;
  const course = await Course.findById(courseId);

  if (!course) {
    return next(new AppError('No course found with that ID', 404));
  }

  // Isolation & authorization checks
  if (req.user.role !== 'Super Admin') {
    if (course.institute.toString() !== req.user.institute.toString()) {
      return next(new AppError('You do not have permission to edit this course', 403));
    }
    if (req.user.role === 'Teacher' && course.instructor.toString() !== req.user._id.toString()) {
      return next(new AppError('You can only delete lessons of courses taught by you', 403));
    }
  }

  const lesson = course.lessons.id(lessonId);
  if (!lesson) {
    return next(new AppError('Lesson not found', 404));
  }

  course.lessons.pull(lessonId);
  await course.save();

  // Clean up completed lessons in student progresses
  await CourseProgress.updateMany(
    { courseId },
    { $pull: { completedLessons: lessonId } }
  );

  res.status(200).json({
    status: 'success',
    message: 'Lesson deleted successfully',
  });
});

// Mark Lesson Completed (Student Only)
export const markLessonComplete = catchAsync(async (req, res, next) => {
  const { courseId, lessonId } = req.params;

  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  // Verify lesson exists
  const lesson = course.lessons.id(lessonId);
  if (!lesson) {
    return next(new AppError('Lesson not found in this course', 404));
  }

  // Load or create Progress
  let progress = await CourseProgress.findOne({
    studentId: req.user._id,
    courseId,
  });

  if (!progress) {
    progress = new CourseProgress({
      studentId: req.user._id,
      courseId,
      completedLessons: [],
    });
  }

  // Add lesson to completed array if not already present
  if (!progress.completedLessons.includes(lessonId)) {
    progress.completedLessons.push(lessonId);
  } else {
    // If already checked, remove it to toggle!
    // Toggle-like capability is standard and highly interactive.
    progress.completedLessons.pull(lessonId);
  }

  // Check if all lessons are complete
  progress.isCompleted = progress.completedLessons.length === course.lessons.length;
  await progress.save();

  // Compute percentage
  const totalLessons = course.lessons.length;
  const completedCount = progress.completedLessons.length;
  const percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  res.status(200).json({
    status: 'success',
    data: {
      completedLessons: progress.completedLessons,
      isCompleted: progress.isCompleted,
      percentage,
    },
  });
});

// Get Course Progress (Student, or Admin/Teacher looking at specific student)
export const getCourseProgress = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const studentId = req.query.studentId || req.user._id;

  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  // Check isolation
  if (req.user.role !== 'Super Admin' && course.institute.toString() !== req.user.institute.toString()) {
    return next(new AppError('Course does not belong to your institute', 403));
  }

  const progress = await CourseProgress.findOne({
    studentId,
    courseId,
  });

  const completedLessons = progress ? progress.completedLessons : [];
  const isCompleted = progress ? progress.isCompleted : false;
  const totalLessons = course.lessons.length;
  const completedCount = completedLessons.length;
  const percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  res.status(200).json({
    status: 'success',
    data: {
      completedLessons,
      isCompleted,
      percentage,
      totalLessons,
      completedCount,
    },
  });
});
