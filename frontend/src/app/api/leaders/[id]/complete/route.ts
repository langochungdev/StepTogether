import { NextRequest, NextResponse } from 'next/server';

// POST /api/leaders/[id]/complete - Hoàn thành leader
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const updatedLeader = (global as any).db.completeLeader(id);
    if (!updatedLeader) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy leader' },
        { status: 404 }
      );
    }

    // Broadcast update via WebSocket
    (global as any).db.broadcastAllData();
    
    return NextResponse.json({ success: true, data: updatedLeader });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Có lỗi khi hoàn thành leader' },
      { status: 500 }
    );
  }
}
