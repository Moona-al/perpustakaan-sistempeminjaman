import { NextResponse } from 'next/server';
import { rejectPendingTransaction } from '@/lib/database';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await rejectPendingTransaction(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Transaksi tidak ditemukan atau bukan status pending.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error rejecting transaction:', error);
    return NextResponse.json({ error: 'Gagal menolak transaksi.' }, { status: 500 });
  }
}
