import type { Metadata } from "next";
import { Nunito, Noto_Sans } from "next/font/google";
import "./globals.css";
import AuthSessionProvider from "@/components/providers/session-provider";
import { SidebarProvider } from "@/components/providers/sidebar-provider";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

// Noto Sans Myanmar for Burmese text support
const notoSansMyanmar = Noto_Sans({
  variable: "--font-noto-myanmar",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LarLar Books - Myanmar eBooks Platform",
  description: "Discover and read Myanmar eBooks online. Browse our collection of Burmese literature, novels, and educational content.",
  keywords: "Myanmar eBooks, Burmese books, Myanmar literature, online reading",
  authors: [{ name: "LarLar Books Team" }],
  openGraph: {
    title: "LarLar Books - Myanmar eBooks Platform",
    description: "Discover and read Myanmar eBooks online",
    type: "website",
    locale: "my_MM",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="my" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${nunito.variable} ${notoSansMyanmar.variable} antialiased font-sans`}
      >
        <SidebarProvider>
          <AuthSessionProvider>
            {children}
          </AuthSessionProvider>
        </SidebarProvider>
      </body>
    </html>
  );
}
