import jwt from 'jsonwebtoken';
import User from '../modules/user/user.model.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

export const authenticate = catchAsync(async (req, res, next) => {
  let token;

  // 1) Extract token from Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in. Please log in to get access.', 401)
    );
  }

  // 2) Verify token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Your token has expired. Please log in again.', 401));
    }
    return next(new AppError('Invalid token. Please log in again.', 401));
  }

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token no longer exists.', 401)
    );
  }

  // 4) Check if user is active
  if (!currentUser.isActive) {
    return next(new AppError('This user account is suspended.', 403));
  }

  // 5) Grant access to protected route, store user on request
  req.user = currentUser;
  next();
});

export const authorize = (...roles) => {
  return (req, res, next) => {
    // If roles list is provided and user role is not inside, throw error
    if (roles.length && !roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};
