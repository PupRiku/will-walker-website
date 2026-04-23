import { FiSettings } from 'react-icons/fi';
import styles from './page.module.css';

export default function SettingsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <p className={styles.breadcrumb}>/ADMIN</p>
        <h1 className={styles.pageTitle}>Settings</h1>
      </div>

      <div className={styles.card}>
        <FiSettings className={styles.cardIcon} aria-hidden="true" />
        <h2 className={styles.cardHeading}>Settings coming soon.</h2>
        <p className={styles.cardBody}>
          Configuration options for the site will appear here in a future update.
        </p>
      </div>
    </div>
  );
}
