// src/model/favorite.model.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Favorite = sequelize.define(
    "Favorite",
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
    },
    {
        tableName: "Favorites",
        timestamps: true,
    }
);

const User = require("./user.model");

Favorite.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = Favorite;