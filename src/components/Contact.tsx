'use client';

import styles from './Contact.module.css';

export default function Contact() {
  const recipientEmail = process.env.NEXT_PUBLIC_RECIPIENT_EMAIL;

  return (
    <section id="contact" className={styles.contactSection}>
      <div className={styles.contentWrapper}>
        <h2 className={styles.heading}>Contact Me</h2>
        <form
          action={`https://formsubmit.co/${recipientEmail}`}
          method="POST"
          className={styles.form}
        >
          <input
            type="hidden"
            name="_next"
            value="https://willwalkermontgomeriewrites.com/thank-you"
          />
          <input type="hidden" name="_captcha" value="false" />

          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              required
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              required
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="message" className={styles.label}>
              Message
            </label>
            <textarea
              id="message"
              name="message"
              required
              className={styles.textarea}
            ></textarea>
          </div>

          <button type="submit" className={styles.button}>
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
}
