const Message = require('../model/message.model');

// Lấy tin nhắn giữa hai user
const getMessagesBetweenUsers = async (userId1, userId2) => {
    try {
        const messages = await Message.findAll({
            where: {
                [require('sequelize').Op.or]: [
                    { senderId: userId1, receiverId: userId2 },
                    { senderId: userId2, receiverId: userId1 },
                ],
            },
            order: [['createdAt', 'ASC']],
        });
        return messages;
    } catch (err) {
        throw new Error('Lỗi khi lấy tin nhắn: ' + err.message);
    }
};

// Lấy danh sách cuộc trò chuyện của user
const getConversationsForUser = async (userId) => {
    try {
        const messages = await Message.findAll({
            where: {
                [require('sequelize').Op.or]: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            },
            include: [
                { model: require('../model/user.model'), as: 'sender', attributes: ['userId', 'fullname', 'avatar'] },
                { model: require('../model/user.model'), as: 'receiver', attributes: ['userId', 'fullname', 'avatar'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        const conversations = {};
        messages.forEach(msg => {
            const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
            const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;
            if (!conversations[otherUserId]) {
                conversations[otherUserId] = {
                    user: otherUser,
                    lastMessage: msg,
                    unreadCount: 0
                };
            }
            if (!msg.isRead && msg.receiverId === userId) {
                conversations[otherUserId].unreadCount++;
            }
        });

        return Object.values(conversations);
    } catch (err) {
        throw new Error('Lỗi khi lấy cuộc trò chuyện: ' + err.message);
    }
};

// Gửi tin nhắn
const sendMessage = async (senderId, receiverId, message) => {
    try {
        if (!message || message.trim() === '') {
            throw new Error('Tin nhắn không được rỗng');
        }
        const newMessage = await Message.create({
            senderId,
            receiverId,
            message: message.trim(),
        });
        return newMessage;
    } catch (err) {
        throw new Error('Lỗi khi gửi tin nhắn: ' + err.message);
    }
};

// Đánh dấu tin nhắn đã đọc
const markMessagesAsRead = async (senderId, receiverId) => {
    try {
        await Message.update(
            { isRead: true },
            {
                where: {
                    senderId,
                    receiverId,
                    isRead: false,
                },
            }
        );
    } catch (err) {
        throw new Error('Lỗi khi đánh dấu đã đọc: ' + err.message);
    }
};

module.exports = {
    getMessagesBetweenUsers,
    getConversationsForUser,
    sendMessage,
    markMessagesAsRead,
};