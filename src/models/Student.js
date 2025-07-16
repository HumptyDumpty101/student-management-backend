const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    firstName: { 
      type: String, 
      required: [true, 'First name is required'], 
      trim: true,
      minlength: [2, 'First name must be at least 2 characters'],
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: { 
      type: String, 
      required: [true, 'Last name is required'], 
      trim: true,
      minlength: [2, 'Last name must be at least 2 characters'],
      maxlength: [50, 'Last name cannot exceed 50 characters']
    }
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 
      'Please enter a valid email address'
    ]
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [5, 'Age must be at least 5'],
    max: [25, 'Age cannot exceed 25']
  },
  gender: {
    type: String,
    enum: {
      values: ['Male', 'Female', 'Other'],
      message: 'Gender must be Male, Female, or Other'
    },
    required: [true, 'Gender is required']
  },
  grade: {
    type: String,
    required: [true, 'Grade is required'],
    enum: {
      values: ['KG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'],
      message: 'Please select a valid grade'
    }
  },
  section: {
    type: String,
    required: [true, 'Section is required'],
    enum: {
      values: ['A', 'B', 'C', 'D'],
      message: 'Section must be A, B, C, or D'
    }
  },
  rollNumber: {
    type: Number,
    required: [true, 'Roll number is required'],
    min: [1, 'Roll number must be positive']
  },
  overallGrade: {
    type: String,
    enum: {
      values: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'],
      message: 'Please select a valid grade'
    },
    default: 'C'
  },
  overallPercentage: {
    type: Number,
    min: [0, 'Percentage cannot be negative'],
    max: [100, 'Percentage cannot exceed 100'],
    default: 0
  },
  contactInfo: {
    phone: { 
      type: String, 
      required: [true, 'Phone number is required'],
      match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
    },
    address: {
      street: { 
        type: String, 
        required: [true, 'Street address is required'],
        trim: true
      },
      city: { 
        type: String, 
        required: [true, 'City is required'],
        trim: true
      },
      state: { 
        type: String, 
        required: [true, 'State is required'],
        trim: true
      },
      pinCode: { 
        type: String, 
        required: [true, 'Pin code is required'],
        match: [/^[0-9]{6}$/, 'Please enter a valid 6-digit ZIP code']
      }
    },
    emergencyContact: {
      name: { 
        type: String, 
        required: [true, 'Emergency contact name is required'],
        trim: true
      },
      relationship: {
        type: String,
        required: [true, 'Emergency contact relationship is required'],
        enum: {
          values: ['Father', 'Mother', 'Guardian', 'Sibling', 'Other'],
          message: 'Please select a valid relationship'
        }
      },
      phone: { 
        type: String, 
        required: [true, 'Emergency contact phone is required'],
        match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
      }
    }
  },
  parentInfo: {
    father: {
      name: { 
        type: String, 
        required: [true, 'Father name is required'],
        trim: true
      },
      occupation: { 
        type: String, 
        trim: true,
        default: ''
      },
      phone: { 
        type: String, 
        required: [true, 'Father phone is required'],
        match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
      },
      email: { 
        type: String, 
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address'],
        default: ''
      }
    },
    mother: {
      name: { 
        type: String, 
        required: [true, 'Mother name is required'],
        trim: true
      },
      occupation: { 
        type: String, 
        trim: true,
        default: ''
      },
      phone: { 
        type: String, 
        required: [true, 'Mother phone is required'],
        match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
      },
      email: { 
        type: String, 
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address'],
        default: ''
      }
    }
  },
  profilePhoto: {
    url: { type: String, default: null },
    filename: { type: String, default: null },
    uploadedAt: { type: Date, default: null },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  bloodGroup: {
    type: String,
    enum: {
      values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      message: 'Please select a valid blood group'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  admissionDate: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by user is required']
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { 
  timestamps: true
});

// Indexes for better query performance
studentSchema.index({ studentId: 1 });

// Text index for search functionality
studentSchema.index({ 
  'name.first': 'text', 
  'name.last': 'text',
  email: 'text', 
  studentId: 'text' 
});

// Virtual for full name
studentSchema.virtual('fullName').get(function() {
  return `${this.name.firstName} ${this.name.lastName}`;
});

// Virtual for full address
studentSchema.virtual('fullAddress').get(function() {
  const addr = this.contactInfo.address;
  return `${addr.street}, ${addr.city}, ${addr.state} - ${addr.zipCode}`;
});

// Pre-save middleware to generate student ID
studentSchema.pre('save', async function(next) {
  if (!this.studentId) {
    try {
      const year = new Date().getFullYear();
      const count = await this.constructor.countDocuments();
      this.studentId = `STU-${year}-${String(count + 1).padStart(3, '0')}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Instance Methods
studentSchema.methods.getAge = function() {
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

studentSchema.methods.updatePhoto = function(photoData) {
  this.profilePhoto = {
    ...photoData,
    uploadedAt: new Date()
  };
  return this.save();
};

studentSchema.methods.removePhoto = function() {
  this.profilePhoto = {
    url: null,
    filename: null,
    uploadedAt: null,
    uploadedBy: null
  };
  return this.save();
};

// Static Methods
studentSchema.statics.findByGradeAndSection = function(grade, section) {
  return this.find({ grade, section, isActive: true });
};

studentSchema.statics.searchStudents = function(searchTerm) {
  return this.find({
    $text: { $search: searchTerm },
    isActive: true
  });
};

studentSchema.statics.findActiveStudents = function() {
  return this.find({ isActive: true });
};

module.exports = mongoose.model('Student', studentSchema);