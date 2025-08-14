import Image from 'next/image';
import Link from 'next/link';
import { worksData } from '@/data/works';
import styles from './page.module.css';

export default function WorksPage() {
  return (
    <div className={styles.pageWrapper}>
      <h1 className={styles.heading}>All Works</h1>

      <Link
        href="https://forms.gle/NJfNUHBLG73Wbjdz7"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.globalApplyButton}
      >
        Apply for Performance Rights
      </Link>

      <div className={styles.grid}>
        {worksData.map((work, index) => (
          <div className={styles.card} key={index}>
            {work.published && <div className={styles.ribbon}>Published</div>}
            <Image
              src={work.imageSrc}
              alt={`Cover for ${work.title}`}
              width={500}
              height={250}
              className={styles.cardImage}
            />
            <div className={styles.cardContent}>
              <div className={styles.metaInfo}>
                <p className={styles.category}>{work.category}</p>
                {work.runtime && (
                  <p className={styles.runtime}>{work.runtime}</p>
                )}
              </div>
              <h2 className={styles.title}>{work.title}</h2>
              <p className={styles.synopsis}>{work.synopsis}</p>
              {work.cast && (
                <p className={styles.cast}>
                  <b>Cast:</b> {work.cast}
                </p>
              )}
              <p className={styles.cast}>
                <b>Cast:</b> {work.cast}
              </p>

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
                {work.published && work.purchase && (
                  <a
                    href={work.purchase}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${styles.button} ${styles.purchaseButton}`}
                  >
                    Purchase Rights
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
