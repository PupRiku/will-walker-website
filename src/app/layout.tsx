import type { Metadata } from 'next';
import { Lora, Lato, Special_Elite } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Configure the fonts
const lora = Lora({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lora',
});

const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-lato',
});

const specialElite = Special_Elite({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-special-elite',
});

export const metadata: Metadata = {
  title: 'Will Walker, Playwright',
  description: 'The official website for playwright Will Walker.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${lora.variable} ${lato.variable} ${specialElite.variable}`}
    >
      <body>
        <Header />
        <main className="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
