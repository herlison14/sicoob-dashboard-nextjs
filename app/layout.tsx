import type { Metadata } from "next";
import { DataProvider } from "./context/DataContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sicoob — Integralização de Capital",
  description: "Dashboard de análise de integralização de capital",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="h-full bg-gray-50 text-gray-900">
        <DataProvider>
          {children}
        </DataProvider>
      </body>
    </html>
  );
}
