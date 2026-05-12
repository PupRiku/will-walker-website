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
    </>
  );
}
