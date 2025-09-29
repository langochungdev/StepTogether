import { NextRequest, NextResponse } from 'next/server';

// POST /api/leaders/[id]/help - Toggle help status
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const needsHelp = searchParams.get('needsHelp') === 'true';
    
    const updatedLeader = global.db.toggleLeaderHelp(id, needsHelp);
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
      { success: false, error: 'Có lỗi khi cập nhật trạng thái hỗ trợ' },
      { status: 500 }
    );
  }
}
