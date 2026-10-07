import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});
    
export const metadata: Metadata = {
  title: "Doaí - Conectando Pessoas e Doações",
  description: "Plataforma de doações locais",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // A variável da fonte fica no <html> porque o globals.css aplica font-sans no <html>
    <html lang="pt-br" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}