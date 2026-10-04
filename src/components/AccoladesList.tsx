import type { Accolade } from '@/types/play';
import { formatAccoladeDate, sortAccolades } from '@/utils/accolades';
import styles from './AccoladesList.module.css';

type Props = {
  accolades?: Accolade[];
  // Heading element differs by context (modal uses h3, play page uses h2).
  headingClassName?: string;
  as?: 'h2' | 'h3';
};

export default function AccoladesList({ accolades, headingClassName, as: Heading = 'h3' }: Props) {
  const sorted = sortAccolades(accolades);
  if (sorted.length === 0) return null;

  return (
    <section className={styles.accolades}>
      <Heading className={headingClassName}>Accolades</Heading>
      <ul className={styles.list}>
        {sorted.map((a, i) => (
          <li key={a.id ?? i} className={styles.item}>
            <span className={styles.name}>{a.name}</span>
            <span className={styles.meta}>
              {a.organization} · {formatAccoladeDate(a)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
