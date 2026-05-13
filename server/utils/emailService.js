const nodemailer = require('nodemailer');

// Create transporter with Gmail SMTP
const createTransporter = () => {
    // Check if email is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        return null;
    }

    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS // Gmail App Password (not regular password)
        }
    });
};

/**
 * Send a batch report via email
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.clientName - Client name for subject
 * @param {string} options.batchTitle - Batch title
 * @param {string} options.managerName - Sender name
 * @param {Buffer} options.pdfBuffer - PDF report buffer
 * @param {string} options.message - Optional custom message
 */
const sendBatchReport = async ({ to, clientName, batchTitle, managerName, pdfBuffer, message }) => {
    const transporter = createTransporter();

    if (!transporter) {
        throw new Error('Email not configured. Add SMTP_USER and SMTP_PASS to .env');
    }

    const subject = `📊 Verification Report: ${batchTitle}${clientName ? ` - ${clientName}` : ''}`;

    const year = new Date().getFullYear();
    const dateStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'long', timeStyle: 'short' });

    const htmlContent = `
        <div style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
          <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);margin-top:20px;margin-bottom:20px;">

            <!-- Header -->
            <div style="background:#0066CC;padding:28px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;">🔒 PromoSecure</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;font-weight:400;">Privacy-First Promotional Verification Platform</p>
            </div>

            <!-- Body -->
            <div style="padding:32px 32px 24px;">
              <h2 style="margin:0 0 6px;color:#1e293b;font-size:20px;font-weight:700;">📊 Verification Report</h2>
              <p style="margin:0 0 20px;color:#64748b;font-size:14px;line-height:1.5;">
                A promotional verification report has been shared with you.
              </p>

              <!-- Report Details Box -->
              <div style="background:#f0f4ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin:0 0 20px;">
                <table cellpadding="0" cellspacing="0" style="width:100%;">
                  <tr>
                    <td style="padding:5px 0;color:#64748b;font-size:13px;width:120px;">📋 Batch Name:</td>
                    <td style="padding:5px 0;color:#1e293b;font-size:13px;font-weight:700;">${batchTitle}</td>
                  </tr>
                  ${clientName ? `<tr>
                    <td style="padding:5px 0;color:#64748b;font-size:13px;">🏢 Client:</td>
                    <td style="padding:5px 0;color:#1e293b;font-size:13px;font-weight:600;">${clientName}</td>
                  </tr>` : ''}
                  <tr>
                    <td style="padding:5px 0;color:#64748b;font-size:13px;">👤 Sent by:</td>
                    <td style="padding:5px 0;color:#1e293b;font-size:13px;font-weight:600;">${managerName}</td>
                  </tr>
                  <tr>
                    <td style="padding:5px 0;color:#64748b;font-size:13px;">📅 Date:</td>
                    <td style="padding:5px 0;color:#1e293b;font-size:13px;font-weight:600;">${dateStr} IST</td>
                  </tr>
                </table>
              </div>

              ${message ? `
              <!-- Custom Message -->
              <div style="background:#ffffff;border-left:4px solid #0066CC;padding:14px 16px;margin:0 0 20px;border:1px solid #e2e8f0;border-left:4px solid #0066CC;border-radius:0 8px 8px 0;">
                <p style="margin:0 0 4px;color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Message from ${managerName}:</p>
                <p style="margin:0;color:#1e293b;font-size:14px;line-height:1.6;font-style:italic;">"${message}"</p>
              </div>
              ` : ''}

              <!-- Report Contents -->
              <div style="margin:0 0 20px;">
                <p style="margin:0 0 10px;color:#1e293b;font-size:14px;font-weight:600;">📎 Attached PDF Report Includes:</p>
                <table cellpadding="0" cellspacing="0" style="width:100%;">
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#475569;">✅ Verification summary & approval status</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#475569;">✅ AI duplicate detection results & scores</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#475569;">✅ Privacy-protected photos (all faces blurred)</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#475569;">✅ GPS location & timestamp for each photo</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#475569;">✅ Promoter performance metrics</td>
                  </tr>
                </table>
              </div>

              <!-- Privacy Notice -->
              <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px 16px;margin:0 0 20px;">
                <p style="margin:0;color:#166534;font-size:13px;font-weight:600;">🛡️ Privacy Guaranteed</p>
                <p style="margin:6px 0 0;color:#15803d;font-size:12px;line-height:1.5;">
                  All photos in this report have been processed with our 4-layer AI face blurring system. No identifiable faces are present in the attached document.
                </p>
              </div>

              <!-- Didn't expect this? -->
              <div style="border-top:1px solid #e2e8f0;padding-top:18px;">
                <p style="margin:0 0 4px;color:#1e293b;font-size:14px;font-weight:600;">Didn't expect this report?</p>
                <p style="margin:0;color:#64748b;font-size:13px;line-height:1.6;">
                  If you were not expecting this email, it may have been sent to you by mistake. Please contact us:
                </p>
                <p style="margin:8px 0 0;">
                  <a href="mailto:vigneshigt@gmail.com" style="display:inline-block;background:#0066CC;color:#ffffff;text-decoration:none;padding:8px 20px;border-radius:6px;font-size:13px;font-weight:600;">📧 Contact Admin</a>
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div style="background:#1e293b;padding:20px 32px;text-align:center;">
              <p style="margin:0 0 8px;color:#94a3b8;font-size:12px;">
                This report was generated by <strong style="color:#e2e8f0;">PromoSecure</strong>
              </p>
              <p style="margin:0 0 8px;color:#64748b;font-size:11px;">
                Enterprise-grade privacy • AI-powered verification • SOC 2 compliant
              </p>
              <div style="margin-top:10px;">
                <a href="https://promosecure-api.vercel.app" style="color:#60a5fa;font-size:11px;text-decoration:none;margin:0 8px;">Website</a>
                <span style="color:#475569;">•</span>
                <a href="https://promosecure-api.vercel.app/help" style="color:#60a5fa;font-size:11px;text-decoration:none;margin:0 8px;">Help Center</a>
                <span style="color:#475569;">•</span>
                <a href="https://promosecure-api.vercel.app/privacy" style="color:#60a5fa;font-size:11px;text-decoration:none;margin:0 8px;">Privacy Policy</a>
              </div>
              <p style="margin:12px 0 0;color:#475569;font-size:10px;">
                © ${year} PromoSecure. All rights reserved.
              </p>
            </div>
          </div>
        </div>
    `;

    const filename = `PromoSecure_Report_${batchTitle.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

    const mailOptions = {
        from: `"PromoSecure Reports" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html: htmlContent,
        attachments: [
            {
                filename,
                content: pdfBuffer,
                contentType: 'application/pdf'
            }
        ]
    };

    const result = await transporter.sendMail(mailOptions);
    return result;
};

/**
 * Check if email is configured
 */
const isEmailConfigured = () => {
    return !!(process.env.SMTP_USER && process.env.SMTP_PASS);
};

module.exports = { sendBatchReport, isEmailConfigured };
