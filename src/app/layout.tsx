import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";

export const metadata: Metadata = {
  title: "스마트 영농일지 | 효율적인 농장 관리",
  description: "농장주를 위한 스마트 영농일지. 시기별 재배 워크플로우부터 재고, 판매까지 한눈에 관리하세요.",
  keywords: "영농일지, 농업 관리, 과수원, 스마트 팜",
  openGraph: {
    title: "스마트 영농일지",
    description: "효율적인 농장 관리를 위한 스마트 영농일지",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#16a34a" />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
