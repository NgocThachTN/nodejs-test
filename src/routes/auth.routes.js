const router = require("express").Router();
const controller = require("../controllers/auth.controllers");
const { authenticate } = require("../middlewares/auth.middleware");

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: ["Authentication"]
 *     summary: Đăng ký người dùng mới
 *     description: Tạo tài khoản người dùng mới
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               confirmpassword:
 *                 type: string
 *               fullname:
 *                 type: string
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *       400:
 *         description: Lỗi dữ liệu đầu vào
 */
router.post("/register", controller.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: ["Authentication"]
 *     summary: Đăng nhập
 *     description: Đăng nhập vào hệ thống
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *       401:
 *         description: Sai thông tin đăng nhập
 */
router.post("/login", controller.login);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     tags: ["Authentication"]
 *     summary: Quên mật khẩu
 *     description: Gửi email reset mật khẩu
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email đã được gửi
 *       400:
 *         description: Lỗi
 */
router.post("/forgot-password", controller.forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     tags: ["Authentication"]
 *     summary: Reset mật khẩu với OTP
 *     description: Đặt lại mật khẩu với OTP từ email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mật khẩu đã được reset
 *       400:
 *         description: Lỗi
 */
router.post("/reset-password", controller.resetPassword);

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     tags: ["Authentication"]
 *     summary: Đổi mật khẩu
 *     description: Đổi mật khẩu cho user đã đăng nhập (cần JWT token)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mật khẩu đã được đổi
 *       400:
 *         description: Lỗi
 *       401:
 *         description: Unauthorized
 */
router.post("/change-password", authenticate, controller.changePassword);

module.exports = router;
