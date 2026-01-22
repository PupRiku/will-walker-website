'use client';

import { useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import styles from './Contact.module.css';

export default function Contact() {
  const recipientEmail = process.env.NEXT_PUBLIC_RECIPIENT_EMAIL;

  const [captchaVerified, setCaptchaVerified] = useState(false);

  const onCaptchaChange = (token: string | null) => {
    if (token) {
      setCaptchaVerified(true);
    } else {
      setCaptchaVerified(false);
    }
  };

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

          <div className={styles.formGroup} style={{ marginBottom: '1.5rem' }}>
            <ReCAPTCHA
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
              onChange={onCaptchaChange}
            />
          </div>

          <button
            type="submit"
            className={styles.button}
            disabled={!captchaVerified}
            style={{
              opacity: captchaVerified ? 1 : 0.5,
              cursor: captchaVerified ? 'pointer' : 'not-allowed',
            }}
          >
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
}
