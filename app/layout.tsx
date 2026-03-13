import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart-context";
import { UIProvider } from "@/contexts/ui-context";
import { AuthProvider } from "@/contexts/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HairSaaS - Premium Wigs and Hair Accessories",
  description: "Discover high-quality wigs, hair extensions, and accessories at HairSaaS. Shop our collection of beautiful hair products for all styles and occasions.",
  keywords: ["wigs", "hair extensions", "hair accessories", "premium hair products", "hair care"],
  icons: {
    icon: "/wig.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <UIProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </UIProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
