import Image from 'next/image';
import styles from './About.module.css';

export default function About() {
  return (
    <section id="about" className={styles.aboutSection}>
      <div className={styles.contentWrapper}>
        <h2 className={styles.heading}>About Me</h2>

        <p className={styles.paragraph}>
          William L. Walker Montgomerie is a playwright and theatre artist with
          a deep appreciation for storytelling and the collaborative spirit of
          the stage. He holds a Master of Arts in Theater Management and a
          Bachelor of Fine Arts in Directing and Acting, and has spent several
          years teaching theatre at a Texas two-year institution, where he
          remains committed to nurturing creativity and building community
          through the arts.
        </p>

        <div className={styles.listImageContainer}>
          <p className={styles.textColumn}>
            With experience both on and off the stage, Montgomerie&apos;s work
            is shaped by a love for character-driven narratives, thoughtful
            dialogue, and the unique alchemy that happens when artists and
            audiences come together. His plays often explore the humor,
            heartache, and quiet resilience of everyday lives, drawing on a wide
            range of theatrical traditions while remaining grounded in honest
            human experience.
          </p>

          <div className={styles.imageWrapper}>
            <Image
              src="/images/assets/Will_Walker.jpg"
              alt="A friendly headshot of Will Walker, a man with a goatee, smiling warmly at the camera. He is wearing a black beret, a dark jacket, and a vibrant blue bow tie, posed in front of a royal blue curtain."
              width={500}
              height={500}
              className={styles.aboutImage}
            />
          </div>
        </div>

        <p className={styles.paragraph}>
          Whether in the classroom, rehearsal hall, or writing desk, he values
          collaboration, curiosity, and the ongoing process of learning through
          the art of theatre.
        </p>
      </div>
    </section>
  );
}
