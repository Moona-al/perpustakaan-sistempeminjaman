import { NextResponse } from 'next/server';
import { getUserByUsername, updateUserProfile } from '@/lib/database';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json(
        { error: 'Username wajib disertakan' },
        { status: 400 }
      );
    }

    const user = await getUserByUsername(username);
    if (!user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Return profile details including class and current password
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        class: user.class,
        role: user.role,
        password: user.password,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Error in GET profile API:', error);
    return NextResponse.json(
      { error: 'Gagal memuat detail profil' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { oldUsername, name, username, password } = body;

    if (!oldUsername || !name || !username) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi' },
        { status: 400 }
      );
    }

    const usernameTrimmed = username.toLowerCase().trim();
    const oldUsernameTrimmed = oldUsername.toLowerCase().trim();

    if (usernameTrimmed.length < 3) {
      return NextResponse.json(
        { error: 'Username minimal 3 karakter' },
        { status: 400 }
      );
    }

    // 1. Get original user row
    const user = await getUserByUsername(oldUsernameTrimmed);
    if (!user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // 2. Check username availability if username has changed
    if (usernameTrimmed !== oldUsernameTrimmed) {
      const existing = await getUserByUsername(usernameTrimmed);
      if (existing && existing.id !== user.id) {
        return NextResponse.json(
          { error: 'Username sudah terdaftar oleh pengguna lain' },
          { status: 400 }
        );
      }
    }

    // 3. Update database
    await updateUserProfile(user.id, oldUsernameTrimmed, name, usernameTrimmed, password);

    // 4. Return new session data
    return NextResponse.json({
      success: true,
      message: 'Profil berhasil diperbarui',
      user: {
        username: usernameTrimmed,
        name: name.trim(),
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error in PUT profile API:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui profil' },
      { status: 500 }
    );
  }
}
