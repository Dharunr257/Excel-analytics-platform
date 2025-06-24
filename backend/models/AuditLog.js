// models/AuditLog.js
import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    action: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export default mongoose.model('AuditLog', auditLogSchema);
