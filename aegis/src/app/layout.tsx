import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AEGIS — Algorithmic Evaluation & Governance Intelligence System",
  description:
    "Level 3 analyst workstation. Algorithmic case evaluation and adjudication. Classification: Restricted.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
