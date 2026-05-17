require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const {
    apiLimiter,
    uploadLimiter,
    securityHeaders,
    validateInput,
    auditLog,
    errorHandler,
    mongoSanitize,
    xss,
    hpp,
} = require('./middleware/security');

// Connect to database
connectDB();

const app = express();

// Security middleware
app.use(securityHeaders);
app.use(auditLog);

// CORS configuration
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing with size limits
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Input validation
app.use(validateInput);

// Apply rate limiting
app.use('/api', apiLimiter);
app.use('/api/photos', uploadLimiter);

// Additional security middleware
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(xss()); // Prevent XSS attacks
app.use(hpp()); // Prevent HTTP parameter pollution

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/batches', require('./routes/batches'));
app.use('/api/photos', require('./routes/photos'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/comments', require('./routes/comments'));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'active',
        service: 'PromoSecure API',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        uptime: process.uptime()
    });
});

// Root endpoint for Vercel deployment check
app.get('/', (req, res) => {
    res.send('PromoSecure API is running successfully.');
});

// API documentation endpoint
app.get('/api', (req, res) => {
    res.json({
        name: 'PromoSecure API',
        version: '2.0.0',
        description: 'Privacy-focused promotional proof-of-work API',
        endpoints: {
            auth: {
                'POST /api/auth/register': 'Register first admin',
                'POST /api/auth/login': 'Login',
                'GET /api/auth/me': 'Get current user',
            },
            users: {
                'POST /api/users/manager': 'Create manager (admin)',
                'POST /api/users/promoter': 'Create promoter (manager)',
                'GET /api/users': 'List users',
                'GET /api/users/stats': 'Get statistics (admin)',
                'PUT /api/users/:id/limit': 'Update promoter limit (admin)',
                'PUT /api/users/:id/toggle': 'Toggle user status',
                'DELETE /api/users/:id': 'Delete user (admin)',
            },
            batches: {
                'POST /api/batches': 'Create batch',
                'GET /api/batches': 'List batches',
                'GET /api/batches/:id': 'Get batch with photos',
                'PUT /api/batches/:id': 'Update batch',
                'PUT /api/batches/:id/submit': 'Submit for review',
                'PUT /api/batches/:id/review': 'Approve/reject (manager)',
                'DELETE /api/batches/:id': 'Delete batch',
            },
            photos: {
                'POST /api/photos': 'Add photo to batch',
                'GET /api/photos/:batchId': 'Get photos for batch',
                'DELETE /api/photos/:id': 'Delete photo',
            },
        },
        rateLimits: {
            general: '100 requests per 15 minutes',
            uploads: '30 uploads per hour',
        },
    });
});

// Error handler
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

const PORT = process.env.PORT || 5000;

// Only listen when not in Vercel serverless environment
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🔒 PromoSecure Server v2.0                             ║
║                                                          ║
║   📡 Port: ${PORT}                                         ║
║   🌐 API: http://localhost:${PORT}/api                     ║
║   📚 Docs: http://localhost:${PORT}/api                    ║
║   ⏱️  Time: ${new Date().toLocaleTimeString()}                               ║
║                                                          ║
║   ✅ Security: Enabled                                   ║
║   ✅ Rate Limiting: Active                               ║
║   ✅ Audit Logging: Active                               ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
  `);
    });
}

// Export for Vercel serverless
module.exports = app;
