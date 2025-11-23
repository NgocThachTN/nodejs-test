const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../model/user.model");

exports.register = async (email, password, fullname) => {
  const exists = await User.findOne({ where: { email } });
  if (exists) throw new Error("Email đã tồn tại");

  const hash = await bcrypt.hash(password, 10);

  const user = await User.create({
    email,
    passwordHash: hash,
    fullname,
  });

  return user;
};

exports.login = async (email, password) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("Sai email hoặc mật khẩu");

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) throw new Error("Sai email hoặc mật khẩu");

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return { token, user };
};
