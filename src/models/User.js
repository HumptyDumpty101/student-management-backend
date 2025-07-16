const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { lock } = require('../routes');

const userSchema = new mongoose.Schema({
    employeeId: {
        type: String,
        unique: true,
        sparse: true // employee id only applicable to staffs , not super admins
    },
    name : {
        firstName: {
            type: String,
            required: [true, 'First name is required'],
            trim: true,
            minLength: [2, 'First name must be at least 2 characters'],
            maxLength: [50, 'First name cannot exceed 50 characters'],
        },
        lastname: {
            type: String,
            required: [true, 'Last name is required'],
            trim: true,
            minLength: [2, 'Last name must be at least 2 characters'],
            maxLength: [50, 'Last name cannot exceed 50 characters'],
        },

    },
    email : {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minLength: [6, 'Password must be at least 6 characters'],
        select: false 
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true,
        trim: true,
        match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'],
    },
    role: {
        type: String,
        enum: {
            values: ['superAdmin', 'staff'],
            message: 'Role must be either superAdmin or staff'
        },
        default: 'staff',
        required: [true, 'Role is required']
    },
    department: {
        type: String,
        enum: {
            values: ['Administration', 'Academics', 'Sports', ' Arts', 'Science'],
            message: 'Invalid Department'
        },
        required: function() {
            return this.role === 'staff'; // Only required for staff
        }
    },
    permissions: {
        students: {
            create: {type: Boolean, default: false},
            read: {type: Boolean, default: false},
            update: {type: Boolean, default: false},
            delete: {type: Boolean, default: false}
        },
        staff: {
            create: {type: Boolean, default: false},
            read: {type: Boolean, default: false},
            update: {type: Boolean, default: false},
            delete: {type: Boolean, default: false}
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: null
    },
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date,
        default: null
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: function() {
            return this.role === 'staff'; // Only required for staff
        }
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function(doc, ret) {
            delete ret.password; // Remove password from the output
            delete ret.loginAttempts; // Remove login attempts from the output
            delete ret.lockUntil; // Remove lock until from the output
            delete ret.__v; // Remove version key
            return ret; // Return the modified object
        }
    }
});

// Index for quick lookup
userSchema.index({ email: 1 });
userSchema.index({ employeeId: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function(){
    return `${this.name.firstName} ${this.name.lastname}`;
});

// Virtual to check if user is locked
userSchema.virtual('isLocked').get(function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre save middleware
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Generate Employee ID for staff
userSchema.pre('save', async function(next) {
    if (this.role === 'staff' && !this.employeeId){
        try {
            const year = new Date().getFullYear();
            const count = await this.constructor.countDocuments({ role: 'staff'});
            this.employeeId = `EMP-${year}-${String(count + 1).padStart(3, '0')}`;
        } catch (error) {
            return next(error);
        }
    }
    next();
});

// Instance methods
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.incrementLoginAttempts = async function() {
    if(this.lockUntil && this.lockUntil < Date.now()) {
        return await this.updateOne({
            $unset: {lockUntil: 1},
            $set: {loginAttempts: 1}
        })
    }

    const updates = {$inc: {loginAttempts: 1}};

    // Lock after 5 attempts for 1 Hour
    if(this.loginAttempts +1 >=5 && !this.isLocked) {
        updates.$set = {lockUntil: Date.now() + 60 * 60 * 1000}; // Lock for 1 hour
    }

    return await this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = async function() {
    return await this.updateOne({
        $unset: {loginAttempts: 1, lockUntil: 1}
    })
}

userSchema.methods.updateLastLogin = async function() {
    return await this.updateOne({
        lastLogin: new Date()
    });
}

userSchema.methods.hasPermission = function(module, action) {
    if(this.role === 'superAdmin') {
        return true; // Super Admin has all permissions
    }

    return this.permissions?.[module]?.[action] || false;
}

userSchema.statics.createSuperAdmin = async function(userData) {
    const superAdmin = new this({
        ...userData,
        role: 'superAdmin',
        permissions: {
            students: {
                create: true,
                read: true,
                update: true,
                delete: true
            },
            staff: {
                create: true,
                read: true,
                update: true,
                delete: true
            }
        }
    })

    return await superAdmin.save();
};

userSchema.statics.findByEmail = async function(email) {
    return this.findOne({email: email.toLowerCase()});
}

userSchema.statics.findActiveUsers = function() {
    return this.find({isActive: true});
}


module.exports = mongoose.model('User', userSchema);