import Link from 'next/link';
import styles from './page.module.css';

export default function ThankYouPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Thank You!</h1>
      <p className={styles.message}>
        Your message has been sent successfully. Will will get back to you as
        soon as possible.
      </p>
      <Link href="/" className={styles.button}>
        ← Back to Homepage
      </Link>
    </div>
  );
}
