const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany();
  let updatedCount = 0;

  for (const product of products) {
    if (product.image && product.image.startsWith('/images/')) {
      let defaultImage = '';
      if (product.category === 'Croissant') defaultImage = 'default_croissant.png';
      else if (product.category === 'Roti Tawar') defaultImage = 'default_roti_tawar.png';
      else if (product.category === 'Donat') defaultImage = 'default_donat.png';
      else if (product.category === 'Pastry') defaultImage = 'default_pastry.png';
      else defaultImage = 'default_roti_tawar.png'; // Fallback

      await prisma.product.update({
        where: { id: product.id },
        data: { image: defaultImage },
      });
      updatedCount++;
      console.log(`Updated product ${product.id} image to ${defaultImage}`);
    }
  }

  console.log(`Finished updating ${updatedCount} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
