import { NextRequest, NextResponse } from 'next/server';

// POST /api/parts/[id]/activate - Kích hoạt part
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const activatedPart = global.db.activatePart(id);
    if (!activatedPart) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy part' },
        { status: 404 }
      );
    }

    // Broadcast update via WebSocket
    global.db.broadcastAllData();
    
    return NextResponse.json({ success: true, data: activatedPart });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Có lỗi khi kích hoạt part' },
      { status: 500 }
    );
  }
}
