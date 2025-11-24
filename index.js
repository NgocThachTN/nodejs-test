require("dotenv").config();
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");

// Kết nối DB
const sequelize = require("./src/config/database");

// Import model để Sequelize tạo bảng
require("./src/model/user.model");
require("./src/model/comment.model");
require("./src/model/favorite.model");
require("./src/model/readingHistory.model");

// Import routes
const authRoute = require("./src/routes/auth.routes");
const userRoute = require("./src/routes/user.routes");
const commentRoute = require("./src/routes/comment.routes");
const favoriteRoute = require("./src/routes/favorite.routes");
const readingHistoryRoute = require("./src/routes/readingHistory.routes");

const app = express();
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
})
// ------------------ SYNC DB ----------------------
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
app.listen(port, () => {
  console.log(`Server chạy trên port ${port}`);
  console.log(`Swagger docs: https://${process.env.RENDER_EXTERNAL_URL || 'your-render-url.onrender.com'}/api/swagger.html`);
});
