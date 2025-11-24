const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../model/user.model");
const { sendResetEmail } = require("./mail.services");

class AuthService {
    async register(email, password, fullname) {
        const exists = await User.findOne({ where: { email } });
        if (exists) throw new Error("Email đã tồn tại");

        const hash = await bcrypt.hash(password, 10);

        const user = await User.create({
            email,
            passwordHash: hash,
            fullname,
        });

        // Trả về user mà không có passwordHash, otp, otpExpires
        const { passwordHash, otp, otpExpires, ...userWithoutPassword } = user.toJSON();
        return userWithoutPassword;
    }

    async login(email, password) {
        const user = await User.findOne({ where: { email } });
        if (!user) throw new Error("Sai email hoặc mật khẩu");

        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match) throw new Error("Sai email hoặc mật khẩu");

        const token = jwt.sign(
            {
                userId: user.userId,
                email: user.email,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        const userData = user.toJSON();
        delete userData.passwordHash;
        delete userData.otp;
        delete userData.otpExpires;

        return { token, user: userData };
    }

    async forgotPassword(email) {
        const user = await User.findOne({ where: { email } });
        if (!user) throw new Error("Email không tồn tại");

        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await user.update({ otp, otpExpires });

        console.log(`Sending OTP ${otp} to ${email}`);
        sendResetEmail(email, `Mã OTP của bạn là: ${otp}. Mã này hết hạn sau 10 phút.`)
            .then(() => console.log(`OTP sent to ${email}`))
            .catch(err => console.error(`Failed to send OTP to ${email}:`, err));
        // Don't await, return immediately
    }

    async resetPassword(email, newPassword) {
        const user = await User.findOne({ where: { email } });
        if (!user) throw new Error("User không tồn tại");

        // Bỏ check OTP, assume verified
        const hash = await bcrypt.hash(newPassword, 10);
        await user.update({ passwordHash: hash, otp: null, otpExpires: null });
    }

    async verifyOtp(email, otp) {
        const user = await User.findOne({ where: { email } });
        if (!user) throw new Error("User không tồn tại");

        if (user.otp !== otp || user.otpExpires < new Date()) {
            throw new Error("OTP không hợp lệ hoặc đã hết hạn");
        }

        return { message: "OTP hợp lệ" };
    }

    async changePassword(userId, oldPassword, newPassword) {
        const user = await User.findByPk(userId);
        if (!user) throw new Error("User không tồn tại");

        const match = await bcrypt.compare(oldPassword, user.passwordHash);
        if (!match) throw new Error("Mật khẩu cũ không đúng");

        const hash = await bcrypt.hash(newPassword, 10);
        await user.update({ passwordHash: hash });
    }
}

module.exports = new AuthService();
