import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { signJWT } from '@/lib/auth';
import rateLimit from '@/lib/rate-limit';

const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500, // Max 500 users per second
});

export async function POST(request) {
  try {
    // Apply rate limiting (max 30 requests per minute per IP)
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    try {
      await limiter.check(30, ip);
    } catch {
      return NextResponse.json({ error: 'Terlalu banyak percobaan login, silakan coba lagi nanti' }, { status: 429 });
    }

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

    // Sign JWT Token
    const payload = {
      adminId: admin.id,
      adminName: admin.name,
      outletId: admin.outletId,
      outletName: admin.outlet.name,
    };
    const token = await signJWT(payload);

    const cookieStore = await cookies();
    cookieStore.set('admin_session', token, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 8, // 8 jam
      sameSite: 'lax',
    });

    return NextResponse.json({
      success: true,
      admin: payload,
    });
  } catch (error) {
    console.error('[AUTH LOGIN ERROR]', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
