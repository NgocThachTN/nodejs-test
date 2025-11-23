const authService = require("../services/auth.services");

class AuthController {
    async register(req, res) {
        try {
            const { email, password, confirmpassword, fullname } = req.body;

            // Validation: Kiểm tra mật khẩu xác nhận
            if (password !== confirmpassword) {
                return res.status(400).json({ message: "Mật khẩu xác nhận không khớp" });
            }

            const user = await authService.register(email, password, fullname);
            res.status(201).json({ message: "Đăng ký thành công", user });
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            const data = await authService.login(email, password);
            res.json({ message: "Đăng nhập thành công", ...data });
        } catch (err) {
            res.status(401).json({ message: err.message });
        }
    }

    async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            await authService.forgotPassword(email);
            res.json({ message: "Email reset mật khẩu đã được gửi" });
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }

    async resetPassword(req, res) {
        try {
            const { email, otp, newPassword } = req.body;
            await authService.resetPassword(email, otp, newPassword);
            res.json({ message: "Mật khẩu đã được reset" });
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }

    async changePassword(req, res) {
        try {
            const { oldPassword, newPassword } = req.body;
            const userId = req.user.userId;
            await authService.changePassword(userId, oldPassword, newPassword);
            res.json({ message: "Mật khẩu đã được đổi" });
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }
}

module.exports = new AuthController();
