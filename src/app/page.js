import prisma from "@/lib/prisma";
import StoreClient from "@/components/StoreClient";

export const revalidate = 60; // ISR revalidate every 60 seconds

export default async function Home() {
  const products = await prisma.product.findMany({
    include: {
      stocks: {
        include: {
          outlet: true,
        },
      },
    },
    orderBy: { id: "asc" },
  });

  const outlets = await prisma.outlet.findMany({
    orderBy: { name: "asc" },
  });

  // Serialize Decimal
  const serializedProducts = products.map((p) => ({
    ...p,
    stocks: p.stocks.map((s) => ({
      ...s,
      price: parseFloat(s.price),
    })),
  }));

  return (
    <StoreClient
      initialProducts={serializedProducts}
      initialOutlets={outlets}
    />
  );
}
