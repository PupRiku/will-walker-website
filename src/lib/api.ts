import type { Play } from '@/types/play';
import type { Production } from '@/types/production';

function getBaseUrl(): string {
  if (typeof window !== 'undefined') return ''; // browser: relative URL works
  return process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'; // server: needs absolute URL
}

export async function fetchPlays(): Promise<Play[]> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/plays`);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function fetchPlay(slug: string): Promise<Play | null> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/plays/${slug}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchProductions(): Promise<Production[]> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/productions`);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}
