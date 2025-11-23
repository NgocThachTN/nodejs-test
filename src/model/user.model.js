// src/model/user.model.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");  // Lấy đúng instance

const User = sequelize.define(
  "User",
  {
    userId: {
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
    otp: {
      type: DataTypes.STRING,
    },
    otpExpires: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "Users",
    timestamps: true,
  }
);

module.exports = User;
