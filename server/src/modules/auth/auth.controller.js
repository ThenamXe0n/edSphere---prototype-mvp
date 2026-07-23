import User from '../user/user.model.js';
import Institute from '../institute/institute.model.js';
import AppError from '../../utils/AppError.js';
import catchAsync from '../../utils/catchAsync.js';
import { sendTokens, generateAccessToken } from '../../utils/tokens.js';
import jwt from 'jsonwebtoken';

// Public registration (Creates Institute + Institute Admin)
export const register = catchAsync(async (req, res, next) => {
  const { name, email, password, instituteName, instituteCode, address, contactEmail } = req.body;

  // 1. Check if email already registered
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('Email address is already in use.', 400));
  }

  // 2. Check if institute code already registered
  const existingInstitute = await Institute.findOne({ code: instituteCode.toUpperCase() });
  if (existingInstitute) {
    return next(new AppError('An institute with this code already exists.', 400));
  }

  // 3. Create Institute
  const institute = await Institute.create({
    name: instituteName,
    code: instituteCode,
    address,
    contactEmail: contactEmail || email,
  });

  // 4. Create User (Institute Admin)
  const user = await User.create({
    name,
    email,
    password,
    role: 'Institute Admin',
    institute: institute._id,
  });

  // 5. Send access token and refresh token
  sendTokens(user, 201, res);
});

// Login User
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1. Verify if email and password are provided
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // 2. Find user & select password explicitly
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3. Check if user is active
  if (!user.isActive) {
    return next(new AppError('Your account has been deactivated. Contact Admin.', 403));
  }

  // 4. Send access and refresh tokens
  sendTokens(user, 200, res);
});

// Refresh Access Token
export const refreshToken = catchAsync(async (req, res, next) => {
  const refreshCookie = req.cookies.refreshToken;

  if (!refreshCookie) {
    return next(new AppError('No refresh token provided', 401));
  }

  // Verify token
  let decoded;
  try {
    decoded = jwt.verify(refreshCookie, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    return next(new AppError('Invalid or expired refresh token. Please login again.', 401));
  }

  // Find user
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new AppError('User belonging to this token no longer exists.', 401));
  }

  // Check if active
  if (!user.isActive) {
    return next(new AppError('Your account has been deactivated.', 403));
  }

  // Generate new access token
  const token = generateAccessToken(user);

  res.status(200).json({
    status: 'success',
    token,
  });
});

// Get Current User details
export const me = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate('institute');
  
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

// Logout User
export const logout = catchAsync(async (req, res, next) => {
  res.cookie('refreshToken', 'loggedout', {
    httpOnly: true,
    expires: new Date(Date.now() + 10 * 1000), // expires in 10 seconds
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
});

