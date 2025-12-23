const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

// Rate limiting - different limits for different routes
const createRateLimiter = (windowMs, max, message) => {
    return rateLimit({
        windowMs,
        max,
        message: { success: false, message },
        standardHeaders: true,
        legacyHeaders: false,
    });
};

// General API rate limit: 1000 requests per 15 minutes (generous for development)
const apiLimiter = createRateLimiter(
    15 * 60 * 1000,
    1000,
    'Too many requests, please try again later'
);

// Auth rate limit: 5 login attempts per 15 minutes
const authLimiter = createRateLimiter(
    15 * 60 * 1000,
    5,
    'Too many login attempts, please try again after 15 minutes'
);

// Photo upload limit: 30 uploads per hour
const uploadLimiter = createRateLimiter(
    60 * 60 * 1000,
    30,
    'Upload limit reached, please try again after an hour'
);

// Security headers configuration
const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "blob:"],
            scriptSrc: ["'self'", "'unsafe-eval'"], // Required for TensorFlow.js
            connectSrc: ["'self'", "https://tfhub.dev", "https://cdn.jsdelivr.net"],
            workerSrc: ["'self'", "blob:"],
        },
    },
    crossOriginEmbedderPolicy: false, // Required for TensorFlow.js
});

// Input validation middleware
const validateInput = (req, res, next) => {
    // Check for common injection patterns
    const suspiciousPatterns = [
        /\$where/i,
        /\$regex/i,
        /<script/i,
        /javascript:/i,
        /on\w+=/i,
    ];

    const checkValue = (value) => {
        if (typeof value === 'string') {
            return suspiciousPatterns.some(pattern => pattern.test(value));
        }
        if (typeof value === 'object' && value !== null) {
            return Object.values(value).some(checkValue);
        }
        return false;
    };

    if (checkValue(req.body) || checkValue(req.query) || checkValue(req.params)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid input detected'
        });
    }

    next();
};

// Password strength validation
const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors = [];
    if (password.length < minLength) {
        errors.push(`Password must be at least ${minLength} characters`);
    }
    if (!hasUpperCase) errors.push('Password must contain an uppercase letter');
    if (!hasLowerCase) errors.push('Password must contain a lowercase letter');
    if (!hasNumbers) errors.push('Password must contain a number');

    return {
        isValid: errors.length === 0,
        errors,
        strength: [hasUpperCase, hasLowerCase, hasNumbers, hasSpecial].filter(Boolean).length
    };
};

// Password validation middleware
const passwordValidation = (req, res, next) => {
    if (req.body.password) {
        const validation = validatePassword(req.body.password);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Password does not meet requirements',
                errors: validation.errors
            });
        }
    }
    next();
};

// Audit logging middleware
const auditLog = (req, res, next) => {
    const startTime = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const logEntry = {
            timestamp: new Date().toISOString(),
            method: req.method,
            path: req.path,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userId: req.user?._id || 'anonymous',
            userAgent: req.get('User-Agent')?.substring(0, 100),
        };

        // Log to console (in production, send to logging service)
        if (res.statusCode >= 400) {
            console.error('🔴 Error:', JSON.stringify(logEntry));
        } else if (req.method !== 'GET') {
            console.log('📝 Audit:', JSON.stringify(logEntry));
        }
    });

    next();
};

// Error handler middleware
const errorHandler = (err, req, res, next) => {
    console.error('❌ Server Error:', err);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            message: messages.join(', ')
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        return res.status(400).json({
            success: false,
            message: 'Duplicate field value entered'
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired'
        });
    }

    // Default error
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Server Error'
    });
};

module.exports = {
    apiLimiter,
    authLimiter,
    uploadLimiter,
    securityHeaders,
    validateInput,
    validatePassword,
    passwordValidation,
    auditLog,
    errorHandler,
    mongoSanitize,
    xss,
    hpp,
};
