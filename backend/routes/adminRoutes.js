import express from 'express';
import {
  getAllUsers,
  deleteUser,
  getStats,
  getAuditLogs,
  getUserUploadCounts,
  getAllUploads,
  deleteFileById,
  getAllFiles
} from '../controllers/adminController.js';

import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();


router.use(protect, adminOnly);


router.get('/users', getAllUsers);
router.delete('/user/:id', deleteUser);
router.get('/stats', getStats);
router.get('/logs', getAuditLogs);
router.get('/user-uploads-count', getUserUploadCounts);
router.get('/uploads', getAllUploads);
router.get('/files', getAllFiles);
router.delete('/file/:id', deleteFileById);


export default router;
