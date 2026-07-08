import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import {
  generateAccessToken, generateRefreshToken,
  saveRefreshToken, verifyRefreshToken, invalidateRefreshToken,
} from '../utils/jwt.js';

const isProduction = process.env.NODE_ENV === 'production';

const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};

export const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;
    const existing = await query(`SELECT id FROM users WHERE email = $1`, [email.toLowerCase()]);
    if (existing.rows.length > 0) return res.status(409).json({ error: 'Е-маил адресата е веќе во употреба' });
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, role, is_active) VALUES ($1,$2,$3,$4,$5,'owner',true) RETURNING id, email, first_name, last_name, role`,
      [email.toLowerCase(), passwordHash, firstName, lastName, phone || null]
    );
    const user = result.rows[0];
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);
    await saveRefreshToken(user.id, refreshToken);
    setRefreshCookie(res, refreshToken);
    res.status(201).json({
      user: { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name, role: user.role },
      accessToken,
    });
  } catch (err) { next(err); }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await query(
      `SELECT id, email, password_hash, first_name, last_name, role, is_active FROM users WHERE email = $1`,
      [email.toLowerCase()]
    );
    const user = result.rows[0];
    if (!user || !user.password_hash) return res.status(401).json({ error: 'Невалидни податоци' });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Невалидни податоци' });
    if (!user.is_active) return res.status(401).json({ error: 'Сметката е деактивирана' });
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);
    await saveRefreshToken(user.id, refreshToken);
    setRefreshCookie(res, refreshToken);
    res.json({
      user: { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name, role: user.role },
      accessToken,
    });
  } catch (err) { next(err); }
};

export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ error: 'Нема refresh token' });
    const decoded = await verifyRefreshToken(token);
    const userResult = await query(
      `SELECT id, email, first_name, last_name, role, is_active FROM users WHERE id = $1`,
      [decoded.userId]
    );
    const user = userResult.rows[0];
    if (!user || !user.is_active) return res.status(401).json({ error: 'Корисникот не е пронајден' });
    await invalidateRefreshToken(token);
    const newAccessToken = generateAccessToken(user.id, user.role);
    const newRefreshToken = generateRefreshToken(user.id);
    await saveRefreshToken(user.id, newRefreshToken);
    setRefreshCookie(res, newRefreshToken);
    res.json({
      user: { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name, role: user.role },
      accessToken: newAccessToken,
    });
  } catch (err) {
    res.clearCookie('refreshToken');
    res.status(401).json({ error: 'Невалиден или истечен token' });
  }
};

export const logout = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) await invalidateRefreshToken(token);
    res.clearCookie('refreshToken');
    res.json({ message: 'Одјавен' });
  } catch (err) { next(err); }
};

export const getMe = async (req, res) => {
  res.json({
    user: { id: req.user.id, email: req.user.email, firstName: req.user.first_name, lastName: req.user.last_name, role: req.user.role },
  });
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await query(`SELECT id FROM users WHERE email = $1`, [email.toLowerCase()]);
    if (result.rows.length === 0) return res.json({ message: 'Ако е-маилот постои, ќе добиеш линк.' });
    const userId = result.rows[0].id;
    const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
    await query(`DELETE FROM password_resets WHERE user_id = $1`, [userId]);
    await query(`INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL '1 hour')`, [userId, token]);
    const resetLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
    res.json({ message: 'Токенот е генериран (DEV режим)', resetLink, token });
  } catch (err) { next(err); }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const result = await query(
      `SELECT pr.user_id FROM password_resets pr WHERE pr.token = $1 AND pr.expires_at > NOW() AND pr.used = FALSE`,
      [token]
    );
    if (result.rows.length === 0) return res.status(400).json({ error: 'Токенот е невалиден или истечен' });
    const userId = result.rows[0].user_id;
    const passwordHash = await bcrypt.hash(password, 12);
    await query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [passwordHash, userId]);
    await query(`UPDATE password_resets SET used = TRUE WHERE token = $1`, [token]);
    res.json({ message: 'Лозинката е успешно променета' });
  } catch (err) { next(err); }
};
