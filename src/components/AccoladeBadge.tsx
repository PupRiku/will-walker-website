import type { Accolade } from '@/types/play';
import styles from './AccoladeBadge.module.css';

// Trophy overlay for a play cover. The parent must be `position: relative`.
export default function AccoladeBadge({ accolades }: { accolades?: Accolade[] }) {
  if (!accolades || accolades.length === 0) return null;
  const label = accolades.length === 1 ? 'Award-winning play' : 'Award-winning play (multiple awards)';
  return (
    <span className={styles.badge} role="img" aria-label={label} title={label}>
      🏆
    </span>
  );
}
