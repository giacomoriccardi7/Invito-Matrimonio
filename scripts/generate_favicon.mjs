import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Output path for the favicon
const outputPath = resolve(__dirname, '../public/favicon.png');

// SVG with centered monogram "G & G"
const svgWidth = 512;
const svgHeight = 512;
const fontColor = '#000000'; // Black
const fontFamily = 'Georgia, Times New Roman, serif';
const fontSize = 180; // Fits better within 512 canvas

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
  <rect width="100%" height="100%" fill="none" />
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
        font-family="${fontFamily}" font-size="${fontSize}" font-weight="600"
        fill="${fontColor}">G &amp; G</text>
</svg>`;

async function generate() {
  try {
    await sharp(Buffer.from(svg))
      .png({ compressionLevel: 9 })
      .toFile(outputPath);
    console.log(`Favicon generated at: ${outputPath}`);
  } catch (err) {
    console.error('Failed to generate favicon:', err);
    process.exitCode = 1;
  }
}

generate();