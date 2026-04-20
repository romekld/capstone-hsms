import type { ReactNode } from "react";

import "../src/index.css";

import { Navbar } from "../components/Navbar";
import { ScrollToTop } from "../components/ScrollToTop";

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <ScrollToTop />
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
