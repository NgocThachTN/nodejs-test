// Module để quản lý users online
const onlineUsers = new Map(); // userId -> socketId

const addUser = (userId, socketId) => {
    onlineUsers.set(userId, socketId);
};

const removeUser = (userId) => {
    onlineUsers.delete(userId);
};

const getOnlineUsers = () => {
    return Array.from(onlineUsers.keys());
};

const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
};

module.exports = {
    addUser,
    removeUser,
    getOnlineUsers,
    isUserOnline,
    onlineUsers, // Để access trực tiếp nếu cần
};