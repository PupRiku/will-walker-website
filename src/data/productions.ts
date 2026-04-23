// ARCHIVED: This file is no longer imported by the app.
// Data is now managed via Supabase. See src/types/ for type definitions.
// Kept for reference and as a seed data source (prisma/seed.ts).

type ProductionPhoto = {
  id: string;
  playTitle: string;
  productionYear: number;
  venue: string;
  src: string;
  alt: string;
  caption?: string;
};

type Production = {
  playTitle: string;
  productionYear: number;
  venue: string;
  photos: ProductionPhoto[];
};

export const productionsData: Production[] = [
  {
    playTitle: 'Echoes of Valor',
    productionYear: 2025,
    venue: 'Paris Community Theatre, Paris, TX',
    photos: [
      {
        id: 'eov-table-read-01',
        playTitle: 'Echoes of Valor',
        productionYear: 2025,
        venue: 'Paris Community Theatre, Paris, TX',
        src: '/images/photos/echoes-of-valor-table-read-01.jpg',
        alt: 'Cast members seated around a long table reading scripts at the first table read of Echoes of Valor, with the play cover visible in the foreground',
        caption: 'First table read at Paris Community Theatre',
      },
      {
        id: 'eov-table-read-02',
        playTitle: 'Echoes of Valor',
        productionYear: 2025,
        venue: 'Paris Community Theatre, Paris, TX',
        src: '/images/photos/echoes-of-valor-table-read-02.jpg',
        alt: 'Wide shot of the full cast seated along a table reading scripts, with colorful stage curtains lit in red and blue behind them',
        caption: 'Full cast at the first table read',
      },
    ],
  },
  {
    playTitle: 'The Squatch of Avon: Super Extended Conspiracy Cut',
    productionYear: 2025,
    venue: 'Grayson College, Denison, TX',
    photos: [
      {
        id: 'squatch-grayson-01',
        playTitle: 'The Squatch of Avon: Super Extended Conspiracy Cut',
        productionYear: 2025,
        venue: 'Grayson College, Denison, TX',
        src: '/images/photos/squatch-of-avon-grayson-01.jpg',
        alt: 'Actor playing Doug stands center stage with arms spread wide, surrounded by red-tinged fog, conspiracy board and I Want to Believe poster visible behind him',
      },
      {
        id: 'squatch-grayson-02',
        playTitle: 'The Squatch of Avon: Super Extended Conspiracy Cut',
        productionYear: 2025,
        venue: 'Grayson College, Denison, TX',
        src: '/images/photos/squatch-of-avon-grayson-02.jpg',
        alt: 'Doug holds up a mysterious piece of evidence while a male actor seated at the table and a female actor standing to the right look on skeptically',
      },
      {
        id: 'squatch-grayson-03',
        playTitle: 'The Squatch of Avon: Super Extended Conspiracy Cut',
        productionYear: 2025,
        venue: 'Grayson College, Denison, TX',
        src: '/images/photos/squatch-of-avon-grayson-03.jpg',
        alt: 'Female actor lying in a sleeping bag under a warm lamp, looking contemplatively off to the side in an intimate moment',
      },
      {
        id: 'squatch-grayson-04',
        playTitle: 'The Squatch of Avon: Super Extended Conspiracy Cut',
        productionYear: 2025,
        venue: 'Grayson College, Denison, TX',
        src: '/images/photos/squatch-of-avon-grayson-04.jpg',
        alt: 'Doug grabs the collar of another male actor who stares up at him wide-eyed in a tense confrontation',
      },
      {
        id: 'squatch-grayson-05',
        playTitle: 'The Squatch of Avon: Super Extended Conspiracy Cut',
        productionYear: 2025,
        venue: 'Grayson College, Denison, TX',
        src: '/images/photos/squatch-of-avon-grayson-05.jpg',
        alt: 'Doug and another male actor huddle over papers at the table while a female actor watches from the right, conspiracy board covered in red string visible behind them',
      },
      {
        id: 'squatch-grayson-06',
        playTitle: 'The Squatch of Avon: Super Extended Conspiracy Cut',
        productionYear: 2025,
        venue: 'Grayson College, Denison, TX',
        src: '/images/photos/squatch-of-avon-grayson-06.jpg',
        alt: 'Close-up of a male actor leaning on the table with an intense, focused expression',
      },
      {
        id: 'squatch-grayson-07',
        playTitle: 'The Squatch of Avon: Super Extended Conspiracy Cut',
        productionYear: 2025,
        venue: 'Grayson College, Denison, TX',
        src: '/images/photos/squatch-of-avon-grayson-07.jpg',
        alt: 'Wide shot of all four actors seated around the table in the cluttered conspiracy-filled basement set, storage boxes scattered across the stage floor',
      },
      {
        id: 'squatch-grayson-08',
        playTitle: 'The Squatch of Avon: Super Extended Conspiracy Cut',
        productionYear: 2025,
        venue: 'Grayson College, Denison, TX',
        src: '/images/photos/squatch-of-avon-grayson-08.jpg',
        alt: 'Female actor lying dramatically on the stage floor, head tilted back',
      },
      {
        id: 'squatch-grayson-09',
        playTitle: 'The Squatch of Avon: Super Extended Conspiracy Cut',
        productionYear: 2025,
        venue: 'Grayson College, Denison, TX',
        src: '/images/photos/squatch-of-avon-grayson-09.jpg',
        alt: 'Close-up portrait of Doug under warm amber stage lighting, Sasquatch Research Team neon sign glowing yellow-green behind him',
      },
    ],
  },
];
