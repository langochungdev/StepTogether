import { NextResponse } from 'next/server';

// GET /api/system/stats - Lấy thống kê hệ thống
export async function GET() {
  try {
    const stats = global.db.getSystemStats();
    return NextResponse.json({ success: true, data: stats });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Có lỗi khi lấy thống kê' },
      { status: 500 }
    );
  }
}
