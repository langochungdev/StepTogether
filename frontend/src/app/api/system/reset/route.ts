import { NextResponse } from 'next/server';

// POST /api/system/reset - Reset toàn bộ hệ thống
export async function POST() {
  try {
    const message = global.db.resetSystem();
    
    // Broadcast update via WebSocket
    global.db.broadcastAllData();
    
    return NextResponse.json({ success: true, data: message });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Có lỗi khi reset hệ thống' },
      { status: 500 }
    );
  }
}
