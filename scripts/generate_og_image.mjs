import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.resolve('public/images');
const SOURCE = path.resolve('public/images/photoHeader.jpg');
const OUT_PATH = path.join(OUTPUT_DIR, 'og-image-1200x630.jpg');

async function main() {
  if (!fs.existsSync(SOURCE)) {
    console.error(`Sorgente non trovata: ${SOURCE}`);
    process.exit(1);
  }
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Ridimensiona con crop "cover" (riempie 1200x630, tagliando l'eccesso)
  await sharp(SOURCE)
    .resize({ width: 1200, height: 630, fit: 'cover', position: 'top' })
    .jpeg({ quality: 85, chromaSubsampling: '4:4:4' })
    .toFile(OUT_PATH);

  console.log(`OG image generata: ${OUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});