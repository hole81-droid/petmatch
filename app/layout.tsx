import type { Metadata } from "next";
import "./globals.css";
import { Geist, Fraunces } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "600", "700", "900"],
});

export const metadata: Metadata = {
  title: "PetMatch — 반려동물 인연 연결",
  description: "산책 라이프스타일로 잘 맞는 이웃 보호자를 찾아요",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={cn("font-sans", geist.variable, fraunces.variable)}>
      <body>{children}</body>
    </html>
  );
}
