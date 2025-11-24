// src/controllers/readingHistory.controllers.js
const readingHistoryService = require("../services/readingHistory.services");

class ReadingHistoryController {
    async addOrUpdateReadingHistory(req, res) {
        try {
            const { comicId, comicSlug, comicName, comicThumb, currentChapter } = req.body;
            const userId = req.user.userId;
            const history = await readingHistoryService.addOrUpdateReadingHistory(userId, comicId, comicSlug, comicName, comicThumb, currentChapter);
            res.status(201).json({ history });
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }

    async getReadingHistory(req, res) {
        try {
            const userId = req.user.userId;
            const histories = await readingHistoryService.getReadingHistory(userId);
            res.json({ histories });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    async removeReadingHistory(req, res) {
        try {
            const { comicId } = req.params;
            const userId = req.user.userId;
            const result = await readingHistoryService.removeReadingHistory(userId, comicId);
            res.json(result);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }
}

module.exports = new ReadingHistoryController();