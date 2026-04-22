// Full shape returned by GET /api/productions (matches Prisma ProductionPhoto model).
export type ProductionPhoto = {
  id: string;
  playTitle: string;
  productionYear: number;
  venue: string;
  src: string;
  alt: string;
  caption: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

// Grouped shape returned by GET /api/productions.
export type Production = {
  playTitle: string;
  productionYear: number;
  venue: string;
  photos: ProductionPhoto[];
};
