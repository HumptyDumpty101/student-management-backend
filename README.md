# Student Management System - Backend

This is the backend API server for the Student Management System built with Node.js, Express.js, and MongoDB.

## Live API Endpoint

The backend is hosted at: https://student.rohithks.com/api/v1

## Features

- RESTful API with Express.js
- MongoDB database with Mongoose ODM
- JWT-based authentication with refresh tokens
- Role-based access control for staff permissions
- File upload support for profile photos
- Request validation with Joi
- Comprehensive error handling
- Logging with Winston
- CORS configuration for cross-origin requests

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi
- **File Upload**: Multer
- **Logging**: Winston
- **Password Hashing**: Bcrypt
- **Environment**: dotenv

## Prerequisites

- Node.js (version 16 or higher)
- MongoDB (local installation or cloud instance like MongoDB Atlas)
- npm or yarn package manager

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment variables file (see Environment Setup section below)

4. Start the development server:
```bash
npm run dev
```

The server will start on port 5000 by default.

## Environment Setup

Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/student-management

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-complex
JWT_REFRESH_SECRET=your-refresh-token-secret-here-also-make-it-complex
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# File Upload Configuration
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
```

### Production Environment Variables

For production deployment, update the following:

```env
NODE_ENV=production
FRONTEND_URL=https://student.rohithks.com
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/student-management
```

## Available Scripts

```bash
# Start development server with nodemon
npm run dev

# Start production server
npm start

# Install dependencies
npm install
```

## API Documentation

### Base URL
- Development: `http://localhost:5000/api/v1`
- Production: `https://student.rohithks.com/api/v1`

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | User login |
| POST | `/auth/logout` | User logout |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/change-password` | Change user password |
| GET | `/auth/me` | Get current user info |

### Student Management Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/students` | Get all students with pagination |
| POST | `/students` | Create new student |
| GET | `/students/:id` | Get student by ID |
| PUT | `/students/:id` | Update student |
| DELETE | `/students/:id` | Delete student |

### Staff Management Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/staff` | Get all staff members |
| POST | `/staff` | Create new staff member |
| GET | `/staff/:id` | Get staff member by ID |
| PUT | `/staff/:id` | Update staff member basic info |
| PUT | `/staff/:id/permissions` | Update staff permissions |
| DELETE | `/staff/:id` | Delete staff member |

### User Profile Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/profile` | Get user profile |
| PUT | `/users/profile` | Update user profile |
| POST | `/users/profile/avatar` | Upload profile photo |

## Database Schema

### Student Model
- Personal information (name, email, dateOfBirth, gender)
- Academic details (studentId, standard, section, rollNumber)
- Contact information (address, emergency contact)
- Parent information (father, mother details)
- Academic performance (grades, percentage)

### Staff Model  
- Personal information (name, email, phone)
- Professional details (department, isActive)
- Permissions for students and staff management
- Authentication credentials

### User Model
- Basic user information for authentication
- Profile photo support
- Role-based access control

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── dbConfig.js          # Database connection
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── studentController.js # Student CRUD operations
│   │   ├── staffController.js   # Staff CRUD operations
│   │   └── userController.js    # User profile management
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT verification
│   │   ├── errorHandlerMiddleware.js # Global error handling
│   │   └── validationMiddleware.js   # Request validation
│   ├── models/
│   │   ├── Student.js           # Student database model
│   │   ├── Staff.js             # Staff database model
│   │   └── User.js              # User database model
│   ├── routes/
│   │   ├── authRoutes.js        # Authentication routes
│   │   ├── studentRoutes.js     # Student routes
│   │   ├── staffRoutes.js       # Staff routes
│   │   ├── userRoutes.js        # User routes
│   │   └── index.js             # Route aggregation
│   ├── utils/
│   │   ├── ApiError.js          # Custom error class
│   │   ├── logger.js            # Winston logger setup
│   │   └── validators.js        # Joi validation schemas
│   └── server.js                # Express server setup
├── uploads/                     # File upload directory
├── .env                         # Environment variables
├── package.json                 # Dependencies and scripts
└── README.md                    # This file
```

## Deployment

### Using PM2 (Recommended)

1. Install PM2 globally:
```bash
npm install -g pm2
```

2. Start the application:
```bash
pm2 start src/server.js --name "student-backend"
```

3. Save PM2 configuration:
```bash
pm2 save
pm2 startup
```

### Using Docker

Create a `Dockerfile`:
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t student-backend .
docker run -p 5000:5000 student-backend
```

## Security Features

- JWT-based authentication with access and refresh tokens
- Password hashing with bcrypt
- Request validation and sanitization
- CORS configuration for cross-origin requests
- File upload restrictions and validation
- MongoDB injection protection

## Troubleshooting

### Common Issues

**Database Connection Failed**
- Verify MongoDB is running
- Check MONGODB_URI in .env file
- Ensure network connectivity to database

**JWT Token Errors**
- Verify JWT_SECRET and JWT_REFRESH_SECRET are set
- Check token expiration settings
- Ensure frontend is sending tokens correctly

**CORS Errors**
- Verify FRONTEND_URL matches your frontend domain
- Check CORS middleware configuration
- Ensure credentials are included in requests

**File Upload Issues**
- Check UPLOAD_DIR permissions
- Verify MAX_FILE_SIZE setting
- Ensure upload directory exists

### Development Tips

- Use Postman or similar tool to test API endpoints
- Check server logs for detailed error messages
- Verify environment variables are loaded correctly
- Monitor database connections and queries

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.