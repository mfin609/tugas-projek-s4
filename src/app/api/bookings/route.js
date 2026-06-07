import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

// GET: Admin melihat booking di outletnya
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('admin_session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);

    const bookings = await prisma.booking.findMany({
      where: { outletId: session.outletId },
      include: {
        outlet: true,
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('[BOOKINGS GET ERROR]', error);
    return NextResponse.json({ error: 'Gagal mengambil data booking' }, { status: 500 });
  }
}

// POST: Pelanggan membuat booking baru
export async function POST(request) {
  try {
    const { customerName, customerPhone, outletId, items } = await request.json();

    if (!customerName || !customerPhone || !outletId || !items || items.length === 0) {
      return NextResponse.json({ error: 'Data booking tidak lengkap' }, { status: 400 });
    }

    // Validasi stok cukup untuk setiap item
    for (const item of items) {
      const stock = await prisma.stock.findUnique({
        where: { productId_outletId: { productId: item.productId, outletId: parseInt(outletId) } },
      });

      if (!stock) {
        return NextResponse.json({ error: `Produk tidak tersedia di outlet ini` }, { status: 400 });
      }
      if (stock.stock < item.quantity) {
        return NextResponse.json({
          error: `Stok tidak cukup. Stok tersedia: ${stock.stock}`,
        }, { status: 400 });
      }
    }

    // Kurangi stok dan buat booking dalam satu transaksi
    const booking = await prisma.$transaction(async (tx) => {
      // Kurangi stok
      for (const item of items) {
        await tx.stock.update({
          where: { productId_outletId: { productId: item.productId, outletId: parseInt(outletId) } },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Buat booking
      return tx.booking.create({
        data: {
          customerName,
          customerPhone,
          outletId: parseInt(outletId),
          status: 'PENDING',
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
          },
        },
        include: {
          outlet: true,
          items: { include: { product: true } },
        },
      });
    });

    return NextResponse.json({ success: true, booking }, { status: 201 });
  } catch (error) {
    console.error('[BOOKINGS POST ERROR]', error);
    return NextResponse.json({ error: 'Gagal membuat booking' }, { status: 500 });
  }
}
