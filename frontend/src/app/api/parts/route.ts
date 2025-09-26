import { NextRequest, NextResponse } from 'next/server';

// GET /api/parts - Lấy danh sách tất cả parts
export async function GET() {
  try {
    const parts = (global as any).db.getParts();
    return NextResponse.json({ success: true, data: parts });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Có lỗi khi lấy danh sách parts' },
      { status: 500 }
    );
  }
}

// POST /api/parts - Tạo part mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, todoList } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Tên part không được để trống' },
        { status: 400 }
      );
    }

    const newPart = (global as any).db.createPart(name.trim(), description || '', todoList || []);
    
    // Broadcast update via WebSocket
    (global as any).db.broadcastAllData();
    
    return NextResponse.json({ success: true, data: newPart });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Có lỗi khi tạo part' },
      { status: 500 }
    );
  }
}
