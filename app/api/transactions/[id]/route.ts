import { NextResponse } from 'next/server';
import { getTransactions, upsertTransaction, deleteTransactionById } from '@/lib/database';
import type { Transaction } from '@/lib/database';

interface RouteContext {
  params: Promise<{ id: string }>;
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
