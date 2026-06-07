import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request, context) {
  try {
    const params = await context.params;
    const hash = params.hash;

    if (!hash || typeof hash !== 'string' || hash.includes('..') || hash.includes('/')) {
      return new NextResponse('Invalid image hash', { status: 400 });
    }

    // Path absolut ke folder storage/products
    const filePath = path.join(process.cwd(), 'storage', 'products', hash);

    if (!fs.existsSync(filePath)) {
      return new NextResponse('Image not found', { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    
    // Deteksi tipe konten sederhana berdasarkan ekstensi yang di-*hash* (karena file disimpan dengan ekstensi, misal .jpg)
    const ext = path.extname(filePath).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.svg') contentType = 'image/svg+xml';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('[IMAGE ROUTE ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
