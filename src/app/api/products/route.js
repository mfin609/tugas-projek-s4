import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        stocks: {
          include: {
            outlet: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    });

    // Serialize Decimal to number
    const serialized = products.map((p) => ({
      ...p,
      stocks: p.stocks.map((s) => ({
        ...s,
        price: parseFloat(s.price),
      })),
    }));

    return NextResponse.json({ products: serialized });
  } catch (error) {
    console.error('[PRODUCTS GET ERROR]', error);
    return NextResponse.json({ error: 'Gagal mengambil data produk' }, { status: 500 });
  }
}
