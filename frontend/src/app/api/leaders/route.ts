import { NextRequest, NextResponse } from 'next/server';

// GET /api/leaders - Lấy danh sách tất cả leaders
export async function GET() {
  try {
    const leaders = (global as any).db.getLeaders();
    return NextResponse.json({ success: true, data: leaders });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Có lỗi khi lấy danh sách leaders' },
      { status: 500 }
    );
  }
}

// POST /api/leaders/register - Đăng ký leader mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Tên leader không được để trống' },
        { status: 400 }
      );
    }

    const newLeader = (global as any).db.registerLeader(name.trim());
    
    // Broadcast update via WebSocket
    (global as any).db.broadcastAllData();
    
    return NextResponse.json({ success: true, data: newLeader });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Có lỗi khi đăng ký leader' },
      { status: 500 }
    );
  }
}
