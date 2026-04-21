import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { worksData } from '@/data/works';

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return worksData.map((work) => ({ slug: work.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const work = worksData.find((w) => w.slug === slug);
  if (!work) return {};

  const firstSentence = work.synopsis.split(/(?<=\.)\s/)[0];

  return {
    title: `${work.title} | William L. Walker Montgomerie`,
    description: firstSentence,
  };
}

export default async function PlayPage({ params }: Props) {
  const { slug } = await params;
  const work = worksData.find((w) => w.slug === slug);

  if (!work) {
    notFound();
  }

  return null;
}
