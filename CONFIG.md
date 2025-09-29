# Environment Configuration

## Single Origin Setup

Thay vì phải cấu hình nhiều URLs riêng biệt, giờ chỉ cần cấu hình 1 URL gốc duy nhất trong file `.env.local`:

```bash
# Chỉ cần thay đổi URL này
NEXT_PUBLIC_ORIGIN=https://your-domain.com
```

## Tự động Generate URLs

Hệ thống sẽ tự động tạo ra các URLs khác:
- API URL: `{ORIGIN}/api`
- WebSocket URL: `{ORIGIN}/ws/updates` (tự động chuyển đổi http/https thành ws/wss)

## Ví dụ

### Development (Local)
```bash
NEXT_PUBLIC_ORIGIN=http://localhost:3000
```

### Production
```bash
NEXT_PUBLIC_ORIGIN=https://your-production-domain.com
```

### Cloudflare Tunnel
```bash
NEXT_PUBLIC_ORIGIN=https://your-tunnel-subdomain.trycloudflare.com
```

## Lợi ích

1. **Đơn giản hóa**: Chỉ cần thay 1 URL thay vì 2-3 URLs
2. **Tránh sai sót**: Không thể thiết lập sai protocol cho WebSocket
3. **Dễ maintain**: Khi đổi domain chỉ cần sửa 1 chỗ
4. **Auto-detect protocol**: Tự động chuyển đổi http/https thành ws/wss cho WebSocket