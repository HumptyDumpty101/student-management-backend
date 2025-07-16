const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');   

const generateAccessToken = (user) => {
    const payload = {
        id: user._id,
        email: user.email,
        role: user.role,
        permissions: user.permissions
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRY || '15m',
        issuer: 'student-management-system',
        audience: 'student-management-client'
    });
};

const generateRefreshToken = (user) => {
    // Generate new RT for the user in DB
    const refreshToken = new mongoose.model('RefreshToken')({
        user: user._id,
    });

    return refreshToken;
}

const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET, {
            issuer: 'student-management-system',
            audience: 'student-management-client'
        });
    } catch (error) {
        throw new Error('Invalid access token');
    }
}

const getTokenFromCookie = (req) => {
    const token = req.cookies?.accessToken || null;
}

const setTokenCookie = (res, token) => {
    res.cookie('accessToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: process.env.JWT_ACCESS_TOKEN_EXPIRY ? parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRY) * 60 * 1000 : 15 * 60 * 1000 // Default to 15 minutes
    });
}

const clearTokenCookie = (res) => {
    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
}

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    getTokenFromCookie,
    setTokenCookie,
    clearTokenCookie
}