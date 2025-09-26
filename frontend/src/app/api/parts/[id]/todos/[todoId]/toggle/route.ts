import { NextRequest, NextResponse } from 'next/server';

// POST /api/parts/[id]/todos/[todoId]/toggle - Toggle todo completion trong part
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; todoId: string }> }
) {
  try {
    const { id, todoId } = await params;
    const updatedPart = global.db.toggleTodoCompletion(id, todoId);
    if (!updatedPart) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy part hoặc todo' },
        { status: 404 }
      );
    }

    // Broadcast update via WebSocket
    global.db.broadcastAllData();
    
    return NextResponse.json({ success: true, data: updatedPart });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Có lỗi khi cập nhật todo' },
      { status: 500 }
    );
  }
}
