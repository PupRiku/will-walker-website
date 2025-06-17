import Image from 'next/image';
import styles from './page.module.css';
import About from '@/components/About';
import Plays from '@/components/Plays';
import Contact from '@/components/Contact';

export default function Home() {
  return (
    <>
      <section id="home" className={styles.container}>
        <div className={styles.imageContainer}>
          <Image
            className={styles.image}
            src="/images/Will_Walker.jpg"
            alt="A friendly headshot of Will Walker, a man with a goatee, smiling warmly at the camera. He is wearing a black beret, a dark jacket, and a vibrant blue bow tie, posed in front of a royal blue curtain."
            width={500}
            height={500}
            priority
          />
        </div>
        <div className={styles.textContainer}>
          <h1 className={styles.nameHeading}>William L. Walker Montgomerie</h1>
          <p className={styles.subtitle}>Playwright | Director | Educator</p>
        </div>
      </section>
      <About />
      <Plays />
      <Contact />
    </>
  );
}
