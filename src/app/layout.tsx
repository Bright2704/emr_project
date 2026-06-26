import type { Metadata } from "next";
import { Anuphan } from "next/font/google";
import "./globals.css";

const anuphan = Anuphan({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ["thai", "latin"],
  variable: "--font-anuphan",
});

export const metadata: Metadata = {
  title: "EMR Scan Viewer | ระบบจัดเก็บและเรียกดูเอกสารสแกนผู้ป่วย",
  description: "ระบบจัดเก็บและเรียกดูเอกสารสแกนผู้ป่วย สำหรับโรงพยาบาล",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${anuphan.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
