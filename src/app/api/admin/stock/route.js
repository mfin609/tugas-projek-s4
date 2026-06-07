import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

// GET: Ambil semua stok untuk outlet admin yang login
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('admin_session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);

    const stocks = await prisma.stock.findMany({
      where: { outletId: session.outletId },
      include: { product: true, outlet: true },
      orderBy: { id: 'asc' },
    });

    const serialized = stocks.map((s) => ({
      ...s,
      price: parseFloat(s.price),
    }));

    return NextResponse.json({ stocks: serialized });
  } catch (error) {
    console.error('[ADMIN STOCK GET ERROR]', error);
    return NextResponse.json({ error: 'Gagal mengambil data stok' }, { status: 500 });
  }
}

// PATCH: Update stok, harga, atau promo untuk produk tertentu di outlet admin
export async function PATCH(request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('admin_session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    const { productId, stock, price, promoText } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'productId wajib diisi' }, { status: 400 });
    }

    const updateData = {};
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (price !== undefined) updateData.price = parseFloat(price).toString();
    if (promoText !== undefined) updateData.promoText = promoText || null;

    const updated = await prisma.stock.update({
      where: {
        productId_outletId: { productId: parseInt(productId), outletId: session.outletId },
      },
      data: updateData,
      include: { product: true },
    });

    return NextResponse.json({
      success: true,
      stock: { ...updated, price: parseFloat(updated.price) },
    });
  } catch (error) {
    console.error('[ADMIN STOCK PATCH ERROR]', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Produk tidak tersedia di outlet Anda' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Gagal memperbarui stok' }, { status: 500 });
  }
}
