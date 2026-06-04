import { NextResponse } from 'next/server';
import { getUserByUsername, createUser } from '@/lib/database';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, username, class: className, password } = body;

    if (!name || !username || !className || !password) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi' },
        { status: 400 }
      );
    }

    const usernameTrimmed = username.toLowerCase().trim();

    if (usernameTrimmed.length < 3) {
      return NextResponse.json(
        { error: 'Username minimal 3 karakter' },
        { status: 400 }
      );
    }

    // Periksa apakah username sudah terdaftar
    const existingUser = await getUserByUsername(usernameTrimmed);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username sudah terdaftar' },
        { status: 400 }
      );
    }

    // Buat user baru
    await createUser({
      name: name.trim(),
      username: usernameTrimmed,
      class: className,
      password: password,
      role: 'user'
    });

    return NextResponse.json({
      success: true,
      message: 'Registrasi berhasil'
    });
  } catch (error) {
    console.error('Error during signup API:', error);
    return NextResponse.json(
      { error: 'Gagal melakukan registrasi' },
      { status: 500 }
    );
  }
}
