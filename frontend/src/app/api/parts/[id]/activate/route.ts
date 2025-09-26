import { NextRequest, NextResponse } from 'next/server';

// POST /api/parts/[id]/activate - Kích hoạt part
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const activatedPart = (global as any).db.activatePart(id);
    if (!activatedPart) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy part' },
        { status: 404 }
      );
    }

    // Broadcast update via WebSocket
    (global as any).db.broadcastAllData();
    
    return NextResponse.json({ success: true, data: activatedPart });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Có lỗi khi kích hoạt part' },
      { status: 500 }
    );
  }
}
