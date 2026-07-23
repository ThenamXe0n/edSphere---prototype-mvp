import Institute from './institute.model.js';
import User from '../user/user.model.js';
import Student from '../student/student.model.js';
import { Course } from '../course/course.model.js';
import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/AppError.js';

// Get all institutes (Super Admin only)
export const getAllInstitutes = catchAsync(async (req, res, next) => {
  const institutes = await Institute.find().sort({ createdAt: -1 });

  // Let's add some statistics to each institute for the Super Admin dashboard!
  const richInstitutes = await Promise.all(
    institutes.map(async (inst) => {
      const studentCount = await Student.countDocuments({ institute: inst._id });
      const courseCount = await Course.countDocuments({ institute: inst._id });
      const teacherCount = await User.countDocuments({ institute: inst._id, role: 'Teacher' });
      
      const adminUser = await User.findOne({ institute: inst._id, role: 'Institute Admin' });

      return {
        ...inst.toObject(),
        stats: {
          students: studentCount,
          courses: courseCount,
          teachers: teacherCount,
        },
        admin: adminUser ? { name: adminUser.name, email: adminUser.email } : null,
      };
    })
  );

  res.status(200).json({
    status: 'success',
    results: richInstitutes.length,
    data: {
      institutes: richInstitutes,
    },
  });
});

// Create manual institute (Super Admin only)
export const createInstitute = catchAsync(async (req, res, next) => {
  const { name, code, address, contactEmail } = req.body;

  const existing = await Institute.findOne({ code: code.toUpperCase() });
  if (existing) {
    return next(new AppError('An institute with this code already exists.', 400));
  }

  const institute = await Institute.create({
    name,
    code,
    address,
    contactEmail,
  });

  res.status(201).json({
    status: 'success',
    data: {
      institute,
    },
  });
});
