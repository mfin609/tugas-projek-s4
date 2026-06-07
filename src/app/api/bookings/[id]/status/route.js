import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function PATCH(request, context) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('admin_session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    const { status } = await request.json();

    // Next.js 16: params adalah Promise, harus di-await
    const params = await context.params;
    const bookingId = parseInt(params.id);

    if (!bookingId || isNaN(bookingId)) {
      return NextResponse.json({ error: 'ID booking tidak valid' }, { status: 400 });
    }

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 });
    }

    // Pastikan booking milik outlet admin ini
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { items: true },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking tidak ditemukan' }, { status: 404 });
    }

    if (booking.outletId !== session.outletId) {
      return NextResponse.json({ error: 'Akses ditolak - booking bukan milik outlet Anda' }, { status: 403 });
    }

    if (booking.status !== 'PENDING') {
      return NextResponse.json({ error: 'Booking sudah diproses sebelumnya' }, { status: 400 });
    }

    // Jika REJECTED, kembalikan stok
    if (status === 'REJECTED') {
      await prisma.$transaction(async (tx) => {
        for (const item of booking.items) {
          await tx.stock.update({
            where: {
              productId_outletId: { productId: item.productId, outletId: booking.outletId },
            },
            data: { stock: { increment: item.quantity } },
          });
        }
        await tx.booking.update({ where: { id: bookingId }, data: { status: 'REJECTED' } });
      });
    } else {
      await prisma.booking.update({ where: { id: bookingId }, data: { status: 'APPROVED' } });
    }

    const updated = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { outlet: true, items: { include: { product: true } } },
    });

    return NextResponse.json({ success: true, booking: updated });
  } catch (error) {
    console.error('[BOOKING STATUS ERROR]', error);
    return NextResponse.json({ error: 'Gagal memperbarui status booking' }, { status: 500 });
  }
}
