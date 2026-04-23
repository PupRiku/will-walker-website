import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'
import { worksData } from '../src/data/works'
import { productionsData } from '../src/data/productions'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  let featuredCounter = 0

  // Seed plays
  for (const work of worksData) {
    const featuredOrder = work.featured ? ++featuredCounter : null

    await prisma.play.upsert({
      where: { slug: work.slug },
      update: {
        title: work.title,
        category: work.category,
        runtime: work.runtime ?? '',
        cast: work.cast,
        synopsis: work.synopsis,
        imageSrc: work.imageSrc,
        pdfSrc: work.pdfSrc ?? '',
        purchase: work.purchase ?? '',
        published: work.published ?? false,
        featured: work.featured ?? false,
        featuredOrder,
      },
      create: {
        slug: work.slug,
        title: work.title,
        category: work.category,
        runtime: work.runtime ?? '',
        cast: work.cast,
        synopsis: work.synopsis,
        imageSrc: work.imageSrc,
        pdfSrc: work.pdfSrc ?? '',
        purchase: work.purchase ?? '',
        published: work.published ?? false,
        featured: work.featured ?? false,
        featuredOrder,
      },
    })
  }

  // Seed productions and their photos
  let totalPhotos = 0
  let groupCounter = 0

  for (const production of productionsData) {
    // Upsert the Production group record
    const prod = await prisma.production.upsert({
      where: {
        playTitle_venue_productionYear: {
          playTitle: production.playTitle,
          venue: production.venue,
          productionYear: production.productionYear,
        },
      },
      update: {
        displayOrder: groupCounter,
      },
      create: {
        playTitle: production.playTitle,
        venue: production.venue,
        productionYear: production.productionYear,
        displayOrder: groupCounter,
      },
    })

    groupCounter++

    // Upsert each photo, linking to the Production
    for (let i = 0; i < production.photos.length; i++) {
      const photo = production.photos[i]

      await prisma.productionPhoto.upsert({
        where: { id: photo.id },
        update: {
          productionId: prod.id,
          playTitle: photo.playTitle,
          productionYear: photo.productionYear,
          venue: photo.venue,
          src: photo.src,
          alt: photo.alt,
          caption: photo.caption ?? null,
          displayOrder: i,
        },
        create: {
          id: photo.id,
          productionId: prod.id,
          playTitle: photo.playTitle,
          productionYear: photo.productionYear,
          venue: photo.venue,
          src: photo.src,
          alt: photo.alt,
          caption: photo.caption ?? null,
          displayOrder: i,
        },
      })

      totalPhotos++
    }
  }

  console.log(`Seeded ${worksData.length} plays (${featuredCounter} featured)`)
  console.log(`Seeded ${groupCounter} productions with ${totalPhotos} photos`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
