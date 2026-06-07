import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('admin_session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    const formData = await request.formData();
    const title = formData.get('title');
    const description = formData.get('description');
    const category = formData.get('category');
    const price = formData.get('price');
    const stock = formData.get('stock');
    const imageFile = formData.get('image');

    if (!title || !description || !category || !price || stock === null) {
      return NextResponse.json({ error: 'Data produk tidak lengkap' }, { status: 400 });
    }

    const session = await verifyJWT(sessionCookie.value);
    if (!session) {
      return NextResponse.json({ error: 'Sesi tidak valid' }, { status: 401 });
    }

    let imageHash = null;
    if (imageFile && imageFile.name) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const ext = path.extname(imageFile.name) || '.jpg';
      const hash = crypto.randomBytes(16).toString('hex') + ext;
      const savePath = path.join(process.cwd(), 'storage', 'products', hash);
      fs.writeFileSync(savePath, buffer);
      imageHash = hash;
    }

    let defaultImage = '';
    if (!imageHash) {
      if (category === 'Croissant') defaultImage = 'default_croissant.png';
      else if (category === 'Roti Tawar') defaultImage = 'default_roti_tawar.png';
      else if (category === 'Donat') defaultImage = 'default_donat.png';
      else if (category === 'Pastry') defaultImage = 'default_pastry.png';
    }

    // Buat produk baru secara global, lalu buat stok untuk outlet admin
    const product = await prisma.$transaction(async (tx) => {
      const newProduct = await tx.product.create({
        data: {
          title,
          description,
          image: imageHash || defaultImage,
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
