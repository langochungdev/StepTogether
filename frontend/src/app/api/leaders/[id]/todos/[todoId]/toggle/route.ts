import { NextRequest, NextResponse } from 'next/server';

// POST /api/leaders/[id]/todos/[todoId]/toggle - Toggle todo completion
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; todoId: string }> }
) {
  try {
    const { id, todoId } = await params;
    const result = global.db.toggleLeaderTodo(id, todoId);
    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy leader hoặc todo' },
        { status: 404 }
      );
    }

    // Broadcast update via WebSocket
    global.db.broadcastAllData();
    
    return NextResponse.json({ success: true, data: result });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Có lỗi khi cập nhật todo' },
      { status: 500 }
    );
  }
}
