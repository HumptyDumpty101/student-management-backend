const Joi = require('joi');

// Auth Validation
const loginSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please enter a valid email address',
            'string.empty': 'Email is required'
        }),
    password: Joi.string()
        .min(6)
        .required()
        .messages({
            'string.min': 'Password must be at least 6 characters long',
            'any.required': 'Password is required'
        })
});

const refreshTokenSchema = Joi.object({
    refreshToken: Joi.string()
        .required()
        .messages({
            'string.empty': 'Refresh token is required'
        })
});

const changePasswordSchema = Joi.object({
    currentPassword: Joi.string()
    .required()
    .messages({
        'any.required': 'Current password is required'
    }),
    newPassword: Joi.string()
        .min(6)
        .required()
        .messages({
            'string.min': 'New password must be at least 6 characters long',
            'any.required': 'New password is required'
        }),
    confirmPassword: Joi.string()
        .valid(Joi.ref('newPassword'))
        .required()
        .messages({
            'any.only': 'Confirm password must match new password',
            'any.required': 'Confirm password is required'
        })
});



// Staff Creation Validation
const staffSchema = Joi.object({
    name: Joi.object({
        firstName: Joi.string()
            .min(2)
            .max(50)
            .required()
            .messages({
                'string.min': 'First name must be at least 2 characters',
                'string.max': 'First name cannot exceed 50 characters',
                'any.required': 'First name is required'
            }),
        lastName: Joi.string()
            .min(2)
            .max(50)
            .required()
            .messages({
                'string.min': 'Last name must be at least 2 characters',
                'string.max': 'Last name cannot exceed 50 characters',
                'any.required': 'Last name is required'
            })
    }).required(),
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please enter a valid email address',
            'string.empty': 'Email is required'
        }),
    password: Joi.string()
        .min(6)
        .required()
        .messages({
            'string.min': 'Password must be at least 6 characters long',
            'any.required': 'Password is required'
        }),
    phone: Joi.string()
        .pattern(/^[0-9]{10}$/)
        .required()
        .messages({
            'string.pattern.base': 'Phone number must be 10 digits',
            'string.empty': 'Phone number is required'
        }),
    department: Joi.string()
        .valid('Administration', 'Academics', 'Sports', ' Arts', 'Science')
        .required()
        .messages({
            'any.only': 'Department must be one of Administration, Academics, Sports,Arts, Science',
            'any.required': 'Department is required'
        }),
    permissions: Joi.object({
        students: Joi.object({
            create: Joi.boolean().default(false),
            read: Joi.boolean().default(false),
            update: Joi.boolean().default(false),
            delete: Joi.boolean().default(false)
        }).required(),
    }).required()
});

// Staff Update
const staffUpdateSchema = Joi.object({
  name: Joi.object({
    firstName: Joi.string()
      .min(2)
      .max(50)
      .messages({
        'string.min': 'First name must be at least 2 characters',
        'string.max': 'First name cannot exceed 50 characters'
      }),
    lastName: Joi.string()
      .min(2)
      .max(50)
      .messages({
        'string.min': 'Last name must be at least 2 characters',
        'string.max': 'Last name cannot exceed 50 characters'
      })
  }),
  email: Joi.string()
    .email()
    .messages({
      'string.email': 'Please enter a valid email address'
    }),
  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .messages({
      'string.pattern.base': 'Phone number must be 10 digits'
    }),
  department: Joi.string()
    .valid('Administration', 'Academics', 'Sports', 'Arts', 'Science')
    .messages({
      'any.only': 'Department must be one of Administration, Academics, Sports, Arts, Science'
    }),
  isActive: Joi.boolean()
});

// Permission Update
const permissionSchema = Joi.object({
  students: Joi.object({
    create: Joi.boolean().required(),
    read: Joi.boolean().required(),
    update: Joi.boolean().required(),
    delete: Joi.boolean().required()
  }).required()
});

