import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sprite Generator API",
  description: "Generate game sprites via API",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
