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
    include: { accolades: true, history: true },
  });
  const plays: Play[] = rows.map((p) => ({
    ...p,
    accolades: p.accolades.map(({ id, name, organization, month, year }) => ({
      id,
      name,
      organization,
      month,
      year,
    })),
    history: p.history.map(({ id, type, month, year, location }) => ({
      id,
      type,
      month,
      year,
      location,
    })),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  return (
    <>
      <section id="home" className={styles.container}>
        <div className={styles.imageContainer}>
          <Image
            className={styles.image}
            src="/images/assets/will_profile.jpg"
            alt="A portrait of Will Walker, a bearded man with blue eyes and a playful, wide-eyed expression. He wears a black flat cap, a green plaid shirt, and a black vest against a warm, mottled brown backdrop."
            width={800}
            height={1067}
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
