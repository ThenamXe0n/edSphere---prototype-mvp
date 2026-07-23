import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
    },
    course: {
      type: String,
      trim: true,
    },
    institute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institute',
      required: true,
    },
    profileImage: {
      type: String,
      default: '',
    },
    admissionNumber: {
      type: String,
      required: [true, 'Admission number is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Suspended', 'Alumni'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness of admissionNumber only within the same institute
studentSchema.index({ institute: 1, admissionNumber: 1 }, { unique: true });

const Student = mongoose.model('Student', studentSchema);

export default Student;
