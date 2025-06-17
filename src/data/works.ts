export type Work = {
  title: string;
  category: string;
  imageSrc: string;
  pdfSrc: string;
  cast: string;
  synopsis: string;
};

export const worksData: Work[] = [
  {
    title: 'The Last Echo',
    category: 'Drama',
    imageSrc: '/images/script_placeholder.png',
    pdfSrc: '/pdfs/Placeholder-PDF.pdf',
    cast: '2F, 3M',
    synopsis:
      'A gripping drama about a family unraveling after a long-held secret comes to light in a small, isolated town.',
  },
  {
    title: 'Cobblestone Hearts',
    category: 'Slice of Life',
    imageSrc: '/images/script_placeholder.png',
    pdfSrc: '/pdfs/Placeholder-PDF.pdf',
    cast: '1F, 1M',
    synopsis:
      'A romantic comedy following two strangers who find a lost diary and try to return it to its owner, falling in love along the way.',
  },
  {
    title: 'A Moment of Silence',
    category: 'Experimental',
    imageSrc: '/images/script_placeholder.png',
    pdfSrc: '/pdfs/Placeholder-PDF.pdf',
    cast: '4F, 2M, 1 any gender',
    synopsis:
      'An experimental short piece exploring communication and loss through a series of interconnected, dialogue-free vignettes.',
  },
  {
    title: 'The Paris Apartment',
    category: 'Comedy',
    imageSrc: '/images/script_placeholder.png',
    pdfSrc: '/pdfs/Placeholder-PDF.pdf',
    cast: '4F, 2M, 1 any gender',
    synopsis:
      'An experimental short piece exploring communication and loss through a series of interconnected, dialogue-free vignettes.',
  },
];
