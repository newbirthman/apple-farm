import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";

export const metadata: Metadata = {
  title: "스마트 사과 영농일지 | 시기별 작업 관리",
  description: "사과 농장주를 위한 계절별 재배 워크플로우 관리 웹앱. 정지 전정, 적화, 방제, 수확까지 한눈에 관리하세요.",
  keywords: "사과 재배, 영농일지, 농업 관리, 과수원, 사과 농장",
  openGraph: {
    title: "스마트 사과 영농일지",
    description: "시기별 사과 재배 작업을 한눈에 관리하세요",
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
