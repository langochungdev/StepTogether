import { NextResponse } from 'next/server';

// GET /api/parts/active - Lấy part đang active
export async function GET() {
  try {
    const activePart = global.db.getActivePart();
    return NextResponse.json({ success: true, data: activePart });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Có lỗi khi lấy part active' },
      { status: 500 }
    );
  }
}
