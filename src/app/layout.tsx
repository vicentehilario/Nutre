import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nutre — seu nutri pessoal",
  description: "Seu acompanhamento nutricional com IA no bolso",
  manifest: "/manifest.json",
  themeColor: "#16a34a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="h-full">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Nutre" />
      </head>
      <body className={`${geist.className} h-full bg-gray-50 text-gray-900`}>
        {children}
      </body>
    </html>
  );
}
