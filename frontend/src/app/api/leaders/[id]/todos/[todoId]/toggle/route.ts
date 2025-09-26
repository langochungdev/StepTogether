import { NextRequest, NextResponse } from 'next/server';

// POST /api/leaders/[id]/todos/[todoId]/toggle - Toggle todo completion
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; todoId: string } }
) {
  try {
    const { id, todoId } = params;
    const result = (global as any).db.toggleLeaderTodo(id, todoId);
    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy leader hoặc todo' },
        { status: 404 }
      );
    }

    // Broadcast update via WebSocket
    (global as any).db.broadcastAllData();
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Có lỗi khi cập nhật todo' },
      { status: 500 }
    );
  }
}
