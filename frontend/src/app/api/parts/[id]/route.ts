import { NextRequest, NextResponse } from 'next/server';

// PUT /api/parts/[id] - Cập nhật part
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, todoList } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Tên part không được để trống' },
        { status: 400 }
      );
    }

    const updatedPart = global.db.updatePart(id, name.trim(), description || '', todoList || []);
    
    if (!updatedPart) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy part' },
        { status: 404 }
      );
    }

    // Broadcast update via WebSocket
    global.db.broadcastAllData();
    
    return NextResponse.json({ success: true, data: updatedPart });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Có lỗi khi cập nhật part' },
      { status: 500 }
    );
  }
}

// DELETE /api/parts/[id] - Xóa part
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deletedPart = global.db.deletePart(id);
    if (!deletedPart) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy part' },
        { status: 404 }
      );
    }

    // Broadcast update via WebSocket
    global.db.broadcastAllData();
    
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Có lỗi khi xóa part' },
      { status: 500 }
    );
  }
}
