// Minimal shape used by UI components and filter/sort utilities.
// Kept optional-friendly so existing component and test code doesn't need updating.
export type Work = {
  slug: string;
  title: string;
  category: string;
  imageSrc: string;
  pdfSrc: string;
  cast: string;
  synopsis: string;
  featured?: boolean;
  published?: boolean;
  purchase?: string;
  runtime?: string;
};

// Full shape returned by GET /api/plays (matches Prisma Play model).
// Play is structurally assignable to Work, so Play[] can be passed anywhere Work[] is expected.
export type Play = {
  id: string;
  slug: string;
  title: string;
  category: string;
  runtime: string;
  cast: string;
  synopsis: string;
  imageSrc: string;
  pdfSrc: string;
  purchase: string;
  published: boolean;
  featured: boolean;
  featuredOrder: number | null;
  createdAt: string;
  updatedAt: string;
};
