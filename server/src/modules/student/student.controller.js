import Student from './student.model.js';
import User from '../user/user.model.js';
import AppError from '../../utils/AppError.js';
import catchAsync from '../../utils/catchAsync.js';
import fs from 'fs';
import path from 'path';

// Create Student (Admin Only)
export const createStudent = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, phone, dateOfBirth, gender, course, status, admissionNumber, password } = req.body;

  // Determine institute (prioritize request body for Super Admin, fallback to user profile)
  let instituteId = req.body.institute || req.user?.institute;
  if (instituteId && typeof instituteId === 'object' && instituteId._id) {
    instituteId = instituteId._id;
  }

  if (!instituteId) {
    return next(new AppError('Institute ID is required', 400));
  }


  // Check email uniqueness
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('A user with this email address already exists.', 400));
  }

  // Check admission number uniqueness in this institute
  const existingStudent = await Student.findOne({ institute: instituteId, admissionNumber });
  if (existingStudent) {
    return next(new AppError(`Admission number ${admissionNumber} already exists in this institute`, 400));
  }

  // Default password is the admission number if not provided
  const loginPassword = password || admissionNumber;

  // Create User
  const newUser = await User.create({
    name: `${firstName} ${lastName}`,
    email,
    password: loginPassword,
    role: 'Student',
    institute: instituteId,
  });

  // Create profile image path
  let profileImage = '';
  if (req.file) {
    profileImage = `/uploads/${req.file.filename}`;
  }

  // Create Student
  const student = await Student.create({
    userId: newUser._id,
    firstName,
    lastName,
    email,
    phone,
    dateOfBirth,
    gender,
    course,
    institute: instituteId,
    profileImage,
    admissionNumber,
    status: status || 'Active',
  });

  res.status(201).json({
    status: 'success',
    data: {
      student,
    },
  });
});

// Get all students (Paginated, Searchable, Filterable, Isolated)
export const getAllStudents = catchAsync(async (req, res, next) => {
  const { search, course, status, page = 1, limit = 10, institute } = req.query;

  // Build filter query
  const query = {};

  // Institute isolation
  if (req.user.role !== 'Super Admin') {
    query.institute = req.user.institute;
  } else if (institute) {
    query.institute = institute;
  }

  // Filtering
  if (course) query.course = course;
  if (status) query.status = status;

  // Search functionality (firstName, lastName, email, admissionNumber)
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { admissionNumber: { $regex: search, $options: 'i' } },
    ];
  }

  // Pagination calculations
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Student.countDocuments(query);

  const students = await Student.find(query)
    .populate('userId', 'name email role isActive')
    .populate('institute', 'name code')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: students.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: {
      students,
    },
  });
});

// Get Student by ID
export const getStudentById = catchAsync(async (req, res, next) => {
  const student = await Student.findById(req.params.id)
    .populate('userId', 'name email role isActive')
    .populate('institute', 'name code');

  if (!student) {
    return next(new AppError('No student found with that ID', 404));
  }

  // Isolation check
  if (req.user.role !== 'Super Admin' && student.institute._id.toString() !== req.user.institute.toString()) {
    return next(new AppError('You do not have permission to view this student', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      student,
    },
  });
});

// Update Student
export const updateStudent = catchAsync(async (req, res, next) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    return next(new AppError('No student found with that ID', 404));
  }

  // Isolation check
  if (req.user.role !== 'Super Admin' && student.institute.toString() !== req.user.institute.toString()) {
    return next(new AppError('You do not have permission to update this student', 403));
  }

  const { firstName, lastName, email, phone, dateOfBirth, gender, course, status, admissionNumber } = req.body;

  // Check email conflict if updated
  if (email && email !== student.email) {
    const emailConflict = await User.findOne({ email });
    if (emailConflict) {
      return next(new AppError('This email is already in use by another account', 400));
    }
  }

  // If admission number is updating, check conflict in the same institute
  if (admissionNumber && admissionNumber !== student.admissionNumber) {
    const numberConflict = await Student.findOne({ institute: student.institute, admissionNumber });
    if (numberConflict) {
      return next(new AppError(`Admission number ${admissionNumber} already exists in this institute`, 400));
    }
  }

  // Update profile image if present
  if (req.file) {
    // Delete old profile image if exists
    if (student.profileImage && student.profileImage.startsWith('/uploads/')) {
      const oldPath = path.join('public', student.profileImage);
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
        } catch (e) {
          console.error(`Failed to delete old profile image: ${e.message}`);
        }
      }
    }
    student.profileImage = `/uploads/${req.file.filename}`;
  }

  // Update Student Fields
  if (firstName) student.firstName = firstName;
  if (lastName) student.lastName = lastName;
  if (email) student.email = email;
  if (phone) student.phone = phone;
  if (dateOfBirth) student.dateOfBirth = dateOfBirth;
  if (gender) student.gender = gender;
  if (course !== undefined) student.course = course;
  if (status) student.status = status;
  if (admissionNumber) student.admissionNumber = admissionNumber;

  await student.save();

  // Update corresponding User
  const user = await User.findById(student.userId);
  if (user) {
    if (firstName || lastName) {
      user.name = `${student.firstName} ${student.lastName}`;
    }
    if (email) {
      user.email = email;
    }
    if (status) {
      user.isActive = status === 'Active';
    }
    await user.save();
  }

  res.status(200).json({
    status: 'success',
    data: {
      student,
    },
  });
});

// Delete Student
export const deleteStudent = catchAsync(async (req, res, next) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    return next(new AppError('No student found with that ID', 404));
  }

  // Isolation check
  if (req.user.role !== 'Super Admin' && student.institute.toString() !== req.user.institute.toString()) {
    return next(new AppError('You do not have permission to delete this student', 403));
  }

  // Delete profile image if exists
  if (student.profileImage && student.profileImage.startsWith('/uploads/')) {
    const imgPath = path.join('public', student.profileImage);
    if (fs.existsSync(imgPath)) {
      try {
        fs.unlinkSync(imgPath);
      } catch (e) {
        console.error(`Failed to delete profile image: ${e.message}`);
      }
    }
  }

  // Delete User account first
  await User.findByIdAndDelete(student.userId);

  // Delete Student Profile
  await Student.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
