import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('admin_session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    const { title, description, image, category, price, stock } = await request.json();

    if (!title || !description || !category || !price || stock === undefined) {
      return NextResponse.json({ error: 'Data produk tidak lengkap' }, { status: 400 });
    }

    const session = JSON.parse(sessionCookie.value);

    // Buat produk baru secara global, lalu buat stok untuk outlet admin
    const product = await prisma.$transaction(async (tx) => {
      const newProduct = await tx.product.create({
        data: {
          title,
          description,
          image: image || '/images/default-bread.jpg',
          category,
        },
      });

      await tx.stock.create({
        data: {
          productId: newProduct.id,
          outletId: session.outletId,
          stock: parseInt(stock),
          price: parseFloat(price).toString(),
        },
      });

      return newProduct;
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    console.error('[ADMIN PRODUCTS POST ERROR]', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Produk dengan nama tersebut sudah ada' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Gagal menambahkan produk' }, { status: 500 });
  }
}
