const User = require("../model/user.model");
const FavoriteService = require("./favorite.services");
const ReadingHistoryService = require("./readingHistory.services");
const firebaseConfig = require("../config/firebase");
const { v4: uuidv4 } = require('uuid');
const { isUserOnline } = require("../utils/onlineUsers");

class ProfileService {
    async getProfile(userId) {
        try {
            const user = await User.findByPk(userId, {
                attributes: { exclude: ['passwordHash', 'otp', 'otpExpires'] }
            });
            if (!user) throw new Error("User không tồn tại");
            const userData = user.toJSON();
            delete userData.otp;
            delete userData.otpExpires;

            const favorites = await FavoriteService.getFavorites(userId);
            const readingHistory = await ReadingHistoryService.getReadingHistory(userId);
            // User online nếu lastSeenAt trong 3 phút gần đây
            const isOnline = userData.lastSeenAt && (new Date() - new Date(userData.lastSeenAt)) < 3 * 60 * 1000;
            return {
                user: userData,
                favorites,
                readingHistory,
                isOnline
            };
        } catch (error) {
            throw new Error(`Lỗi khi lấy profile: ${error.message}`);
        }
    }

    async getProfileById(userId) {
        try {
            const user = await User.findByPk(userId, {
                attributes: { exclude: ['passwordHash', 'otp', 'otpExpires'] }
            });
            if (!user) throw new Error("User không tồn tại");
            const userData = user.toJSON();
            delete userData.otp;
            delete userData.otpExpires;

            const favorites = await FavoriteService.getFavorites(userId);
            const readingHistory = await ReadingHistoryService.getReadingHistory(userId);
            // User online nếu lastSeenAt trong 3 phút gần đây
            const isOnline = userData.lastSeenAt && (new Date() - new Date(userData.lastSeenAt)) < 3 * 60 * 1000;
            return {
                user: userData,
                favorites,
                readingHistory,
                isOnline
            };
        } catch (error) {
            throw new Error(`Lỗi khi lấy profile: ${error.message}`);
        }
    }

    async updateProfile(userId, updates) {
        try {
            const user = await User.findByPk(userId);
            if (!user) throw new Error("User không tồn tại");

            // Chỉ cho phép update fullname và email (nếu email chưa tồn tại)
            const { fullname, email } = updates;
            if (!fullname && !email) {
                throw new Error("Phải cung cấp ít nhất một trường để cập nhật (fullname hoặc email)");
            }
            if (email) {
                const emailExists = await User.findOne({ where: { email, userId: { [require('sequelize').Op.ne]: userId } } });
                if (emailExists) throw new Error("Email đã tồn tại");
            }

            await user.update({ fullname, email });
            const { passwordHash, ...userWithoutPassword } = user.toJSON();
            return userWithoutPassword;
        } catch (error) {
            throw new Error(`Lỗi khi cập nhật profile: ${error.message}`);
        }
    }

    async uploadAvatar(userId, file) {
        try {
            if (!firebaseConfig) throw new Error("Firebase chưa được cấu hình. Vui lòng thiết lập serviceAccountKey.json và FIREBASE_STORAGE_BUCKET.");

            const { bucket } = firebaseConfig;
            if (!file) throw new Error("Không có file được upload");

            // Tạo tên file duy nhất
            const fileName = `avatars/${userId}_${Date.now()}_${file.originalname}`;
            const fileUpload = bucket.file(fileName);

            // Upload file lên Firebase Storage
            await fileUpload.save(file.buffer, {
                metadata: {
                    contentType: file.mimetype,
                },
            });

            // Làm file public và lấy URL
            await fileUpload.makePublic();
            const url = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

            // Cập nhật avatar trong DB
            const user = await User.findByPk(userId);
            if (!user) throw new Error("User không tồn tại");

            await user.update({ avatar: url });
            return { avatar: url };
        } catch (error) {
            throw new Error(`Lỗi khi upload avatar: ${error.message}`);
        }
    }
}

module.exports = new ProfileService();