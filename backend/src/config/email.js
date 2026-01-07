const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.warn('⚠️ Email configuration not set up:', error.message);
  } else {
    console.log('✅ Email server ready');
  }
});

/**
 * Send enrollment access link to user
 */
const sendEnrollmentLink = async (email, name, courseName, accessToken) => {
  const accessUrl = `${process.env.FRONTEND_URL}/access/${accessToken}`;
  
  const mailOptions = {
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: email,
    subject: `Your Access to ${courseName} - Darwin Education`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a160a; color: #ffffff; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .header { text-align: center; margin-bottom: 40px; }
          .logo { font-size: 32px; font-weight: bold; color: #22c55e; }
          .content { background-color: #162816; border-radius: 16px; padding: 40px; border: 1px solid rgba(34, 197, 94, 0.2); }
          h1 { color: #ffffff; margin-bottom: 20px; }
          p { color: #9ca3af; line-height: 1.6; margin-bottom: 20px; }
          .highlight { color: #22c55e; font-weight: 600; }
          .button { display: inline-block; background-color: #22c55e; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .button:hover { background-color: #16a34a; }
          .warning { background-color: rgba(234, 179, 8, 0.1); border: 1px solid rgba(234, 179, 8, 0.3); border-radius: 8px; padding: 16px; margin-top: 20px; }
          .warning p { color: #eab308; margin: 0; font-size: 14px; }
          .footer { text-align: center; margin-top: 40px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎓 Darwin Education</div>
          </div>
          <div class="content">
            <h1>Welcome, ${name}! 🎉</h1>
            <p>Your enrollment for <span class="highlight">${courseName}</span> has been approved!</p>
            <p>Click the button below to access your course:</p>
            <center>
              <a href="${accessUrl}" class="button">Access Your Course</a>
            </center>
            <p style="font-size: 14px; color: #6b7280;">Or copy this link: <br><span style="color: #22c55e; word-break: break-all;">${accessUrl}</span></p>
            <div class="warning">
              <p>⚠️ <strong>Important:</strong> This link is personal and tied to your account. Please do not share it with others. Sharing may result in account suspension.</p>
            </div>
          </div>
          <div class="footer">
            <p>© 2025 Darwin Education. All rights reserved.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Send notification to admin about new enrollment request
 */
const sendAdminNotification = async (enrollment) => {
  const mailOptions = {
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `New Enrollment Request - ${enrollment.name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 30px; }
          h1 { color: #111827; }
          .info { background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .info p { margin: 8px 0; color: #374151; }
          .label { font-weight: 600; color: #111827; }
          .button { display: inline-block; background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>📝 New Enrollment Request</h1>
          <div class="info">
            <p><span class="label">Name:</span> ${enrollment.name}</p>
            <p><span class="label">Email:</span> ${enrollment.email}</p>
            <p><span class="label">Phone:</span> ${enrollment.phone}</p>
            <p><span class="label">Course:</span> ${enrollment.courseName}</p>
            <p><span class="label">Date:</span> ${new Date().toLocaleString()}</p>
          </div>
          <p>Please review the payment proof and approve/reject this enrollment in the admin dashboard.</p>
          <a href="${process.env.FRONTEND_URL}/admin/enrollments" class="button">Go to Admin Dashboard</a>
        </div>
      </body>
      </html>
    `,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = {
  sendEnrollmentLink,
  sendAdminNotification,
};