// Student Creation
const studentSchema = Joi.object({
  name: Joi.object({
    firstName: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.min': 'First name must be at least 2 characters',
        'string.max': 'First name cannot exceed 50 characters',
        'any.required': 'First name is required'
      }),
    lastName: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.min': 'Last name must be at least 2 characters',
        'string.max': 'Last name cannot exceed 50 characters',
        'any.required': 'Last name is required'
      })
  }).required(),
  email: Joi.string()
    .email()
    .allow('')
    .messages({
      'string.email': 'Please enter a valid email address'
    }),
  dateOfBirth: Joi.date()
    .less('now')
    .required()
    .messages({
      'date.less': 'Date of birth must be in the past',
      'any.required': 'Date of birth is required'
    }),
  gender: Joi.string()
    .valid('Male', 'Female', 'Other')
    .required()
    .messages({
      'any.only': 'Gender must be Male, Female or Other',
      'any.required': 'Gender is required'
    }),
  standard: Joi.string()
    .valid('KG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th')
    .required()
    .messages({
      'any.only': 'Standard must be one of KG, 1st, 2nd, 3rd, 4th, 5th, 6th, 7th, 8th, 9th, 10th, 11th, or 12th',
      'any.required': 'Standard is required'
    }),
  section: Joi.string()
    .valid('A', 'B', 'C', 'D')
    .required()
    .messages({
      'any.only': 'Section must be one of A, B, C, or D',
      'any.required': 'Section is required'
    }),
  rollNumber: Joi.number()
    .min(1)
    .required()
    .messages({
      'number.min': 'Roll number must be at least 1',
      'any.required': 'Roll number is required'
    }),
  overallGrade: Joi.string()
    .valid('A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F')
    .optional()
    .messages({
      'any.only': 'Overall grade must be one of A+, A, B+, B, C+, C, D, F'
    }),
  overallPercentage: Joi.number()
    .min(0)
    .max(100)
    .optional()
    .messages({
      'number.min': 'Percentage cannot be negative',
      'number.max': 'Percentage cannot exceed 100'
    }),
  contactInfo: Joi.object({
    address: Joi.object({
      street: Joi.string()
        .required()
        .messages({ 'any.required': 'Street address is required' }),
      city: Joi.string()
        .required()
        .messages({ 'any.required': 'City is required' }),
      state: Joi.string()
        .required()
        .messages({ 'any.required': 'State is required' }),
      pinCode: Joi.string()
        .pattern(/^[0-9]{6}$/)
        .required()
        .messages({
          'string.pattern.base': 'Please enter a valid 6-digit PIN code',
          'any.required': 'PIN code is required'
        })
    }).required(),
    emergencyContact: Joi.object({
      name: Joi.string()
        .required()
        .messages({ 'any.required': 'Emergency contact name is required' }),
      relationship: Joi.string()
        .valid('Father', 'Mother', 'Guardian', 'Sibling', 'Other')
        .required()
        .messages({
          'any.only': 'Relationship must be one of Father, Mother, Guardian, Sibling, Other',
          'any.required': 'Emergency contact relationship is required'
        }),
      phone: Joi.string()
        .pattern(/^[0-9]{10}$/)
        .required()
        .messages({
          'string.pattern.base': 'Emergency contact phone must be 10 digits',
          'any.required': 'Emergency contact phone is required'
        })
    }).required()
  }).required(),
  parentInfo: Joi.object({
    father: Joi.object({
      name: Joi.string()
        .required()
        .messages({ 'any.required': 'Father name is required' }),
      occupation: Joi.string()
        .allow('')
        .default(''),
      phone: Joi.string()
        .pattern(/^[0-9]{10}$/)
        .required()
        .messages({
          'string.pattern.base': 'Father phone must be 10 digits',
          'any.required': 'Father phone is required'
        }),
      email: Joi.string()
        .email()
        .allow('')
        .default('')
        .messages({
          'string.email': 'Please enter a valid email address for father'
        })
    }).required(),
    mother: Joi.object({
      name: Joi.string()
        .required()
        .messages({ 'any.required': 'Mother name is required' }),
      occupation: Joi.string()
        .allow('')
        .default(''),
      phone: Joi.string()
        .pattern(/^[0-9]{10}$/)
        .required()
        .messages({
          'string.pattern.base': 'Mother phone must be 10 digits',
          'any.required': 'Mother phone is required'
        }),
      email: Joi.string()
        .email()
        .allow('')
        .default('')
        .messages({
          'string.email': 'Please enter a valid email address for mother'
        })
    }).required()
  }).required(),
  bloodGroup: Joi.string()
    .valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
    .optional()
    .messages({
      'any.only': 'Please select a valid blood group'
    })
});

