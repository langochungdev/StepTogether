# StepTogether Frontend

Ứng dụng web theo dõi tiến trình hoàn thành nhiệm vụ của các nhóm leaders.

## Tính năng

### 1. Trang Leader (`/leader`)
- Form đăng ký tên leader
- Nút "Hoàn thành" để báo cáo khi đã xong nhiệm vụ
- Hiển thị trạng thái hiện tại
- Support URL parameters để bookmark

### 2. Trang Dashboard (`/dashboard`)
- Bảng 2 cột: Chưa hoàn thành / Đã hoàn thành
- Tự động cập nhật mỗi 3 giây
- Nút "Reset tất cả" để đưa tất cả leaders về trạng thái chờ
- Thống kê tổng quan

### 3. API Routes
- `GET /api/leaders` - Lấy danh sách tất cả leaders
- `POST /api/leaders` - Đăng ký leader mới
- `POST /api/leaders/[id]/complete` - Báo hoàn thành
- `POST /api/reset` - Reset tất cả về trạng thái chờ

## Cấu trúc dự án

```
src/
├── app/
│   ├── layout.tsx              # Layout chính
│   ├── page.tsx                # Trang chủ (redirect to dashboard)
│   ├── leader/
│   │   └── page.tsx            # Trang leader
│   ├── dashboard/
│   │   └── page.tsx            # Trang dashboard
│   └── api/                    # API routes
│       ├── leaders/
│       │   ├── route.ts        # CRUD leaders
│       │   └── [id]/complete/
│       │       └── route.ts    # Complete leader
│       └── reset/
│           └── route.ts        # Reset all
├── components/
│   ├── LeaderForm.tsx          # Form đăng ký leader
│   ├── LeaderButton.tsx        # Nút hoàn thành
│   ├── DashboardTable.tsx      # Bảng 2 cột
│   └── ResetButton.tsx         # Nút reset
└── lib/
    ├── data.ts                 # Data management (in-memory)
    ├── api.ts                  # API client helpers
    └── websocket.ts            # WebSocket client (optional)
```

## Chạy dự án

1. Cài đặt dependencies:
```bash
npm install
```

2. Chạy development server:
```bash
npm run dev
```

3. Mở trình duyệt: http://localhost:3000

## Sử dụng

### Cho Leaders:
1. Truy cập `/leader`
2. Nhập tên và đăng ký
3. Nhấn "Hoàn thành" khi xong nhiệm vụ

### Cho Giảng viên:
1. Truy cập `/dashboard`
2. Theo dõi tiến trình realtime
3. Dùng nút "Reset tất cả" khi cần reset

## Lưu ý kỹ thuật

- **Lưu trữ dữ liệu**: Hiện tại dùng in-memory storage, trong production nên chuyển sang database
- **Real-time updates**: Hiện tại dùng polling mỗi 3s, có thể nâng cấp lên WebSocket
- **Error handling**: Đã có basic error handling và loading states
- **Responsive**: UI responsive với Tailwind CSS

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **API**: Next.js API Routes
- **Data**: In-memory storage (có thể mở rộng)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
