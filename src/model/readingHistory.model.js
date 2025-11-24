// src/model/readingHistory.model.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ReadingHistory = sequelize.define(
    "ReadingHistory",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        comicId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        comicSlug: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        comicName: {
            type: DataTypes.STRING,
        },
        comicThumb: {
            type: DataTypes.STRING,
        },
        currentChapter: {
            type: DataTypes.STRING,
        },
        lastReadAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: "ReadingHistories",
        timestamps: true,
    }
);

const User = require("./user.model");

ReadingHistory.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = ReadingHistory;