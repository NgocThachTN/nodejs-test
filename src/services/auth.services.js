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

        // Trả về user mà không có passwordHash
        const { passwordHash, ...userWithoutPassword } = user.toJSON();
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

        return { token, user: userData };
    }

    async forgotPassword(email) {
        const user = await User.findOne({ where: { email } });
        if (!user) throw new Error("Email không tồn tại");

        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await user.update({ otp, otpExpires });

        console.log(`Sending OTP ${otp} to ${email}`);
        await sendResetEmail(email, `Mã OTP của bạn là: ${otp}. Mã này hết hạn sau 10 phút.`);
        console.log(`OTP sent to ${email}`);
    }

    async resetPassword(email, otp, newPassword) {
        const user = await User.findOne({ where: { email } });
        if (!user) throw new Error("User không tồn tại");

        if (user.otp !== otp || user.otpExpires < new Date()) {
            throw new Error("OTP không hợp lệ hoặc đã hết hạn");
        }

        const hash = await bcrypt.hash(newPassword, 10);
        await user.update({ passwordHash: hash, otp: null, otpExpires: null });
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
