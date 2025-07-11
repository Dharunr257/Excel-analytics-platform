import mongoose from 'mongoose';

const uploadSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  filePath: {
    type: String, // Secure URL from Cloudinary
    required: true,
  },
  cloudinary_id: {
    type: String, // ✅ Needed for deletion from Cloudinary
    required: false,
  },
  columns: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Upload = mongoose.model('Upload', uploadSchema);

export default Upload;
