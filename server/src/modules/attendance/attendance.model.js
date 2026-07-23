import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Leave'],
      required: [true, 'Status is required'],
    },
    institute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institute',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure only one attendance record exists per student, course, and day
attendanceSchema.index({ studentId: 1, courseId: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
