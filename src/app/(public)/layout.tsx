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
      <Header />
      <main className="main-content">{children}</main>
      <Footer />
      <KoFiWidget />
    </>
  );
}
