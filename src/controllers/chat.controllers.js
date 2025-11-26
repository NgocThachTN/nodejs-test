const { getMessagesBetweenUsers, getConversationsForUser, sendMessage, markMessagesAsRead } = require('../services/chat.services');

// Lấy tin nhắn giữa hai user
const getMessages = async (req, res) => {
    try {
        const { userId } = req.params;
        const senderId = req.user.userId; // Từ auth middleware

        if (!userId) {
            return res.status(400).json({ message: 'Thiếu userId' });
        }

        const messages = await getMessagesBetweenUsers(senderId, parseInt(userId));
        res.json({ messages });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Lấy danh sách cuộc trò chuyện
const getConversations = async (req, res) => {
    try {
        const userId = req.user.userId;
        const conversations = await getConversationsForUser(userId);
        res.json({ conversations });
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
    getConversations,
    sendMessageController,
    markAsRead,
};