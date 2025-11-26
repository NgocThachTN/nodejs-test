require("dotenv").config();
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");
const http = require("http");
const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");

// Kết nối DB
const sequelize = require("./src/config/database");

// Import model để Sequelize tạo bảng
require("./src/model/user.model");
require("./src/model/comment.model");
require("./src/model/favorite.model");
require("./src/model/readingHistory.model");
require("./src/model/message.model");

// Import routes
const authRoute = require("./src/routes/auth.routes");
const userRoute = require("./src/routes/user.routes");
const commentRoute = require("./src/routes/comment.routes");
const favoriteRoute = require("./src/routes/favorite.routes");
const readingHistoryRoute = require("./src/routes/readingHistory.routes");
const profileRoute = require("./src/routes/profile.routes");
const chatRoute = require("./src/routes/chat.routes");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: true,
    credentials: true,
  },
});

const port = process.env.PORT || 3000;

// Enable CORS
app.use(cors({
  origin: true,
  credentials: true
}));

// Session middleware for Passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Middleware đọc JSON
app.use(express.json());

// Passport config
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.NODE_ENV === 'production'
    ? `${process.env.RENDER_EXTERNAL_URL}/api/auth/google/callback`
    : "http://localhost:3000/api/auth/google/callback"
},
  async (accessToken, refreshToken, profile, done) => {
    try {
      const User = require("./src/model/user.model");
      const email = profile.emails[0].value;
      const fullname = profile.displayName;

      let user = await User.findOne({ where: { email } });
      if (!user) {
        // Generate random password
        const randomPassword = Math.random().toString(36).slice(-8); // 8 chars
        const bcrypt = require("bcrypt");
        const hash = await bcrypt.hash(randomPassword, 10);

        user = await User.create({
          email,
          passwordHash: hash,
          fullname,
        });

        // Send email async, don't block
        const { sendResetEmail } = require("./src/services/mail.services");
        console.log(`Attempting to send password to ${email}`);
        sendResetEmail(email, `Mật khẩu Google login của bạn là: ${randomPassword}. Hãy đổi mật khẩu sau khi đăng nhập.`)
          .then(() => console.log(`Password sent to ${email}`))
          .catch(err => console.error(`Failed to send email to ${email}:`, err));
      }

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.userId);
});

passport.deserializeUser(async (id, done) => {
  try {
    const User = require("./src/model/user.model");
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

app.use(passport.initialize());

// Swagger config
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TruyenReader API",
      version: "1.0.0",
      description: "API của TruyenReader dùng Node.js + Express + Swagger + PostgreSQL",
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' ? (process.env.RENDER_EXTERNAL_URL || 'https://nodejs-test-api-o7bd.onrender.com') : "http://localhost:3000",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    tags: [
      {
        name: 'Chat',
      }
    ],
  },
  apis: ["./index.js", "./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger UI
app.use("/api/swagger.html", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  deepLinking: false,
  docExpansion: 'none',
  filter: false,
  showExtensions: false,
  showCommonExtensions: false,
  defaultModelsExpandDepth: -1,
  defaultModelExpandDepth: -1,
  displayRequestDuration: false,
  tryItOutEnabled: true,
  layout: 'BaseLayout'
}));

// Route cho root
app.get("/", (req, res) => {
  res.json({ message: "API is running! Visit /api/swagger.html for documentation." });
});

// ------------------ ROUTES ----------------------
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/comments", commentRoute);
app.use("/api/favorites", favoriteRoute);
app.use("/api/reading-history", readingHistoryRoute);
app.use("/api/profile", profileRoute);
app.use("/api/chat", chatRoute);
// Example Hello API
/**
 * @swagger
 * /api/hello:
 *   get:
 *     summary: Hello API
 *     description: Trả về một câu chào đơn giản.
 *     responses:
 *       200:
 *         description: Success
 */
app.get("/api/hello", (req, res) => {
  res.json({ message: "Xin chào từ API!" });
});

app.get("/api/auth", (req, res) => {
  res.json({ message: "Auth route working!" });
});
const { addUser, removeUser, getOnlineUsers, isUserOnline, onlineUsers } = require('./src/utils/onlineUsers');

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log(`User ${socket.userId} connected`);

  // Thêm user vào online
  addUser(socket.userId, socket.id);

  // Phát danh sách online users
  io.emit('onlineUsers', getOnlineUsers());

  // Join room cho chat riêng tư
  socket.on('joinChat', (otherUserId) => {
    const room = [socket.userId, otherUserId].sort().join('-');
    socket.join(room);
  });

  // Nhận tin nhắn
  socket.on('sendMessage', async (data) => {
    try {
      const { receiverId, message } = data;
      const senderId = socket.userId;

      // Lưu vào DB
      const { sendMessage } = require('./src/services/chat.services');
      const newMessage = await sendMessage(senderId, receiverId, message);

      // Emit trực tiếp đến receiver nếu online
      if (isUserOnline(receiverId)) {
        const receiverSocketId = onlineUsers.get(receiverId);
        io.to(receiverSocketId).emit('newMessage', newMessage);
      }

      // Emit đến room (cho trường hợp cả 2 đã mở chat)
      const room = [senderId, receiverId].sort().join('-');
      io.to(room).emit('newMessage', newMessage);
    } catch (err) {
      socket.emit('error', err.message);
    }
  });

  // Đánh dấu đã đọc
  socket.on('markAsRead', async (senderId) => {
    try {
      const receiverId = socket.userId;
      const { markMessagesAsRead } = require('./src/services/chat.services');
      await markMessagesAsRead(senderId, receiverId);
    } catch (err) {
      socket.emit('error', err.message);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected`);
    removeUser(socket.userId);
    io.emit('onlineUsers', getOnlineUsers());
  });
});
sequelize
  .authenticate()
  .then(() => {
    console.log("DB connected!");
    return sequelize.sync({ alter: true }); //alter: true
  })
  .then(() => console.log("DB synced!"))
  .catch((err) => {
    console.error("DB error:", err);
    process.exit(1); // Exit if DB fail
  });

// ------------------ START SERVER -----------------
server.listen(port, () => {
  console.log(`Server chạy trên port ${port}`);
  console.log(`Swagger docs: https://${process.env.RENDER_EXTERNAL_URL || 'your-render-url.onrender.com'}/api/swagger.html`);
});
