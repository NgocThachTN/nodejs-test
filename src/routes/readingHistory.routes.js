// src/routes/readingHistory.routes.js
const express = require("express");
const router = express.Router();
const readingHistoryController = require("../controllers/readingHistory.controllers");
const { authenticate } = require("../middlewares/auth.middleware");

/**
 * @swagger
 * /api/reading-history:
 *   post:
 *     tags: ["ReadingHistory"]
 *     summary: Thêm hoặc cập nhật lịch sử đọc
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comicId:
 *                 type: string
 *               comicSlug:
 *                 type: string
 *               comicName:
 *                 type: string
 *               comicThumb:
 *                 type: string
 *               currentChapter:
 *                 type: string
 *     responses:
 *       201:
 *         description: Lịch sử đã được thêm/cập nhật
 *       400:
 *         description: Lỗi
 *       401:
 *         description: Unauthorized
 *   get:
 *     tags: ["ReadingHistory"]
 *     summary: Lấy lịch sử đọc
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách lịch sử đọc
 *       500:
 *         description: Lỗi
 */
router.post("/", authenticate, readingHistoryController.addOrUpdateReadingHistory);
router.get("/", authenticate, readingHistoryController.getReadingHistory);

/**
 * @swagger
 * /api/reading-history/{comicId}:
 *   delete:
 *     tags: ["ReadingHistory"]
 *     summary: Xóa khỏi lịch sử đọc
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comicId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Đã xóa khỏi lịch sử đọc
 *       400:
 *         description: Lỗi
 *       401:
 *         description: Unauthorized
 */
router.delete("/:comicId", authenticate, readingHistoryController.removeReadingHistory);

module.exports = router;