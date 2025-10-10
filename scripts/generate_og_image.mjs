import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.resolve('public/images');
const SOURCE = path.resolve('public/images/timbro.jpg');
const OUT_PATH = path.join(OUTPUT_DIR, 'og-image-1200x630.jpg');

async function main() {
  if (!fs.existsSync(SOURCE)) {
    console.error(`Sorgente non trovata: ${SOURCE}`);
    process.exit(1);
  }
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Crea canvas 1200x630 con sfondo bianco e centra il timbro
  const canvas = Buffer.from(
    await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#ffffff' } })
      .jpeg({ quality: 85 })
      .toBuffer()
  );

  const stamp = sharp(SOURCE).resize({
    width: 1200,
    height: 630,
    fit: 'inside',
    withoutEnlargement: true,
  });

  const stampBuf = await stamp.jpeg({ quality: 85 }).toBuffer();
  const stampResizedMeta = await sharp(stampBuf).metadata();
  const left = Math.round((1200 - (stampResizedMeta.width || 0)) / 2);
  const top = Math.round((630 - (stampResizedMeta.height || 0)) / 2);

  const composite = await sharp(canvas)
    .composite([{ input: stampBuf, left, top }])
    .jpeg({ quality: 85, chromaSubsampling: '4:4:4' })
    .toFile(OUT_PATH);

  console.log(`OG image generata: ${OUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});