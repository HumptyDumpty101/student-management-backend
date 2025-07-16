require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const {logger} = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const ApiError = require('./utils/ApiError');

const app = express();

// Init connection to MongoDB
connectDB();

// MIDDLEWARES
// Security Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Adjust this to your frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Body Parsing Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request Logging Middleware (Dev Only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
  });
}

// Static Fiiles
app.use('/uploads', express.static('uploads', {
  maxAge: '1d', // Cache static files for 1 day
  etag: true, 
}));

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  })
});

// 404 Errors
// app.all('*', (req, res, next) => {
//   next(ApiError.notFound(`Route ${req.originalUrl} not found`));
// });
app.use((req, res, next) => {
  const error = ApiError.notFound(`Route ${req.originalUrl} not found`);
  next(error);
});



// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});