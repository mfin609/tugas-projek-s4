import { Geist, Geist_Mono } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./globals.css";
import BootstrapClient from "./BootstrapClient";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Yuki TaskFlow - Pengelola Tugas Projek S4",
  description: "Aplikasi dasbor premium untuk mengelola tugas dan kemajuan proyek semester 4 dengan Bootstrap",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-100`}
    >
      <body className="min-vh-100 d-flex flex-column bg-light">
        <BootstrapClient />
        {children}
      </body>
    </html>
  );
}
