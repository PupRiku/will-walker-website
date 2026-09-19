import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'
import { worksData } from '../src/data/works'
import { productionsData } from '../src/data/productions'
import { normalizeShowRoyaltiesButton } from '../src/utils/royalties'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  let featuredCounter = 0

  // Seed plays
  for (const work of worksData) {
    const featuredOrder = work.featured ? ++featuredCounter : null
    const published = work.published ?? false

    await prisma.play.upsert({
      where: { slug: work.slug },
      // worksData (the archived seed source) has no bannerText, bannerColor,
      // or showRoyaltiesButton fields, so the update branch must not touch
      // them — doing so would reset an existing play's admin-managed banner,
      // or a manually opted-out showRoyaltiesButton, back to defaults on
      // every `prisma db seed` run. The one exception is forcing the
      // royalties toggle off when a play becomes published, since that
      // invariant (see normalizeShowRoyaltiesButton) must hold everywhere a
      // play is written, not just through the admin API.
      update: {
        title: work.title,
        category: work.category,
        runtime: work.runtime ?? '',
        cast: work.cast,
        synopsis: work.synopsis,
        imageSrc: work.imageSrc,
        pdfSrc: work.pdfSrc ?? '',
        purchase: work.purchase ?? '',
        published,
        featured: work.featured ?? false,
        featuredOrder,
        ...(published ? { showRoyaltiesButton: false } : {}),
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
        published,
        featured: work.featured ?? false,
        featuredOrder,
        bannerText: '',
        bannerColor: '',
        showRoyaltiesButton: normalizeShowRoyaltiesButton(published, true),
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
