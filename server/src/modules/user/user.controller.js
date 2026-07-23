import User from './user.model.js';
import AppError from '../../utils/AppError.js';
import catchAsync from '../../utils/catchAsync.js';

// Create a Teacher (Admin or Super Admin only)
export const createTeacher = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Determine institute
  const instituteId = req.user.role === 'Super Admin' ? req.body.institute : req.user.institute;
  if (!instituteId) {
    return next(new AppError('Institute ID is required', 400));
  }

  // Check email conflict
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('A user with this email address already exists.', 400));
  }

  const teacher = await User.create({
    name,
    email,
    password,
    role: 'Teacher',
    institute: instituteId,
  });

  teacher.password = undefined;

  res.status(201).json({
    status: 'success',
    data: {
      teacher,
    },
  });
});

// List all teachers (Isolated by institute)
export const getTeachers = catchAsync(async (req, res, next) => {
  const query = { role: 'Teacher' };

  if (req.user.role !== 'Super Admin') {
    query.institute = req.user.institute;
  } else if (req.query.institute) {
    query.institute = req.query.institute;
  }

  const teachers = await User.find(query).select('-password').sort({ name: 1 });

  res.status(200).json({
    status: 'success',
    results: teachers.length,
    data: {
      teachers,
    },
  });
});
