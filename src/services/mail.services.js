// src/services/mail.services.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS.trim(), // Trim space
    },
});

const sendResetEmail = async (email, message) => {
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Mật Khẩu</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                background-color: #007bff;
                color: #ffffff;
                padding: 20px;
                border-radius: 8px 8px 0 0;
            }
            .content {
                padding: 20px;
                text-align: center;
            }
            .footer {
                text-align: center;
                color: #666666;
                font-size: 12px;
                padding: 20px;
                border-top: 1px solid #dddddd;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Reset Mật Khẩu</h1>
            </div>
            <div class="content">
                <p>${message}</p>
            </div>
            <div class="footer">
                <p>© 2025 Node.js Test API. Tất cả quyền được bảo lưu.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "OTP Reset Mật Khẩu - Node.js Test API",
        html: htmlContent,
    };

    try {
        await transporter.sendMail(mailOptions);
        // console.log(`Email sent to ${email}`);
    } catch (error) {
        // console.error(`Error sending email to ${email}:`, error);
        throw new Error("Không thể gửi email");
    }
};

module.exports = { sendResetEmail };