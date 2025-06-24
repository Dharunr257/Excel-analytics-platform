import User from '../models/User.js';
import Upload from '../models/Upload.js';
import AuditLog from '../models/AuditLog.js';
import fs from 'fs';

// 🔹 Get all users
export const getAllUsers = async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
};

// 🔹 Delete user by ID
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.deleteOne();
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

// 🔹 Get dashboard stats
export const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ isAdmin: true });
    const totalFiles = await Upload.countDocuments();

    res.json({
      totalUsers,
      totalAdmins,
      totalFiles,
    });
  } catch (error) {
    console.error("Failed to fetch admin stats:", error);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};

// 🔹 View audit logs
export const getAuditLogs = async (req, res) => {
  const logs = await AuditLog.find().sort({ createdAt: -1 });
  res.json(logs);
};

export const getUserUploadCounts = async (req, res) => {
  try {
    const users = await User.find().select('_id name email isAdmin');

    const uploads = await Upload.aggregate([
      { $group: { _id: '$user', count: { $sum: 1 } } }
    ]);

    const uploadMap = {};
    uploads.forEach(u => {
      uploadMap[u._id.toString()] = u.count;
    });

    const result = users.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      uploadCount: uploadMap[user._id.toString()] || 0
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user upload counts' });
  }
};

// 📁 Get all uploaded files
export const getAllUploads = async (req, res) => {
  try {
    const uploads = await Upload.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json(uploads);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch uploads' });
  }
};

// 🗑️ Delete a file by ID (Admin)
export const deleteFileById = async (req, res) => {
  try {
    const file = await Upload.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Delete from disk
    if (fs.existsSync(file.filePath)) {
      fs.unlinkSync(file.filePath);
    }

    await file.deleteOne();

    // Log it
    await AuditLog.create({
      action: `Deleted file "${file.fileName}"`,
      user: req.user._id
    });

    res.json({ message: 'File deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete file' });
  }
};

export const getAllFiles = async (req, res) => {
  try {
    const uploads = await Upload.find({})
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    const files = uploads.map((file) => ({
      _id: file._id,
      fileName: file.fileName,
      createdAt: file.createdAt,
      userName: file.user?.name || "Unknown",
      userEmail: file.user?.email || "N/A",
    }));

    res.json(files);
  } catch (error) {
    console.error("Failed to fetch all files", error);
    res.status(500).json({ message: "Error fetching files" });
  }
};