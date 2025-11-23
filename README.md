# Node.js Test Project

Đây là dự án demo API sử dụng Node.js, Express, Sequelize, PostgreSQL, JWT và Swagger.

## Yêu cầu hệ thống

- Node.js (phiên bản 14 trở lên)
- PostgreSQL (hoặc sử dụng SQLite nếu muốn đơn giản hóa)

## Cài đặt

1. **Clone repository:**
   ```bash
   git clone https://github.com/NgocThachTN/nodejs-test.git
   cd nodejs-test
   ```

2. **Cài đặt dependencies:**
   ```bash
   npm install
   ```

3. **Thiết lập cơ sở dữ liệu:**

   - Cài đặt PostgreSQL nếu chưa có.
   - Tạo một database mới (ví dụ: `nodejs_test`).

4. **Cấu hình biến môi trường:**

   Tạo file `.env` trong thư mục gốc của dự án với nội dung sau:
   ```
   DB_NAME=nodejs_test
   DB_USER=your_db_user
   DB_PASS=your_db_password
   DB_HOST=localhost
   DB_PORT=5432
   ```

   Thay thế `your_db_user` và `your_db_password` bằng thông tin đăng nhập PostgreSQL của bạn.

   Nếu muốn sử dụng SQLite thay vì PostgreSQL, bạn có thể sửa file `src/config/database.js` để sử dụng SQLite.

5. **Chạy ứng dụng:**
   ```bash
   npm start
   ```

   Ứng dụng sẽ chạy trên `http://localhost:3000`.

6. **Truy cập Swagger Docs:**

   Mở trình duyệt và truy cập: `http://localhost:3000/api-docs`

## API Endpoints

- `GET /api/hello` - API chào đơn giản
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `GET /api/users` - Lấy danh sách người dùng (cần xác thực)
- Các endpoint khác được mô tả trong Swagger Docs.

## Cấu trúc dự án

```
src/
├── config/
│   └── database.js          # Cấu hình kết nối DB
├── controllers/
│   ├── auth.controllers.js  # Controller cho authentication
│   └── user.controllers.js  # Controller cho user
├── model/
│   └── user.model.js        # Model User
├── routes/
│   ├── auth.routes.js       # Routes cho auth
│   └── user.routes.js       # Routes cho user
├── services/
│   ├── auth.services.js     # Service logic cho auth
│   └── user.services.js     # Service logic cho user
└── utils/                   # Các tiện ích
```

## Chạy test

Hiện tại chưa có test được cấu hình. Để thêm test, bạn có thể sử dụng Jest hoặc Mocha.

```bash
npm test
```

## Đóng góp

1. Fork dự án
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## Giấy phép

ISC