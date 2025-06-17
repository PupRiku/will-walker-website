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
              src="/images/about_will.png"
              alt="A photo of Will Walker in what appears to be a library or study. He looks directly at the camera with a curious expression, wearing a green plaid shirt, black vest, and a dark flat cap, set against a backdrop of floor-to-ceiling antique books."
              width={400}
              height={500}
              style={{ width: '100%', height: 'auto' }}
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
