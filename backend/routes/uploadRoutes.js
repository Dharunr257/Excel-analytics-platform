import express from 'express';
import multer from 'multer';
import path from 'path';
import xlsx from 'xlsx';
import fs from 'fs';
import { cloudinary } from '../utils/cloudinary.js';
import { protect } from '../middlewares/authMiddleware.js';
import { generateAISummary } from '../controllers/uploadController.js';
import Upload from '../models/Upload.js';
import axios from 'axios';
import os from 'os';
import { v4 as uuidv4 } from 'uuid'; 
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// Multer disk storage setup
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

// ✅ POST: Upload Excel to Cloudinary
router.post('/', protect, upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'No file received' });

    // Read Excel headers
    const workbook = xlsx.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    const headers = jsonData[0] || [];

    if (!headers.length) {
      return res.status(400).json({ message: 'No headers found in Excel file.' });
    }

    // Upload file to Cloudinary
    const cloudRes = await cloudinary.uploader.upload(file.path, {
      folder: 'excel_uploads',
      resource_type: 'raw',
    });

    // Delete local file after upload
    fs.unlinkSync(file.path);

    // Save metadata in DB
    const uploadEntry = await Upload.create({
      user: req.user._id,
      fileName: file.originalname,
      filePath: cloudRes.secure_url,      // Public URL
      columns: headers,
      cloudinary_id: cloudRes.public_id,  // 🔁 Needed for future deletion
    });

    res.status(201).json({
      message: 'File uploaded successfully',
      upload: uploadEntry,
      columns: headers,
    });
  } catch (error) {
    console.error('Upload failed:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

// ✅ GET: All uploads by user
router.get('/history', protect, async (req, res) => {
  try {
    const uploads = await Upload.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(uploads);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load history' });
  }
});

// ✅ GET: Preview Excel data
router.get('/preview/:id', protect, async (req, res) => {
  try {
    const upload = await Upload.findById(req.params.id);
    if (!upload) return res.status(404).json({ message: 'File not found in DB' });

    // ✅ Download file from Cloudinary as buffer
    const response = await axios.get(upload.filePath, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');

    // ✅ Write buffer to temp file
    const tempPath = path.join(os.tmpdir(), `${uuidv4()}.xlsx`);
    fs.writeFileSync(tempPath, buffer);

    // ✅ Read Excel file
    const workbook = xlsx.readFile(tempPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet); // [{...}, {...}]
    const headers = Object.keys(jsonData[0] || {});

    // ✅ Cleanup temp file
    fs.unlinkSync(tempPath);

    // ✅ Respond
    res.json({ rows: jsonData, columns: headers });
  } catch (error) {
    console.error('❌ Preview failed:', error);
    res.status(500).json({ message: 'Preview failed', error: error.message });
  }
});

// ✅ DELETE: Delete file from Cloudinary + DB
router.delete('/:id', protect, async (req, res) => {
  try {
    const upload = await Upload.findById(req.params.id);
    if (!upload) return res.status(404).json({ message: 'File not found in DB' });

    const isOwner = upload.user.toString() === req.user._id.toString();
    const isAdmin = req.user.isAdmin;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Unauthorized to delete this file' });
    }

    // Delete from Cloudinary if uploaded
    if (upload.cloudinary_id) {
      await cloudinary.uploader.destroy(upload.cloudinary_id, { resource_type: 'raw' });
    }

    // Fallback: Delete local file if it exists
    if (fs.existsSync(upload.filePath)) {
      fs.unlinkSync(upload.filePath);
    }

    await Upload.deleteOne({ _id: upload._id });
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete file', error: error.message });
  }
});

// ✅ GET: Download file (redirects if Cloudinary)
router.get('/download/:id', protect, async (req, res) => {
  try {
    const upload = await Upload.findById(req.params.id);
    if (!upload) return res.status(404).json({ message: 'File not found in DB' });

    const isOwner = upload.user.toString() === req.user._id.toString();
    const isAdmin = req.user.isAdmin;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Unauthorized to download this file' });
    }

    if (upload.filePath.startsWith('http')) {
      return res.redirect(upload.filePath); // ✅ Redirect to Cloudinary file
    }

    const filePath = path.resolve(upload.filePath);
    if (fs.existsSync(filePath)) {
      return res.download(filePath, upload.fileName); // Local fallback
    }

    res.status(404).json({ message: 'File not found on disk or cloud' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to download file' });
  }
});

// ✅ GET: Get upload metadata by ID (used in Analyze.jsx)
router.get('/:id', protect, async (req, res) => {
  try {
    const upload = await Upload.findById(req.params.id);
    if (!upload) return res.status(404).json({ message: 'File not found' });

    // Optional: restrict access to owner/admin
    const isOwner = upload.user.toString() === req.user._id.toString();
    const isAdmin = req.user.isAdmin;
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Unauthorized access to file' });
    }

    res.json(upload);
  } catch (error) {
    console.error('Fetch upload metadata failed:', error);
    res.status(500).json({ message: 'Failed to fetch file metadata' });
  }
});

// routes/uploadRoutes.js
router.post('/:id/ai-summary', protect, generateAISummary);

router.post('/test-ai', async (req, res) => {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ error: 'Missing OpenRouter API key' });
    }

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openrouter/auto',
        messages: [{ role: 'user', content: 'Say hello!' }],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json({ success: true, response: response.data });
  } catch (error) {
    console.error('❌ Test AI call failed:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

export default router;
