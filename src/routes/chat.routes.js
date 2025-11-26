const express = require('express');
const router = express.Router();
const { getMessages, sendMessageController, markAsRead } = require('../controllers/chat.controllers');
const { authenticate } = require('../middlewares/auth.middleware');
const { getOnlineUsers } = require('../utils/onlineUsers');
const User = require('../model/user.model');

/**
 * @swagger
 * /api/chat/messages/{receiverId}:
 *   get:
 *     tags: ['Chat']
 *     summary: Lấy tin nhắn giữa hai user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: receiverId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Danh sách tin nhắn
 */
router.get('/messages/:receiverId', authenticate, getMessages);

/**
 * @swagger
 * /api/chat/send:
 *   post:
 *     tags: ['Chat']
 *     summary: Gửi tin nhắn
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               receiverId:
 *                 type: integer
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Gửi thành công
 */
router.post('/send', authenticate, sendMessageController);

/**
 * @swagger
 * /api/chat/online-users:
 *   get:
 *     tags: ['Chat']
 *     summary: Lấy danh sách user đang online
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách user đang online
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 onlineUsers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: integer
 *                       fullname:
 *                         type: string
 *                       email:
 *                         type: string
 *                       avatar:
 *                         type: string
 */
router.get('/online-users', authenticate, async (req, res) => {
    try {
        // Lấy user có lastSeenAt trong 3 phút gần đây
        const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000);
        const onlineUsers = await User.findAll({
            where: {
                lastSeenAt: {
                    [require('sequelize').Op.gt]: threeMinutesAgo
                }
            },
            attributes: ['userId', 'fullname', 'email', 'avatar']
        });
        res.json({ onlineUsers });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /api/chat/mark-read/{senderId}:
 *   put:
 *     tags: ['Chat']
 *     summary: Đánh dấu tin nhắn đã đọc
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: senderId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Đã đánh dấu đã đọc
 */
router.put('/mark-read/:senderId', authenticate, markAsRead);

module.exports = router;