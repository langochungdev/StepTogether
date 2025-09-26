import { NextRequest, NextResponse } from 'next/server';

// PUT /api/parts/[id] - Cập nhật part
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, description, todoList } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Tên part không được để trống' },
        { status: 400 }
      );
    }

    const updatedPart = (global as any).db.updatePart(id, name.trim(), description || '', todoList || []);
    
    if (!updatedPart) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy part' },
        { status: 404 }
      );
    }

    // Broadcast update via WebSocket
    (global as any).db.broadcastAllData();
    
    return NextResponse.json({ success: true, data: updatedPart });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Có lỗi khi cập nhật part' },
      { status: 500 }
    );
  }
}

// DELETE /api/parts/[id] - Xóa part
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const deletedPart = (global as any).db.deletePart(id);
    if (!deletedPart) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy part' },
        { status: 404 }
      );
    }

    // Broadcast update via WebSocket
    (global as any).db.broadcastAllData();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Có lỗi khi xóa part' },
      { status: 500 }
    );
  }
}
