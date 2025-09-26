import { NextRequest, NextResponse } from 'next/server';

// POST /api/parts/[id]/todos/[todoId]/toggle - Toggle todo completion trong part
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; todoId: string } }
) {
  try {
    const { id, todoId } = params;
    const updatedPart = (global as any).db.toggleTodoCompletion(id, todoId);
    if (!updatedPart) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy part hoặc todo' },
        { status: 404 }
      );
    }

    // Broadcast update via WebSocket
    (global as any).db.broadcastAllData();
    
    return NextResponse.json({ success: true, data: updatedPart });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Có lỗi khi cập nhật todo' },
      { status: 500 }
    );
  }
}
