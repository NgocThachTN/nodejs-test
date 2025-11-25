# Node.js Test Project

Đây là dự án demo API sử dụng Node.js, Express, Sequelize, PostgreSQL, JWT và Swagger cho ứng dụng đọc truyện.

## Tính năng chính

- Authentication: Đăng ký/đăng nhập với OTP email, đăng nhập Google OAuth2
- User Management: Quản lý profile người dùng
- Comments: Hệ thống bình luận cho truyện
- Favorites: Danh sách truyện yêu thích
- Reading History: Lịch sử đọc truyện
- Email OTP: Xác nhận email cho đăng ký và reset mật khẩu
- JWT Authentication: Bảo mật API với JSON Web Tokens
- Swagger Documentation: Tài liệu API tự động

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
   # Database
   DB_NAME=nodejs_test
   DB_USER=your_db_user
   DB_PASS=your_db_password
   DB_HOST=localhost
   DB_PORT=5432

   # JWT
   JWT_SECRET=your_jwt_secret_key

   # Email (cho OTP)
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password

   # Frontend URL
   FRONTEND_URL=http://localhost:3000
   FE_URL=http://localhost:3000

   # Session (cho Passport.js)
   SESSION_SECRET=your_session_secret_key

   # Google OAuth2 (tùy chọn)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # Production
   NODE_ENV=development
   RENDER_EXTERNAL_URL=https://your-render-url.onrender.com
   ```

   **Giải thích các biến:**
   - `DB_*`: Thông tin kết nối PostgreSQL
   - `JWT_SECRET`: Khóa bí mật cho JWT token
   - `EMAIL_USER/EMAIL_PASS`: Tài khoản Gmail để gửi OTP (dùng App Password)
   - `FRONTEND_URL/FE_URL`: URL của frontend
   - `SESSION_SECRET`: Khóa cho session middleware
   - `GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET`: Credentials từ Google Console (tùy chọn)
   - `NODE_ENV/RENDER_EXTERNAL_URL`: Cho production deployment

5. **Chạy ứng dụng:**
   ```bash
   npm start
   ```

   Ứng dụng sẽ chạy trên `http://localhost:3000`.

6. **Truy cập Swagger Docs:**

   Mở trình duyệt và truy cập: `http://localhost:3000/api/swagger.html`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản (Bước 1: Điền thông tin và gửi OTP)
- `POST /api/auth/verify-register` - Xác nhận OTP đăng ký (Bước 2)
- `POST /api/auth/complete-register` - Hoàn tất đăng ký với mật khẩu (Bước 3)
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/forgot-password` - Quên mật khẩu (gửi OTP qua email)
- `POST /api/auth/reset-password` - Reset mật khẩu với OTP
- `POST /api/auth/verify-otp` - Xác nhận OTP
- `POST /api/auth/change-password` - Đổi mật khẩu (cần JWT token)
- `GET /api/auth/google` - Đăng nhập với Google
- `GET /api/auth/google/callback` - Callback từ Google (trả về token + user info)

### Users
- `GET /api/users` - Lấy danh sách người dùng (cần xác thực)
- `GET /api/users/profile` - Lấy thông tin profile (cần JWT)
- `PUT /api/users/profile` - Cập nhật profile (cần JWT)

### Comments
- `POST /api/comments` - Thêm comment (cần JWT)
- `GET /api/comments/{comicId}` - Lấy comments cho truyện
- `PUT /api/comments/{commentId}` - Cập nhật comment (cần JWT)
- `DELETE /api/comments/{commentId}` - Xóa comment (cần JWT)

### Favorites
- `POST /api/favorites` - Thêm vào yêu thích (cần JWT)
- `GET /api/favorites` - Lấy danh sách yêu thích (cần JWT)
- `DELETE /api/favorites/{comicId}` - Xóa khỏi yêu thích (cần JWT)

### Reading History
- `POST /api/reading-history` - Thêm/cập nhật lịch sử đọc (cần JWT)
- `GET /api/reading-history` - Lấy lịch sử đọc (cần JWT)
- `DELETE /api/reading-history/{comicId}` - Xóa lịch sử đọc (cần JWT)

Các endpoint khác được mô tả chi tiết trong Swagger Docs.

## Flow Đăng Ký Tài Khoản

Dự án sử dụng hệ thống đăng ký 3 bước với xác nhận email qua OTP:

### Bước 1: Điền thông tin và gửi OTP
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "confirmpassword": "password123",
  "fullname": "Nguyễn Văn A"
}
```

### Bước 2: Xác nhận OTP
```bash
POST /api/auth/verify-register
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

### Bước 3: Hoàn tất đăng ký
```bash
POST /api/auth/complete-register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

## Đăng Nhập Google

API hỗ trợ đăng nhập với Google OAuth2:

### Khởi tạo đăng nhập
```bash
GET /api/auth/google
```
Sẽ redirect đến trang đăng nhập Google.

### Callback từ Google
```bash
GET /api/auth/google/callback
```
Sau khi đăng nhập thành công, trả về:
- **API call**: JSON response với token và thông tin user
- **Browser redirect**: Redirect về frontend với token và user info trong URL

Response mẫu:
```json
{
  "message": "Đăng nhập Google thành công",
  "token": "jwt_token_here",
  "user": {
    "userId": 1,
    "email": "user@gmail.com",
    "fullname": "Nguyễn Văn A"
  }
}
```

## Cấu trúc dự án

```
src/
├── config/
│   └── database.js              # Cấu hình kết nối DB
├── controllers/
│   ├── auth.controllers.js      # Controller cho authentication
│   ├── comment.controllers.js   # Controller cho comments
│   ├── favorite.controllers.js  # Controller cho favorites
│   ├── readingHistory.controllers.js  # Controller cho lịch sử đọc
│   └── user.controllers.js      # Controller cho user
├── middlewares/
│   └── auth.middleware.js       # Middleware xác thực JWT
├── model/
│   ├── comment.model.js         # Model Comment
│   ├── favorite.model.js        # Model Favorite
│   ├── readingHistory.model.js  # Model Reading History
│   └── user.model.js            # Model User
├── routes/
│   ├── auth.routes.js           # Routes cho authentication
│   ├── comment.routes.js        # Routes cho comments
│   ├── favorite.routes.js       # Routes cho favorites
│   ├── readingHistory.routes.js # Routes cho lịch sử đọc
│   └── user.routes.js           # Routes cho user
├── services/
│   ├── auth.services.js         # Service logic cho auth
│   ├── comment.services.js      # Service cho comments
│   ├── favorite.services.js     # Service cho favorites
│   ├── mail.services.js         # Service gửi email
│   ├── readingHistory.services.js # Service cho lịch sử đọc
│   └── user.services.js         # Service logic cho user
└── utils/                       # Các tiện ích
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