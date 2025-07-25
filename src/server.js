require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/dbConfig');
const {logger} = require('./utils/logger');
const routes = require('./routes');

const errorHandler = require('./middleware/errorHandlerMiddleware');
const ApiError = require('./utils/ApiError');

const app = express();

// Init connection to MongoDB
connectDB();

// MIDDLEWARES
// Security Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Adjust this to your frontend URL
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


// API ROUTES
app.use('/api/v1', routes);



// Static Fiiles
app.use('/uploads', express.static('uploads', {
  maxAge: '1d', // Cache static files for 1 day
  etag: true, 
}));



// 404 Errors
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