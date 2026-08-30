'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import styles from './Contact.module.css';

const ReCAPTCHA = dynamic(() => import('react-google-recaptcha'), {
  ssr: false,
  loading: () => (
    <div className={styles.captchaPlaceholder} aria-hidden="true">
      Loading verification…
    </div>
  ),
});

export default function Contact() {
  const recipientEmail = process.env.NEXT_PUBLIC_RECIPIENT_EMAIL;

  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [formTouched, setFormTouched] = useState(false);

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
        {/* onFocus lives on the wrapper rather than the form because the
            captcha and submit button now sit outside the form element. */}
        <div className={styles.formLayout} onFocus={() => setFormTouched(true)}>
          <form
            id="contact-form"
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

            <div className={styles.formGroup} suppressHydrationWarning>
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

            <div className={styles.formGroup} suppressHydrationWarning>
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

            <div className={styles.formGroup} suppressHydrationWarning>
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
          </form>

          {/* Deliberately outside <form>. The widget renders a hidden
              g-recaptcha-response textarea, and any named field inside the
              form gets serialized by FormSubmit and pasted into the email
              Will receives. We only use the token to gate the button, so it
              never needs to be sent. The submit button below reattaches to
              the form by id. */}
          <div className={`${styles.formGroup} ${styles.captchaGroup}`}>
            {formTouched && (
              <ReCAPTCHA
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                onChange={onCaptchaChange}
              />
            )}
          </div>

          <button
            type="submit"
            form="contact-form"
            className={styles.button}
            disabled={!captchaVerified}
            aria-describedby="submit-help"
          >
            Send Message
          </button>
          <p
            id="submit-help"
            className={styles.helperText}
            aria-live="polite"
          >
            {!formTouched
              ? 'Fill out the form to enable sending.'
              : captchaVerified
                ? 'Ready to send.'
                : 'Complete the verification above to enable sending.'}
          </p>
        </div>
      </div>
    </section>
  );
}
