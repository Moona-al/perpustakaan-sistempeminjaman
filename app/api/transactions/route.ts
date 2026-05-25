import { NextResponse } from 'next/server';
import { getTransactions, upsertTransaction } from '@/lib/database';
import type { Transaction } from '@/lib/database';

export async function GET() {
  try {
    const transactions = await getTransactions();
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      id, bookId, bookTitle, coverImage,
      studentName, studentUsername,
      borrowDate, dueDate, returnDate, status, fine
    } = body;

    if (!bookId || !bookTitle || !studentUsername || !studentName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newTx: Transaction = {
      id: id || 'tx_' + Date.now().toString(),
      bookId,
      bookTitle,
      coverImage,
      studentName,
      studentUsername,
      borrowDate: borrowDate || new Date().toISOString(),
      dueDate: dueDate || new Date(Date.now() + 7 * 86_400_000).toISOString(),
      returnDate: returnDate ?? null,
      status: status || 'borrowed',
      fine: fine ?? 0,
    };

    await upsertTransaction(newTx);
    return NextResponse.json({ success: true, transaction: newTx });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}
