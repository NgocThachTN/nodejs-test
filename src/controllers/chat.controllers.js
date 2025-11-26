const { getMessagesBetweenUsers, sendMessage, markMessagesAsRead } = require('../services/chat.services');

// Lấy tin nhắn giữa hai user
const getMessages = async (req, res) => {
    try {
        const { receiverId } = req.params;
        const senderId = req.user.userId; // Từ auth middleware

        if (!receiverId) {
            return res.status(400).json({ message: 'Thiếu receiverId' });
        }

        const messages = await getMessagesBetweenUsers(senderId, parseInt(receiverId));
        res.json({ messages });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Gửi tin nhắn
const sendMessageController = async (req, res) => {
    try {
        const { receiverId, message } = req.body;
        const senderId = req.user.userId;

        if (!receiverId || !message) {
            return res.status(400).json({ message: 'Thiếu receiverId hoặc message' });
        }

        const newMessage = await sendMessage(senderId, parseInt(receiverId), message);
        res.json({ message: 'Gửi thành công', data: newMessage });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Đánh dấu đã đọc
const markAsRead = async (req, res) => {
    try {
        const { senderId } = req.params;
        const receiverId = req.user.userId;

        await markMessagesAsRead(parseInt(senderId), receiverId);
        res.json({ message: 'Đã đánh dấu đã đọc' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getMessages,
    sendMessageController,
    markAsRead,
};