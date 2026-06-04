import { NextResponse } from 'next/server';
import { getUserByUsername } from '@/lib/database';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password, role } = body;

    if (!username || !password || !role) {
      return NextResponse.json(
        { error: 'Username, password, dan role harus diisi' },
        { status: 400 }
      );
    }

    const usernameLower = username.toLowerCase().trim();

    // Special hardcoded admin check for fallback
    if (role === 'admin' && usernameLower === 'admin' && password === 'admin123') {
      return NextResponse.json({
        success: true,
        user: {
          username: 'admin',
          name: 'Administrator',
          role: 'admin'
        }
      });
    }

    // Cari user di database
    const dbUser = await getUserByUsername(usernameLower);
    if (!dbUser) {
      return NextResponse.json(
        { error: 'Akun tidak ditemukan' },
        { status: 401 }
      );
    }

    // Cocokkan password dan role
    if (dbUser.password === password && dbUser.role === role) {
      return NextResponse.json({
        success: true,
        user: {
          username: dbUser.username,
          name: dbUser.name,
          role: dbUser.role
        }
      });
    }

    return NextResponse.json(
      { error: 'Username atau kata sandi salah' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Error during login API:', error);
    return NextResponse.json(
      { error: 'Gagal melakukan verifikasi masuk' },
      { status: 500 }
    );
  }
}
