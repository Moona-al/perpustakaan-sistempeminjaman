import { NextResponse } from 'next/server';
import { approvePendingTransaction } from '@/lib/database';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const approved = await approvePendingTransaction(id);

    if (!approved) {
      return NextResponse.json(
        { error: 'Transaksi tidak ditemukan atau bukan status pending.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, transaction: approved });
  } catch (error) {
    console.error('Error approving transaction:', error);
    return NextResponse.json({ error: 'Gagal menyetujui transaksi.' }, { status: 500 });
  }
}