// Student Update
const studentUpdateSchema = Joi.object({
  name: Joi.object({
    firstName: Joi.string()
      .min(2)
      .max(50)
      .messages({
        'string.min': 'First name must be at least 2 characters',
        'string.max': 'First name cannot exceed 50 characters'
      }),
    lastName: Joi.string()
      .min(2)
      .max(50)
      .messages({
        'string.min': 'Last name must be at least 2 characters',
        'string.max': 'Last name cannot exceed 50 characters'
      })
  }),
  email: Joi.string()
    .email()
    .allow('')
    .messages({
      'string.email': 'Please enter a valid email address'
    }),
  dateOfBirth: Joi.date()
    .less('now')
    .messages({
      'date.less': 'Date of birth must be in the past'
    }),
  gender: Joi.string()
    .valid('Male', 'Female', 'Other')
    .messages({
      'any.only': 'Gender must be Male, Female or Other'
    }),
  standard: Joi.string()
    .valid('KG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th')
    .messages({
      'any.only': 'Standard must be one of KG, 1st, 2nd, 3rd, 4th, 5th, 6th, 7th, 8th, 9th, 10th, 11th, or 12th'
    }),
  section: Joi.string()
    .valid('A', 'B', 'C', 'D')
    .messages({
      'any.only': 'Section must be one of A, B, C, or D'
    }),
  rollNumber: Joi.number()
    .min(1)
    .messages({
      'number.min': 'Roll number must be at least 1'
    }),
  overallGrade: Joi.string()
    .valid('A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F')
    .messages({
      'any.only': 'Overall grade must be one of A+, A, B+, B, C+, C, D, F'
    }),
  overallPercentage: Joi.number()
    .min(0)
    .max(100)
    .messages({
      'number.min': 'Percentage cannot be negative',
      'number.max': 'Percentage cannot exceed 100'
    }),
  contactInfo: Joi.object({
    address: Joi.object({
      street: Joi.string(),
      city: Joi.string(),
      state: Joi.string(),
      pinCode: Joi.string()
        .pattern(/^[0-9]{6}$/)
        .messages({
          'string.pattern.base': 'Please enter a valid 6-digit PIN code'
        })
    }),
    emergencyContact: Joi.object({
      name: Joi.string(),
      relationship: Joi.string()
        .valid('Father', 'Mother', 'Guardian', 'Sibling', 'Other')
        .messages({
          'any.only': 'Relationship must be one of Father, Mother, Guardian, Sibling, Other'
        }),
      phone: Joi.string()
        .pattern(/^[0-9]{10}$/)
        .messages({
          'string.pattern.base': 'Emergency contact phone must be 10 digits'
        })
    })
  }),
  parentInfo: Joi.object({
    father: Joi.object({
      name: Joi.string(),
      occupation: Joi.string().allow(''),
      phone: Joi.string()
        .pattern(/^[0-9]{10}$/)
        .messages({
          'string.pattern.base': 'Father phone must be 10 digits'
        }),
      email: Joi.string()
        .email()
        .allow('')
        .messages({
          'string.email': 'Please enter a valid email address for father'
        })
    }),
    mother: Joi.object({
      name: Joi.string(),
      occupation: Joi.string().allow(''),
      phone: Joi.string()
        .pattern(/^[0-9]{10}$/)
        .messages({
          'string.pattern.base': 'Mother phone must be 10 digits'
        }),
      email: Joi.string()
        .email()
        .allow('')
        .messages({
          'string.email': 'Please enter a valid email address for mother'
        })
    })
  }),
  bloodGroup: Joi.string()
    .valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
    .messages({
      'any.only': 'Please select a valid blood group'
    })
});

// Search Query & Params
const paginationSchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  search: Joi.string().allow('').optional(),
  sortBy: Joi.string().valid('createdAt', 'name.firstName', 'studentId', 'standard', 'department', 'email').allow('').optional(),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  standard: Joi.string().valid('KG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th').allow('').optional(),
  section: Joi.string().valid('A', 'B', 'C', 'D').allow('').optional(),
  isActive: Joi.boolean().optional(),
  department: Joi.string().valid('Administration', 'Academics', 'Sports', 'Arts', 'Science').allow('').optional()
});

const idParamSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid ID format',
      'any.required': 'ID is required'
    })
});

module.exports = {
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  staffSchema,
  staffUpdateSchema,
  studentSchema,
  studentUpdateSchema,
  permissionSchema,
  paginationSchema,
  idParamSchema
};