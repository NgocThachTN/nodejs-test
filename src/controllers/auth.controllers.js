const authService = require("../services/auth.services");

exports.register = async (req, res) => {
  try {
    const { email, password, fullname } = req.body;
    const user = await authService.register(email, password, fullname);
    res.json({ message: "Đăng ký thành công", user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = await authService.login(email, password);
    res.json({ message: "Đăng nhập thành công", ...data });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};
