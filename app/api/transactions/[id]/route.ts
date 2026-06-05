import { NextResponse } from 'next/server';
import { getTransactions, upsertTransaction, deleteTransactionById, approvePendingTransaction, rejectPendingTransaction } from '@/lib/database';
import type { Transaction } from '@/lib/database';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { action } = body;

    if (action === 'approve') {
      const approved = await approvePendingTransaction(id);
      if (!approved) {
        return NextResponse.json(
          { error: 'Transaksi tidak ditemukan atau bukan status pending.' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, transaction: approved });
    } else if (action === 'reject') {
      const deleted = await rejectPendingTransaction(id);
      if (!deleted) {
        return NextResponse.json(
          { error: 'Transaksi tidak ditemukan atau bukan status pending.' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Action tidak valid' }, { status: 400 });
  } catch (error) {
    console.error('Error processing transaction action:', error);
    return NextResponse.json({ error: 'Gagal memproses aksi transaksi' }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    // Fetch existing transaction to merge with
    const all = await getTransactions();
    const existing = all.find(t => t.id === id);
    if (!existing) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    const updatedTx: Transaction = { ...existing, ...body, id };
    await upsertTransaction(updatedTx);
    return NextResponse.json({ success: true, transaction: updatedTx });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const success = await deleteTransactionById(id);
    if (success) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
  }
}

