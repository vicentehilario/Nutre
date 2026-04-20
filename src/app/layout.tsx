import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/AuthContext";

const geist = Geist({ subsets: ["latin"] });

const BASE_URL = "https://nutre.app.br";

export const metadata: Metadata = {
  title: "Nutre — seu nutri pessoal",
  description: "Tire uma foto da sua refeição e descubra calorias e macros na hora — com a orientação do nutricionista Vicente Hilário por trás de cada resposta.",
  manifest: "/manifest.json",
  themeColor: "#16a34a",
  metadataBase: new URL(BASE_URL),
  openGraph: {
    title: "Nutre — seu nutri pessoal",
    description: "Tire uma foto da sua refeição e descubra calorias e macros na hora — com a orientação do nutricionista Vicente Hilário por trás de cada resposta.",
    url: BASE_URL,
    siteName: "Nutre",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Nutre — Acompanhamento nutricional com IA",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nutre — seu nutri pessoal",
    description: "Tire uma foto da sua refeição e descubra calorias e macros na hora.",
    images: ["/og-image.jpg"],
  },
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
        <link rel="apple-touch-icon" href="/api/icons/180" />
      </head>
      <body className={`${geist.className} h-full bg-gray-50 text-gray-900`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
