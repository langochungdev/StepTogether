import { NextRequest, NextResponse } from 'next/server';

// POST /api/leaders/[id]/complete - Hoàn thành leader
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updatedLeader = global.db.completeLeader(id);
    if (!updatedLeader) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy leader' },
        { status: 404 }
      );
    }

    // Broadcast update via WebSocket
    global.db.broadcastAllData();
    
    return NextResponse.json({ success: true, data: updatedLeader });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Có lỗi khi hoàn thành leader' },
      { status: 500 }
    );
  }
}
