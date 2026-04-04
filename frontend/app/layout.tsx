import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gesture Calculator",
  description:
    "Math resolver berbasis gesture tangan dengan Next.js, MediaPipe, FastAPI, dan PostgreSQL/Supabase.",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
