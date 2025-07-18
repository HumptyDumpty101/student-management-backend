const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateAccessToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
    permissions: user.permissions
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '15m',
    issuer: 'student-management-system',
    audience: 'student-management-client'
  });
};

const generateRefreshToken = () => {
  // Generate cryptographically secure random token
  return crypto.randomBytes(32).toString('hex');
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET, {
    issuer: 'student-management-system',
    audience: 'student-management-client'
  });
};

const getTokenFromCookie = (req) => {
  return req.cookies?.accessToken || null;
};

const setTokenCookie = (res, token) => {
  res.cookie('accessToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000 // 15 minutes
  });
};

const clearTokenCookie = (res) => {
  res.clearCookie('accessToken');
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  getTokenFromCookie,
  setTokenCookie,
  clearTokenCookie
};