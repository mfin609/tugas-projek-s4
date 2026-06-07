import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username dan password wajib diisi' }, { status: 400 });
    }

    const admin = await prisma.admin.findUnique({
      where: { username },
      include: { outlet: true },
    });

    if (!admin) {
      return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 });
    }

    // Simpan sesi sebagai cookie sederhana (JSON encoded)
    const sessionData = JSON.stringify({
      adminId: admin.id,
      adminName: admin.name,
      outletId: admin.outletId,
      outletName: admin.outlet.name,
    });

    const cookieStore = await cookies();
    cookieStore.set('admin_session', sessionData, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 8, // 8 jam
      sameSite: 'lax',
    });

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        name: admin.name,
        outletId: admin.outletId,
        outletName: admin.outlet.name,
      },
    });
  } catch (error) {
    console.error('[AUTH LOGIN ERROR]', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
