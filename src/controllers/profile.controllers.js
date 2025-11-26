const profileService = require("../services/profile.services");
const multer = require("multer");

// Cấu hình multer để lưu file trong memory
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Chỉ chấp nhận file hình ảnh'));
        }
    }
});

class ProfileController {
    async getProfile(req, res) {
        try {
            const userId = req.user.userId;
            const profile = await profileService.getProfile(userId);
            res.status(200).json(profile);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    async updateProfile(req, res) {
        try {
            const userId = req.user.userId;
            const updates = req.body;
            const user = await profileService.updateProfile(userId, updates);
            res.status(200).json({ user });
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }

    async uploadAvatar(req, res) {
        try {
            const userId = req.user.userId;
            const file = req.file;
            const result = await profileService.uploadAvatar(userId, file);
            res.status(200).json({ message: "Avatar đã được upload", ...result });
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }
}

module.exports = { ProfileController: new ProfileController(), upload };