require("dotenv").config();
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

// Kết nối DB
const sequelize = require("./src/config/database");

// Import model để Sequelize tạo bảng
require("./src/model/user.model");

// Import routes
const authRoute = require("./src/routes/auth.routes");
const userRoute = require("./src/routes/user.routes");

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Middleware đọc JSON
app.use(express.json());

// Swagger config
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Demo API với Swagger",
      version: "1.0.0",
      description: "API demo dùng Node.js + Express + Swagger + PostgreSQL",
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' ? (process.env.RENDER_EXTERNAL_URL || 'https://nodejs-test-api-o7bd.onrender.com') : "http://localhost:3000",
      },
    ],
  },
  apis: ["./index.js", "./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Route cho root
app.get("/", (req, res) => {
  res.json({ message: "API is running! Visit /api-docs for documentation." });
});

// ------------------ ROUTES ----------------------
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
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
    return sequelize.sync({ alter: true });
  })
  .then(() => console.log("DB synced!"))
  .catch((err) => {
    console.error("DB error:", err);
    process.exit(1); // Exit if DB fail
  });

// ------------------ START SERVER -----------------
app.listen(port, () => {
  console.log(`Server chạy trên port ${port}`);
  console.log(`Swagger docs: https://${process.env.RENDER_EXTERNAL_URL || 'your-render-url.onrender.com'}/api-docs`);
});
