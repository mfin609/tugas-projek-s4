import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export async function PUT(request, context) {
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

    const params = await context.params;
    const productId = parseInt(params.id);

    if (!productId || isNaN(productId)) {
      return NextResponse.json({ error: 'ID produk tidak valid' }, { status: 400 });
    }

    const formData = await request.formData();
    const title = formData.get('title');
    const description = formData.get('description');
    const category = formData.get('category');
    const imageFile = formData.get('image');

    if (!title || !description || !category) {
      return NextResponse.json({ error: 'Data produk tidak lengkap' }, { status: 400 });
    }

    let updateData = {
      title,
      description,
      category,
    };

    if (imageFile && imageFile.name) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const ext = path.extname(imageFile.name) || '.jpg';
      const hash = crypto.randomBytes(16).toString('hex') + ext;
      const savePath = path.join(process.cwd(), 'storage', 'products', hash);
      fs.writeFileSync(savePath, buffer);
      updateData.image = hash;
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateData,
    });

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error('[ADMIN PRODUCTS PUT ERROR]', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Produk dengan nama tersebut sudah ada' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Gagal memperbarui produk' }, { status: 500 });
  }
}
