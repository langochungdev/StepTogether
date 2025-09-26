import { NextRequest, NextResponse } from 'next/server';

// DELETE /api/leaders/[id] - Xóa leader
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const deletedLeader = (global as any).db.deleteLeader(id);
    if (!deletedLeader) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy leader' },
        { status: 404 }
      );
    }

    // Broadcast update via WebSocket
    (global as any).db.broadcastAllData();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Có lỗi khi xóa leader' },
      { status: 500 }
    );
  }
}
