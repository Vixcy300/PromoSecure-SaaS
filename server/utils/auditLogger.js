const AuditLog = require('../models/AuditLog');

/**
 * Asynchronously log a platform audit event without blocking execution
 */
const logAuditEvent = async ({
    action,
    category = 'audit',
    user = null,
    targetId = null,
    targetType = 'Entity',
    targetName = '',
    details = {},
    req = null
}) => {
    try {
        const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1') : '127.0.0.1';
        const userAgent = req ? (req.headers['user-agent'] || 'PromoSecure Web Client') : 'PromoSecure Enterprise';

        await AuditLog.create({
            action,
            category,
            performedBy: user ? user._id : null,
            performedByName: user ? user.name : 'Super Administrator',
            performedByEmail: user ? user.email : 'admin@promosecure.io',
            targetId,
            targetType,
            targetName,
            details,
            ipAddress,
            userAgent
        });
    } catch (err) {
        console.error('Audit log write error (non-fatal):', err.message);
    }
};

module.exports = { logAuditEvent };
