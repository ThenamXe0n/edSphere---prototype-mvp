import { validationResult } from 'express-validator';

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg).join('. ');
    return res.status(400).json({
      status: 'fail',
      message: errorMessages,
      errors: errors.array(),
    });
  }
  next();
};

export default validate;
