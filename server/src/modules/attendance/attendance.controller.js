import Attendance from './attendance.model.js';
import Student from '../student/student.model.js';
import { Course } from '../course/course.model.js';
import AppError from '../../utils/AppError.js';
import catchAsync from '../../utils/catchAsync.js';

// Record or Update Attendance (Bulk Upsert)
export const recordAttendance = catchAsync(async (req, res, next) => {
  const { courseId, date, records } = req.body;

  // Determine institute
  const instituteId = req.user.role === 'Super Admin' ? req.body.institute : req.user.institute;
  if (!instituteId) {
    return next(new AppError('Institute ID is required', 400));
  }

  // Verify course exists and isolation
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }
  if (req.user.role !== 'Super Admin' && course.institute.toString() !== req.user.institute.toString()) {
    return next(new AppError('You do not have permission to log attendance for this course', 403));
  }

  // Normalize date to start of day (UTC)
  const attendanceDate = new Date(date);
  attendanceDate.setUTCHours(0, 0, 0, 0);

  // Bulk write operations
  const bulkOperations = records.map((rec) => {
    return {
      updateOne: {
        filter: {
          studentId: rec.studentId,
          courseId,
          date: attendanceDate,
        },
        update: {
          status: rec.status,
          institute: instituteId,
        },
        upsert: true,
      },
    };
  });

  await Attendance.bulkWrite(bulkOperations);

  res.status(200).json({
    status: 'success',
    message: `Attendance successfully recorded for ${records.length} students.`,
  });
});

// Get Student Attendance & Statistics
export const getStudentAttendance = catchAsync(async (req, res, next) => {
  let studentId = req.params.studentId;

  // If requester is a Student, force them to view only their own records
  if (req.user.role === 'Student') {
    const studentProfile = await Student.findOne({ userId: req.user._id });
    if (!studentProfile) {
      return next(new AppError('Student profile not found for this user', 404));
    }
    studentId = studentProfile._id;
  } else {
    // If not a student, check student exists and isolation
    const student = await Student.findById(studentId);
    if (!student) {
      return next(new AppError('Student not found', 404));
    }
    if (req.user.role !== 'Super Admin' && student.institute.toString() !== req.user.institute.toString()) {
      return next(new AppError('You do not have permission to view this student\'s attendance', 403));
    }
  }

  // Fetch all attendance logs
  const logs = await Attendance.find({ studentId })
    .populate('courseId', 'title category')
    .sort({ date: -1 });

  // Calculate statistics
  const totalClasses = logs.length;
  const present = logs.filter((log) => log.status === 'Present').length;
  const absent = logs.filter((log) => log.status === 'Absent').length;
  const leave = logs.filter((log) => log.status === 'Leave').length;

  const attendancePercentage =
    totalClasses > 0 ? Math.round((present / totalClasses) * 100) : 0;

  res.status(200).json({
    status: 'success',
    data: {
      stats: {
        totalClasses,
        present,
        absent,
        leave,
        attendancePercentage,
      },
      logs,
    },
  });
});
