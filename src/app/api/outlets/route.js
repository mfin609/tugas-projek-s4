import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const outlets = await prisma.outlet.findMany({
      orderBy: { id: 'asc' },
    });
    return NextResponse.json({ outlets });
  } catch (error) {
    console.error('[OUTLETS GET ERROR]', error);
    return NextResponse.json({ error: 'Gagal mengambil data outlet' }, { status: 500 });
  }
}
