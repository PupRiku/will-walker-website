import Script from 'next/script';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import KoFiWidget from '@/components/KoFiWidget';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className="main-content" tabIndex={-1}>
        {children}
      </main>
      <Footer />
      <KoFiWidget />
      {/* Umami lives here, not in the root layout, so admin dashboard
          sessions aren't counted as site traffic. */}
      <Script
        async
        src={`${process.env.NEXT_PUBLIC_UMAMI_URL}/script.js`}
        data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
        strategy="afterInteractive"
      />
    </>
  );
}
