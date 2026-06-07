import { Outfit } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./globals.css";
import BootstrapClient from "@/components/BootstrapClient";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "Toko Roti Yuki - Roti Fresh Setiap Hari",
  description: "Pesan roti artisan premium dari Toko Roti Yuki. Tersedia di berbagai outlet Jakarta dan Depok. Croissant, Sourdough, Donat, Pastry, dan lainnya.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={outfit.variable}>
      <body>
        <BootstrapClient />
        {children}
      </body>
    </html>
  );
}
