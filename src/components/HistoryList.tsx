import type { HistoryEntry } from '@/types/play';
import { formatHistoryEntry, sortHistory } from '@/utils/history';
import styles from './HistoryList.module.css';

type Props = {
  history?: HistoryEntry[];
  // Heading element differs by context (modal uses h3, play page uses h2).
  headingClassName?: string;
  as?: 'h2' | 'h3';
};

export default function HistoryList({ history, headingClassName, as: Heading = 'h3' }: Props) {
  const sorted = sortHistory(history);
  if (sorted.length === 0) return null;

  return (
    <section className={styles.history}>
      <Heading className={headingClassName}>History</Heading>
      <ul className={styles.list}>
        {sorted.map((h, i) => (
          <li key={h.id ?? i} className={styles.item}>
            {formatHistoryEntry(h)}
          </li>
        ))}
      </ul>
    </section>
  );
}
