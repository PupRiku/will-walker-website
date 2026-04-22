import type { Metadata } from 'next';
import WorksClient from './WorksClient';

export const metadata: Metadata = {
  title: 'All Works | William L. Walker Montgomerie',
  description:
    'Browse the full catalog of plays by William L. Walker Montgomerie — dramas, comedies, historical works, and more. Filter by genre, runtime, and cast size.',
};

export default function WorksPage() {
  return <WorksClient />;
}
