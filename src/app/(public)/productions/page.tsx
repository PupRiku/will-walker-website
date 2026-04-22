import type { Metadata } from 'next';
import Image from 'next/image';
import { fetchProductions } from '@/lib/api';
import styles from './page.module.css';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Productions | William L. Walker Montgomerie',
  description:
    'Production photos from past performances of plays by William L. Walker Montgomerie.',
};

export default async function ProductionsPage() {
  const productions = await fetchProductions();

  return (
    <main className={styles.pageWrapper}>
      <div className={styles.inner}>
        <h1 className={styles.heading}>Productions</h1>

        {productions.length === 0 ? (
          <p className={styles.emptyState}>Production photos coming soon.</p>
        ) : (
          productions.map((production) => (
            <section
              key={`${production.playTitle}-${production.productionYear}`}
              className={styles.production}
            >
              <h2 className={styles.productionHeading}>
                {production.playTitle}
                <span className={styles.productionMeta}>
                  {' '}— {production.venue}, {production.productionYear}
                </span>
              </h2>

              <div className={styles.photoGrid}>
                {production.photos.map((photo) => (
                  <figure key={photo.id} className={styles.photoFigure}>
                    <div className={styles.imageWrapper}>
                      <Image
                        src={photo.src}
                        alt={photo.alt}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className={styles.photo}
                      />
                    </div>
                    {photo.caption && (
                      <figcaption className={styles.caption}>{photo.caption}</figcaption>
                    )}
                  </figure>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </main>
  );
}
