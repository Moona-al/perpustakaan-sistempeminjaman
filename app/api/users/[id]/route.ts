import { NextResponse } from 'next/server';
import { deleteUserById } from '@/lib/database';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const success = await deleteUserById(id);
    if (success) {
      return NextResponse.json({ success: true, message: 'User berhasil dihapus' });
    }
    return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
  } catch (error) {
    console.error('Error deleting user API:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus user' },
      { status: 500 }
    );
  }
}
