import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Lesson title is required'],
    trim: true,
  },
  videoUrl: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  duration: {
    type: Number, // duration in minutes
    default: 0,
  },
  order: {
    type: Number,
    default: 0,
  },
});

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // references User with role 'Teacher'
      required: [true, 'An instructor (Teacher) is required'],
    },
    thumbnail: {
      type: String,
      default: '',
    },
    lessons: [lessonSchema],
    status: {
      type: String,
      enum: ['Draft', 'Published'],
      default: 'Draft',
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

const courseProgressSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    completedLessons: [
      {
        type: mongoose.Schema.Types.ObjectId, // references subdocument _id inside course.lessons
      },
    ],
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a student has only one progress record per course
courseProgressSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

export const Course = mongoose.model('Course', courseSchema);
export const CourseProgress = mongoose.model('CourseProgress', courseProgressSchema);
