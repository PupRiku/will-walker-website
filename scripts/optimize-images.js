const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');

const LOGO = 'logo.png';
const CASTING_NOTE = 'casting_note_icon.png';
const HEADSHOT_JPGS = new Set(['Will_Walker.jpg', 'about_will.jpg']);

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function getConfig(filename) {
  const ext = path.extname(filename).toLowerCase();
  const base = path.basename(filename);

  if (ext === '.png') {
    if (base === LOGO) {
      return { width: 400, format: 'png', options: { compressionLevel: 9 } };
    }
    if (base === CASTING_NOTE) {
      return { width: 256, format: 'png', options: { compressionLevel: 9 } };
    }
    // All other PNGs: cover art + script_placeholder
    return { width: 800, format: 'png', options: { compressionLevel: 9 } };
  }

  if (ext === '.jpg' || ext === '.jpeg') {
    const width = HEADSHOT_JPGS.has(base) ? 600 : 800;
    return { width, format: 'jpeg', options: { quality: 85 } };
  }

  return null;
}

async function processImage(filename) {
  const filePath = path.join(IMAGES_DIR, filename);
  const config = getConfig(filename);
  if (!config) return null;

  const beforeSize = fs.statSync(filePath).size;
  const tempPath = filePath + '.opt_tmp';

  try {
    const pipeline = sharp(filePath).resize({
      width: config.width,
      withoutEnlargement: true,
    });

    if (config.format === 'png') {
      await pipeline.png(config.options).toFile(tempPath);
    } else {
      await pipeline.jpeg(config.options).toFile(tempPath);
    }

    fs.renameSync(tempPath, filePath);
  } catch (err) {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    throw err;
  }

  const afterSize = fs.statSync(filePath).size;
  return { beforeSize, afterSize };
}

async function main() {
  const files = fs
    .readdirSync(IMAGES_DIR)
    .filter((f) => /\.(png|jpe?g)$/i.test(f))
    .sort();

  console.log('\nOptimizing images in /public/images/\n');
  const col = 52;
  console.log(
    'File'.padEnd(col) + '   Before'.padStart(10) + '    After'.padStart(10) + '   Savings'
  );
  console.log('-'.repeat(88));

  let totalBefore = 0;
  let totalAfter = 0;

  for (const file of files) {
    const result = await processImage(file);
    if (!result) {
      console.log(file.padEnd(col) + '   (skipped)');
      continue;
    }

    const { beforeSize, afterSize } = result;
    totalBefore += beforeSize;
    totalAfter += afterSize;

    const saved = beforeSize - afterSize;
    const pct = ((saved / beforeSize) * 100).toFixed(1);
    const sign = saved >= 0 ? '-' : '+';

    console.log(
      file.padEnd(col) +
        formatBytes(beforeSize).padStart(10) +
        formatBytes(afterSize).padStart(10) +
        `   ${sign}${Math.abs(parseFloat(pct))}%`
    );
  }

  console.log('-'.repeat(88));
  const totalSaved = totalBefore - totalAfter;
  const totalPct = ((totalSaved / totalBefore) * 100).toFixed(1);
  console.log(
    `\nTotal  ${formatBytes(totalBefore)} → ${formatBytes(totalAfter)}   saved ${formatBytes(totalSaved)} (${totalPct}% reduction)\n`
  );
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
