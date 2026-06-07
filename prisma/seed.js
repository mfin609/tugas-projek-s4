const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Mulai seeding database tokorotiku...\n');

  // ── 1. OUTLETS ──────────────────────────────────────────────────────────────
  const outlet1 = await prisma.outlet.upsert({
    where: { id: 1 },
    update: {},
    create: { name: 'Toko Roti Yuki - Sudirman', location: 'Jl. Jend. Sudirman No. 45, Jakarta Pusat' },
  });
  const outlet2 = await prisma.outlet.upsert({
    where: { id: 2 },
    update: {},
    create: { name: 'Toko Roti Yuki - Kemang', location: 'Jl. Kemang Raya No. 18, Jakarta Selatan' },
  });
  const outlet3 = await prisma.outlet.upsert({
    where: { id: 3 },
    update: {},
    create: { name: 'Toko Roti Yuki - Depok', location: 'Jl. Margonda Raya No. 123, Depok' },
  });
  console.log('✅ 3 outlet berhasil dibuat');

  // ── 2. ADMIN ACCOUNTS ───────────────────────────────────────────────────────
  const hashed = async (pw) => bcrypt.hash(pw, 10);

  await prisma.admin.upsert({
    where: { username: 'admin_sudirman1' },
    update: {},
    create: { username: 'admin_sudirman1', password: await hashed('sudirman123'), name: 'Budi Santoso', outletId: outlet1.id },
  });
  await prisma.admin.upsert({
    where: { username: 'admin_sudirman2' },
    update: {},
    create: { username: 'admin_sudirman2', password: await hashed('sudirman123'), name: 'Dewi Rahayu', outletId: outlet1.id },
  });
  await prisma.admin.upsert({
    where: { username: 'admin_kemang1' },
    update: {},
    create: { username: 'admin_kemang1', password: await hashed('kemang123'), name: 'Rina Kusuma', outletId: outlet2.id },
  });
  await prisma.admin.upsert({
    where: { username: 'admin_kemang2' },
    update: {},
    create: { username: 'admin_kemang2', password: await hashed('kemang123'), name: 'Hendra Wijaya', outletId: outlet2.id },
  });
  await prisma.admin.upsert({
    where: { username: 'admin_depok1' },
    update: {},
    create: { username: 'admin_depok1', password: await hashed('depok123'), name: 'Sari Indah', outletId: outlet3.id },
  });
  console.log('✅ 5 admin berhasil dibuat');

  // ── 3. PRODUCTS ─────────────────────────────────────────────────────────────
  const products = [
    {
      title: 'Croissant Butter Classic',
      description: 'Croissant berlapis-lapis dengan mentega Prancis premium. Renyah di luar, lembut dan gurih di dalam. Cocok untuk sarapan mewah.',
      image: '/images/croissant.jpg',
      category: 'Croissant',
    },
    {
      title: 'Roti Sourdough Artisan',
      description: 'Roti sourdough tradisional dengan fermentasi alami 24 jam. Kulit tebal renyah, bagian dalam berlubang-lubang sempurna dengan rasa asam khas.',
      image: '/images/sourdough.jpg',
      category: 'Roti Tawar',
    },
    {
      title: 'Donat Glazed Rainbow',
      description: 'Donat fluffy dengan glaze warna-warni yang menggoda. Dibuat fresh setiap hari dengan bahan-bahan berkualitas tinggi tanpa pengawet.',
      image: '/images/donat.jpg',
      category: 'Donat',
    },
    {
      title: 'Cinnamon Roll Premium',
      description: 'Gulungan kayu manis lembut dengan krim keju di atasnya. Aroma kayu manis yang harum membuatnya tidak bisa ditolak.',
      image: '/images/cinnamon.jpg',
      category: 'Pastry',
    },
    {
      title: 'Baguette Parisienne',
      description: 'Roti panjang khas Prancis dengan tekstur krispi sempurna. Cocok untuk dimakan bersama keju, selai, atau sup krim.',
      image: '/images/baguette.jpg',
      category: 'Roti Tawar',
    },
    {
      title: 'Pain au Chocolat',
      description: 'Pastry berlapis dengan isian coklat dark premium Belgia. Dibuat dengan teknik laminating tradisional untuk lapisan yang sempurna.',
      image: '/images/painauchocolat.jpg',
      category: 'Croissant',
    },
  ];

  const createdProducts = [];
  for (const p of products) {
    const prod = await prisma.product.upsert({
      where: { title: p.title },
      update: {},
      create: p,
    });
    createdProducts.push(prod);
  }
  console.log('✅ 6 produk berhasil dibuat');

  // ── 4. STOCKS (per outlet) ───────────────────────────────────────────────────
  const stockData = [
    // Outlet 1 - Sudirman (semua produk)
    { productId: createdProducts[0].id, outletId: outlet1.id, stock: 30, price: 32000, promoText: 'PROMO! Beli 3 gratis 1 setiap hari Senin' },
    { productId: createdProducts[1].id, outletId: outlet1.id, stock: 15, price: 55000, promoText: null },
    { productId: createdProducts[2].id, outletId: outlet1.id, stock: 50, price: 18000, promoText: 'Diskon 10% untuk pembelian di atas 5 pcs' },
    { productId: createdProducts[3].id, outletId: outlet1.id, stock: 20, price: 28000, promoText: null },
    { productId: createdProducts[4].id, outletId: outlet1.id, stock: 25, price: 42000, promoText: null },
    { productId: createdProducts[5].id, outletId: outlet1.id, stock: 18, price: 35000, promoText: 'Paket 2 pcs hemat 15%' },

    // Outlet 2 - Kemang (sebagian produk)
    { productId: createdProducts[0].id, outletId: outlet2.id, stock: 20, price: 33000, promoText: null },
    { productId: createdProducts[2].id, outletId: outlet2.id, stock: 40, price: 17000, promoText: 'Happy Hour 14:00-16:00 diskon 20%' },
    { productId: createdProducts[3].id, outletId: outlet2.id, stock: 15, price: 29000, promoText: null },
    { productId: createdProducts[5].id, outletId: outlet2.id, stock: 12, price: 36000, promoText: null },

    // Outlet 3 - Depok (sebagian produk)
    { productId: createdProducts[1].id, outletId: outlet3.id, stock: 10, price: 52000, promoText: 'Spesial Weekend! Gratis kopi untuk pembelian roti' },
    { productId: createdProducts[2].id, outletId: outlet3.id, stock: 60, price: 16000, promoText: null },
    { productId: createdProducts[3].id, outletId: outlet3.id, stock: 25, price: 27000, promoText: 'Diskon 5% member' },
    { productId: createdProducts[4].id, outletId: outlet3.id, stock: 20, price: 40000, promoText: null },
  ];

  for (const s of stockData) {
    await prisma.stock.upsert({
      where: { productId_outletId: { productId: s.productId, outletId: s.outletId } },
      update: {},
      create: { ...s, price: s.price.toString() },
    });
  }
  console.log('✅ Data stok per outlet berhasil dibuat');

  // ── 5. SAMPLE BOOKINGS ──────────────────────────────────────────────────────
  await prisma.booking.create({
    data: {
      customerName: 'Ahmad Fauzi',
      customerPhone: '081234567890',
      outletId: outlet1.id,
      status: 'PENDING',
      items: {
        create: [
          { productId: createdProducts[0].id, quantity: 3 },
          { productId: createdProducts[2].id, quantity: 5 },
        ],
      },
    },
  });

  await prisma.booking.create({
    data: {
      customerName: 'Siti Nurhaliza',
      customerPhone: '089876543210',
      outletId: outlet2.id,
      status: 'APPROVED',
      items: {
        create: [
          { productId: createdProducts[0].id, quantity: 2 },
          { productId: createdProducts[5].id, quantity: 4 },
        ],
      },
    },
  });

  await prisma.booking.create({
    data: {
      customerName: 'Rizky Pratama',
      customerPhone: '082345678901',
      outletId: outlet3.id,
      status: 'PENDING',
      items: {
        create: [
          { productId: createdProducts[2].id, quantity: 10 },
        ],
      },
    },
  });
  console.log('✅ 3 contoh booking berhasil dibuat');

  console.log('\n🎉 Seeding selesai! Database tokorotiku siap digunakan.');
  console.log('\n📋 Akun Admin:');
  console.log('   Outlet Sudirman : admin_sudirman1 / sudirman123');
  console.log('   Outlet Sudirman : admin_sudirman2 / sudirman123');
  console.log('   Outlet Kemang   : admin_kemang1   / kemang123');
  console.log('   Outlet Kemang   : admin_kemang2   / kemang123');
  console.log('   Outlet Depok    : admin_depok1    / depok123');
}

main()
  .catch((e) => {
    console.error('❌ Error saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
