import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { fetchPlay, fetchPlays } from '@/lib/api';
import styles from './page.module.css';
import { BsDownload } from 'react-icons/bs';

export const revalidate = 60;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const plays = await fetchPlays();
  return plays.map((play) => ({ slug: play.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const work = await fetchPlay(slug);
  if (!work) return {};

  const firstSentence = work.synopsis.split(/(?<=\.)\s/)[0];

  return {
    title: `${work.title} | William L. Walker Montgomerie`,
    description: firstSentence,
  };
}

export default async function PlayPage({ params }: Props) {
  const { slug } = await params;
  const work = await fetchPlay(slug);

  if (!work) {
    notFound();
  }

  return (
    <main className={styles.pageWrapper}>
      <div className={styles.layout}>
        {/* Left column — cover image */}
        <div className={styles.imageColumn}>
          {work.published && <div className={styles.ribbon}>Published</div>}
          <Image
            src={work.imageSrc}
            alt={`Cover for ${work.title}`}
            width={600}
            height={900}
            className={styles.coverImage}
            priority
          />
        </div>

        {/* Right column — details */}
        <div className={styles.detailsColumn}>
          <div className={styles.meta}>
            <p className={styles.genre}>{work.category}</p>
            {work.runtime && work.runtime !== 'TBD' && (
              <p className={styles.runtime}>{work.runtime}</p>
            )}
          </div>

          <h1 className={styles.title}>{work.title}</h1>

          <p className={styles.synopsis}>{work.synopsis}</p>

          {work.cast && work.cast !== 'TBD' && (
            <p className={styles.cast}>
              <strong>Cast:</strong> {work.cast}
            </p>
          )}

          <div className={styles.buttonGroup}>
            {work.pdfSrc && (
              <a
                href={work.pdfSrc}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.button}
              >
                Read Sample
              </a>
            )}
            {work.published && work.purchase ? (
              <a
                href={work.purchase}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.button}
              >
                Purchase Rights
              </a>
            ) : (
              <a
                href="https://forms.gle/NJfNUHBLG73Wbjdz7"
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.button} ${styles.applyButton}`}
              >
                Apply for Performance Rights
              </a>
            )}
            <a
              href="/pdfs/royalties_scale.pdf"
              className={`${styles.button} ${styles.downloadButton}`}
              download
            >
              <BsDownload aria-hidden="true" />
              Download Royalties Scale
            </a>
          </div>

          <Link href="/works" className={styles.backLink}>
            ← Back to All Works
          </Link>
        </div>
      </div>
    </main>
  );
}
