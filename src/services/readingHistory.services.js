// src/services/readingHistory.services.js
const ReadingHistory = require("../model/readingHistory.model");

class ReadingHistoryService {
    async addOrUpdateReadingHistory(userId, comicId, comicSlug, comicName, comicThumb, currentChapter) {
        const existing = await ReadingHistory.findOne({ where: { userId, comicId } });
        if (existing) {
            // Update lastReadAt and currentChapter
            await existing.update({ lastReadAt: new Date(), currentChapter });
            return existing;
        } else {
            // Create new
            const history = await ReadingHistory.create({
                userId,
                comicId,
                comicSlug,
                comicName,
                comicThumb,
                currentChapter,
            });
            return history;
        }
    }

    async getReadingHistory(userId) {
        const histories = await ReadingHistory.findAll({
            where: { userId },
            order: [['lastReadAt', 'DESC']],
        });
        return histories;
    }

    async removeReadingHistory(userId, comicId) {
        const history = await ReadingHistory.findOne({ where: { userId, comicId } });
        if (!history) throw new Error("Không tìm thấy trong lịch sử");

        await history.destroy();
        return { message: "Đã xóa khỏi lịch sử đọc" };
    }
}

module.exports = new ReadingHistoryService();