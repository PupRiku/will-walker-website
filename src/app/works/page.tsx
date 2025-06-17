import Image from 'next/image';
import { worksData } from '@/data/works';
import styles from './page.module.css';

export default function WorksPage() {
  return (
    <div className={styles.pageWrapper}>
      <h1 className={styles.heading}>All Works</h1>

      <div className={styles.grid}>
        {worksData.map((work, index) => (
          <div className={styles.card} key={index}>
            <Image
              src={work.imageSrc}
              alt={`Cover for ${work.title}`}
              width={500}
              height={250}
              className={styles.cardImage}
            />
            <div className={styles.cardContent}>
              <p className={styles.category}>{work.category}</p>
              <h2 className={styles.title}>{work.title}</h2>
              <p className={styles.synopsis}>{work.synopsis}</p>
              <p className={styles.cast}>
                <b>Cast:</b> {work.cast}
              </p>

              <a
                href={work.pdfSrc}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.button}
              >
                Read Sample
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
