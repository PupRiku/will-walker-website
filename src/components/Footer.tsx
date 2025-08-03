import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <p className={styles.text}>
        &copy; {currentYear} Will Walker. All Rights Reserved.
      </p>
      <Link href="/cv" className={styles.footerLink}>
        CV
      </Link>
    </footer>
  );
}
