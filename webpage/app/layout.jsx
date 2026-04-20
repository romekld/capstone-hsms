import "../src/index.css";

export const metadata = {
  title: "CHO 2 Admin Webpage",
  description: "Next.js App Router entry for the CHO 2 admin webpage.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
