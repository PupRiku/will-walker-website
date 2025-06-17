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
  title: 'William L. Walker Montgomerie | Playwright, Director, Educator',
  description:
    'Explore the selected works and portfolio of William L. Walker Montgomerie, a playwright and director based in Paris, Texas. Read samples and get in contact.',
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: 'William L. Walker Montgomerie',
              jobTitle: 'Playwright, Director, Educator',
              url: 'https://will-walker-website.vercel.app/',
              sameAs: [
                // Add links to his social media or professional profiles here
                // "https://www.linkedin.com/in/williamwalker",
                // "https://twitter.com/williamwalker"
              ],
            }),
          }}
        />
      </head>
      <body>
        <Header />
        <main className="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
