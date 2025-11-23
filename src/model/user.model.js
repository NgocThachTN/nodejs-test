// src/model/user.model.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");  // Lấy đúng instance

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fullname: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "Users",
    timestamps: true,
  }
);

module.exports = User;
