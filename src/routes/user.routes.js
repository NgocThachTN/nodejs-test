const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controllers");
const { authenticate, authorizeAdmin } = require("../middlewares/auth.middleware");

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: ["User"]
 *     summary: Lấy danh sách tất cả user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: integer
 *                   email:
 *                     type: string
 *                   fullname:
 *                     type: string
 *                   role:
 *                     type: string
 *                     enum: [user, admin]
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *   post:
 *     tags: ["User"]
 *     summary: Tạo user mới
 *     security:
 *       - bearerAuth: []
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
 *               fullname:
 *                 type: string
 *     responses:
 *       201:
 *         description: User đã được tạo
 *       400:
 *         description: Lỗi khi tạo user
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 */
router.get("/", authenticate, authorizeAdmin, userController.getUsers);
router.post("/", authenticate, authorizeAdmin, userController.createUser);

/**
 * @swagger
 * /api/users/{userId}:
 *   put:
 *     tags: ["User"]
 *     summary: Cập nhật user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullname:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: User đã được cập nhật
 *       400:
 *         description: Lỗi khi cập nhật user
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *   delete:
 *     tags: ["User"]
 *     summary: Xóa user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User đã được xóa
 *       400:
 *         description: Lỗi khi xóa user
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 */
router.put("/:userId", authenticate, authorizeAdmin, userController.updateUser);
router.delete("/:userId", authenticate, authorizeAdmin, userController.deleteUser);

/**
 * @swagger
 * /api/users/{userId}:
 *   get:
 *     tags: ["User"]
 *     summary: Lấy thông tin user theo ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Thông tin user
 *       401:
 *         description: Chưa đăng nhập
 *       404:
 *         description: User không tồn tại
 */
router.get("/:userId", authenticate, userController.getUserById);

module.exports = router;