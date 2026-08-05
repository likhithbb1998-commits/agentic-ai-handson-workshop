import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LiuantX Live Workshop",
  description: "A live, interactive classroom for learning multi-agent AI systems.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
