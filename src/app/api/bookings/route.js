import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';
import { z } from 'zod';
import rateLimit from '@/lib/rate-limit';

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});

const bookingSchema = z.object({
  customerName: z.string().min(1, 'Nama wajib diisi'),
  customerPhone: z.string().min(5, 'Nomor telepon tidak valid'),
  outletId: z.number().int().positive(),
  items: z.array(
    z.object({
      productId: z.number().int().positive(),
      quantity: z.number().int().positive(),
    })
  ).min(1, 'Keranjang belanja kosong'),
});

// GET: Admin melihat booking di outletnya
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('admin_session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    const session = await verifyJWT(sessionCookie.value);
    if (!session) {
      return NextResponse.json({ error: 'Sesi tidak valid' }, { status: 401 });
    }

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
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    try {
      await limiter.check(20, ip);
    } catch {
      return NextResponse.json({ error: 'Terlalu banyak request, silakan coba lagi nanti' }, { status: 429 });
    }

    const body = await request.json();
    const validation = bookingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const { customerName, customerPhone, outletId, items } = validation.data;

    // Kurangi stok dan buat booking dalam satu transaksi
    const booking = await prisma.$transaction(async (tx) => {
      // Kurangi stok dengan atomic operation & check
      for (const item of items) {
        const updateResult = await tx.stock.updateMany({
          where: {
            productId: item.productId,
            outletId: outletId,
            stock: { gte: item.quantity },
          },
          data: { stock: { decrement: item.quantity } },
        });

        if (updateResult.count === 0) {
          throw new Error(`Stok tidak cukup untuk produk ID ${item.productId}`);
        }
      }

      // Buat booking
      return tx.booking.create({
        data: {
          customerName,
          customerPhone,
          outletId: outletId,
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
    return NextResponse.json({ error: error.message || 'Gagal membuat booking' }, { status: 500 });
  }
}
