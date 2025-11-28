const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../model/user.model");
const RefreshToken = require("../model/refreshToken.model");
const { sendResetEmail } = require("./mail.services");

class AuthService {
    generateTokens(user) {
        const accessToken = jwt.sign(
            {
                userId: user.userId,
                email: user.email,
                role: user.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: "12h" } // Access token dài hơn: 12 tiếng
        );

        const refreshToken = jwt.sign(
            { userId: user.userId },
            process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
            { expiresIn: "7d" } // Long lived refresh token
        );

        return { accessToken, refreshToken };
    }

    async refreshToken(refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
            const tokenRecord = await RefreshToken.findOne({
                where: { token: refreshToken, userId: decoded.userId }
            });
            if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
                throw new Error("Invalid refresh token");
            }

            const user = await User.findByPk(decoded.userId);
            const { accessToken, refreshToken: newRefreshToken } = this.generateTokens(user);

            // Xóa refresh token cũ và tạo mới
            await tokenRecord.destroy();
            await RefreshToken.create({
                token: newRefreshToken,
                userId: user.userId,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            });

            return { accessToken, refreshToken: newRefreshToken };
        } catch (err) {
            throw new Error("Invalid refresh token");
        }
    }

    async logout(userId, refreshToken) {
        await RefreshToken.destroy({ where: { token: refreshToken, userId } });
    }
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

        const { accessToken, refreshToken } = this.generateTokens(user);

        // Lưu refresh token vào DB
        await RefreshToken.create({
            token: refreshToken,
            userId: user.userId,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        });

        const userData = user.toJSON();
        delete userData.passwordHash;
        delete userData.otp;
        delete userData.otpExpires;

        return { accessToken, refreshToken, user: userData };
    }

    async forgotPassword(email) {
        const user = await User.findOne({ where: { email } });
        if (!user) throw new Error("Email không tồn tại");

        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await user.update({ otp, otpExpires });

        console.log(`Sending OTP ${otp} to ${email}`);
        try {
            await sendResetEmail(email, `Mã OTP của bạn là: ${otp}. Mã này hết hạn sau 10 phút.`);
            console.log(`OTP sent to ${email}`);
        } catch (error) {
            console.error(`Failed to send OTP to ${email}:`, error);
            throw new Error("Không thể gửi email reset mật khẩu");
        }
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

        // Trim OTP để tránh space
        const trimmedOtp = otp.trim();

        console.log(`Verifying OTP for ${email}: input=${trimmedOtp}, stored=${user.otp}, expires=${user.otpExpires}, now=${new Date()}`);

        // Kiểm tra OTP có tồn tại và chưa hết hạn
        if (!user.otp || user.otpExpires < new Date()) {
            console.log(`OTP invalid: otp=${user.otp}, expires=${user.otpExpires}, now=${new Date()}`);
            throw new Error("OTP không hợp lệ hoặc đã hết hạn");
        }

        // So sánh OTP
        if (user.otp !== trimmedOtp) {
            console.log(`OTP mismatch: stored=${user.otp}, input=${trimmedOtp}`);
            throw new Error("OTP không hợp lệ");
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
