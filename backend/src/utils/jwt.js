import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

export const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );
};

export const saveRefreshToken = async (userId, token) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await query(
    `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)`,
    [userId, token, expiresAt]
  );
};

export const invalidateRefreshToken = async (token) => {
  await query(`DELETE FROM refresh_tokens WHERE token = $1`, [token]);
};

export const verifyRefreshToken = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  const result = await query(
    `SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()`,
    [token]
  );
  if (result.rows.length === 0) {
    throw new Error('Refresh token not found or expired');
  }
  return decoded;
};

export const generateToken = (length = 64) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
