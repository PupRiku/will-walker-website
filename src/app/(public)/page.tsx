import Image from 'next/image';
import styles from './page.module.css';
import About from '@/components/About';
import Plays from '@/components/Plays';
import Contact from '@/components/Contact';
import { prisma } from '@/lib/prisma';
import type { Play } from '@/types/play';

export const revalidate = 60;

export default async function Home() {
  const rows = await prisma.play.findMany({
    orderBy: [
      { featuredOrder: { sort: 'asc', nulls: 'last' } },
      { title: 'asc' },
    ],
  });
  const plays: Play[] = rows.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  return (
    <>
      <section id="home" className={styles.container}>
        <div className={styles.imageContainer}>
          <Image
            className={styles.image}
            src="/images/assets/Will_Walker.jpg"
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
      <Plays plays={plays} />
      <Contact />
    </>
  );
}
