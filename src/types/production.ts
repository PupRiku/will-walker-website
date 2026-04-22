// Full shape returned by GET /api/productions (matches Prisma ProductionPhoto model).
export type ProductionPhoto = {
  id: string;
  productionId: string | null;
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

// Grouped shape returned by GET /api/productions (matches Prisma Production model).
export type Production = {
  id: string;
  playTitle: string;
  venue: string;
  productionYear: number;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  photos: ProductionPhoto[];
};
