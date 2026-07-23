import mongoose from 'mongoose';

const instituteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide an institute name'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Please provide an institute unique code'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    address: {
      type: String,
      trim: true,
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
);

const Institute = mongoose.model('Institute', instituteSchema);

export default Institute;
