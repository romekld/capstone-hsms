import './globals.css';

export const metadata = {
  title: 'webpage',
  description: 'Health CHO 2 dashboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
