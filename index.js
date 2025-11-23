require("dotenv").config();
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

// Kết nối DB
const sequelize = require("./src/config/database");

// Import model để Sequelize tạo bảng
require("./src/model/user.model");

// Import routes
const authRoute = require("./src/routes/auth.route");


const app = express();
const port = 3000;

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
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./index.js", "./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ------------------ ROUTES ----------------------
app.use("/api/auth", authRoute);
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
  .sync({ alter: true })
  .then(() => console.log("🔥 DB synced!"))
  .catch((err) => console.error("❌ DB error:", err));

// ------------------ START SERVER -----------------
app.listen(port, () => {
  console.log(`Server chạy: http://localhost:${port}`);
  console.log(`Swagger docs: http://localhost:${port}/api-docs`);
});
