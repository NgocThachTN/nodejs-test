const express = require("express");
const router = express.Router();
const { ProfileController, upload } = require("../controllers/profile.controllers");
const { authenticate } = require("../middlewares/auth.middleware");

/**
 * @swagger
 * /api/profile:
 *   get:
 *     tags: ["Profile"]
 *     summary: Lấy profile của user hiện tại
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     fullname:
 *                       type: string
 *                     role:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                 favorites:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       favoriteId:
 *                         type: integer
 *                       comicId:
 *                         type: integer
 *                       comicSlug:
 *                         type: string
 *                       comicName:
 *                         type: string
 *                       comicThumb:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 readingHistory:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       historyId:
 *                         type: integer
 *                       comicId:
 *                         type: integer
 *                       comicSlug:
 *                         type: string
 *                       comicName:
 *                         type: string
 *                       comicThumb:
 *                         type: string
 *                       currentChapter:
 *                         type: integer
 *                       lastReadAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Chưa đăng nhập
 *       500:
 *         description: Lỗi server
 *   put:
 *     tags: ["Profile"]
 *     summary: Cập nhật profile của user hiện tại
 *     security:
 *       - bearerAuth: []
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
 *         description: Profile đã được cập nhật
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     fullname:
 *                       type: string
 *                     role:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Lỗi khi cập nhật profile
 *       401:
 *         description: Chưa đăng nhập
 *       500:
 *         description: Lỗi server
 *   post:
 *     tags: ["Profile"]
 *     summary: Upload avatar cho user hiện tại
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: File hình ảnh avatar (max 5MB)
 *     responses:
 *       200:
 *         description: Avatar đã được upload
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 avatar:
 *                   type: string
 *       400:
 *         description: Lỗi khi upload avatar
 *       401:
 *         description: Chưa đăng nhập
 *       500:
 *         description: Lỗi server
 */
router.get("/", authenticate, ProfileController.getProfile);
router.put("/", authenticate, ProfileController.updateProfile);
router.post("/", authenticate, upload.single('avatar'), ProfileController.uploadAvatar);
router.post("/avatar", authenticate, upload.single('avatar'), ProfileController.uploadAvatar);

module.exports = router;