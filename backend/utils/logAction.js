import AuditLog from '../models/AuditLog.js';

export const logAction = async (userId, action, meta = {}) => {
  try {
    await AuditLog.create({ user: userId, action, meta });
  } catch (error) {
    console.error('Failed to log action:', error.message);
  }
};
