# Hướng dẫn Deploy StepTogether lên Vercel

## Tổng quan
Project này đã được cấu hình để chạy hoàn toàn trên Vercel mà không cần backend Spring Boot riêng biệt. Tất cả API và WebSocket server đều được tích hợp vào Next.js.

## Cấu trúc
- **Frontend**: Next.js với TypeScript
- **API Routes**: `/api/*` - Tất cả API endpoints
- **WebSocket**: `/ws/updates` - Real-time updates
- **Database**: In-memory database (dữ liệu sẽ reset khi restart)

## Deploy lên Vercel

### 1. Chuẩn bị
```bash
cd frontend
npm install
```

### 2. Deploy
1. Đăng nhập vào [Vercel](https://vercel.com)
2. Import project từ GitHub
3. Chọn folder `frontend` làm root directory
4. Vercel sẽ tự động detect Next.js và build

### 3. Cấu hình Environment Variables (nếu cần)
- `NODE_ENV`: production
- `PORT`: 3000 (mặc định)

### 4. Test sau khi deploy
- Truy cập: `https://your-app.vercel.app`
- Test các chức năng:
  - Đăng ký leader
  - Tạo và quản lý parts
  - Real-time updates qua WebSocket
  - Reset hệ thống

## Chạy local development

```bash
cd frontend
npm run dev
```

Server sẽ chạy trên:
- Frontend: http://localhost:3000
- WebSocket: ws://localhost:3000/ws/updates

## Lưu ý quan trọng

1. **Database**: Dữ liệu chỉ lưu trong memory, sẽ mất khi restart server
2. **WebSocket**: Có thể không hoạt động trên một số hosting providers
3. **Scaling**: Chỉ phù hợp cho ứng dụng nhỏ, không phù hợp cho production lớn

## Troubleshooting

### WebSocket không hoạt động
- Kiểm tra console browser để xem lỗi
- Một số hosting providers không hỗ trợ WebSocket
- Có thể cần sử dụng Server-Sent Events thay thế

### API không hoạt động
- Kiểm tra logs trong Vercel dashboard
- Đảm bảo tất cả dependencies đã được cài đặt
- Kiểm tra file `vercel.json` cấu hình đúng

## Cải tiến có thể thêm

1. **Persistent Database**: Sử dụng SQLite hoặc external database
2. **Authentication**: Thêm JWT authentication
3. **Rate Limiting**: Thêm rate limiting cho API
4. **Error Handling**: Cải thiện error handling
5. **Logging**: Thêm logging system
