import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Little by Little — Habit Tracker",
  description: "Build small habits. Show up for yourself.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}