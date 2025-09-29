import { NextRequest, NextResponse } from 'next/server';

// DELETE /api/leaders/[id] - Xóa leader
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deletedLeader = global.db.deleteLeader(id);
    if (!deletedLeader) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy leader' },
        { status: 404 }
      );
    }

    // Broadcast update via WebSocket
    global.db.broadcastAllData();
    
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Có lỗi khi xóa leader' },
      { status: 500 }
    );
  }
}
