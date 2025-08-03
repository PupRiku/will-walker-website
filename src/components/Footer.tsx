import Link from 'next/link';
import SocialLinks from './SocialLinks';
import styles from './Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerLinks}>
          <p className={styles.text}>
            &copy; {currentYear} William L. Walker. All Rights Reserved.
          </p>
          <Link href="/cv" className={styles.footerLink}>
            CV
          </Link>
        </div>
        <SocialLinks />
      </div>
    </footer>
  );
}
