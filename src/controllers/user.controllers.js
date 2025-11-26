const userService = require("../services/user.services");

class UserController {
    async getUsers(req, res) {
        try {
            const users = await userService.getAllUsers();
            res.status(200).json({ users });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    async createUser(req, res) {
        try {
            const { email, password, fullname } = req.body;
            const user = await userService.createUser(email, password, fullname);
            res.status(201).json({ user });
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }

    async updateUser(req, res) {
        try {
            const { userId } = req.params;
            const updates = req.body;
            const user = await userService.updateUser(userId, updates);
            res.status(200).json({ user });
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }

    async deleteUser(req, res) {
        try {
            const { userId } = req.params;
            const result = await userService.deleteUser(userId);
            res.status(200).json(result);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }

    async getUserById(req, res) {
        try {
            const { userId } = req.params;
            const user = await userService.getUserById(userId);
            res.status(200).json({ user });
        } catch (err) {
            res.status(404).json({ message: err.message });
        }
    }

module.exports = new UserController();