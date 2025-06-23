import express from 'express';
import multer from 'multer';
import path from 'path';
import xlsx from 'xlsx';
import fs from 'fs';

import { protect } from '../middlewares/authMiddleware.js';
import Upload from '../models/Upload.js';

const router = express.Router();

// Setup Multer for disk storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname);
  if (ext !== '.xls' && ext !== '.xlsx') {
    return cb(new Error('Only Excel files are allowed'));
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter });

// @route POST /api/upload
// @desc Upload Excel file
// @access Private
router.post('/', protect, upload.single('file'), async (req, res) => {

  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'No file received' });
    }

    // Parse the Excel file using SheetJS
    const workbook = xlsx.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    const headers = jsonData[0];

    const uploadEntry = await Upload.create({
      user: req.user._id,
      fileName: file.originalname,
      filePath: file.path,
      columns: headers,
    });

    res.status(201).json({
      message: 'File uploaded successfully',
      upload: uploadEntry,
      columns,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

// @route GET /api/upload/history
// @desc Get all uploads by the logged-in user
// @access Private
router.get('/history', protect, async (req, res) => {
  try {
    const uploads = await Upload.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(uploads);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load history' });
  }
});

export default router;


// @route GET /api/upload/preview/:id
// @desc Return parsed sheet data with columns
// @access Private
router.get('/preview/:id', protect, async (req, res) => {
  try {
    const upload = await Upload.findById(req.params.id);
    if (!upload) return res.status(404).json({ message: 'File not found' });

    const workbook = xlsx.readFile(upload.filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet); // Array of objects
    const headers = Object.keys(jsonData[0] || {});

    res.json({ rows: jsonData, columns: headers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Preview failed', error: error.message });
  }
});


// @route GET /api/upload/:id
// @desc Get single upload by ID
// @access Private
router.get('/:id', protect, async (req, res) => {
  try {
    const upload = await Upload.findById(req.params.id);
    if (!upload || upload.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'File not found or unauthorized' });
    }
    res.json(upload);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch file info' });
  }
});


// @route   DELETE /api/upload/:id
// @desc    Delete an uploaded file by ID (and from disk)
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const upload = await Upload.findById(req.params.id);
    if (!upload) {
      return res.status(404).json({ message: 'File not found in DB' });
    }

    // Check authorization
    if (upload.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Delete from disk
    if (fs.existsSync(upload.filePath)) {
      fs.unlinkSync(upload.filePath);
    } else {
      console.warn("⚠️ File not found on disk:", upload.filePath);
    }

    // Delete from DB
    await Upload.deleteOne({ _id: req.params.id });

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error("❌ File delete failed:", error);
    res.status(500).json({ message: 'Failed to delete file', error: error.message });
  }
});

// @route   GET /api/upload/download/:id
// @desc    Download uploaded file by ID
// @access  Private
router.get('/download/:id', protect, async (req, res) => {
  try {
    const upload = await Upload.findById(req.params.id);
    if (!upload || upload.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'File not found or unauthorized' });
    }

    const filePath = path.resolve(upload.filePath);
    if (fs.existsSync(filePath)) {
      res.download(filePath, upload.fileName);
    } else {
      res.status(404).json({ message: 'File not found on disk' });
    }
  } catch (error) {
    console.error("File download error:", error);
    res.status(500).json({ message: 'Failed to download file' });
  }
});

