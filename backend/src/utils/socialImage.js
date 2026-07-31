import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const SOCIAL_DIR = path.join(UPLOADS_DIR, 'social');
const OVERLAY_PATH = path.join(process.cwd(), 'assets', 'overlay.png');

if (!fs.existsSync(SOCIAL_DIR)) {
  fs.mkdirSync(SOCIAL_DIR, { recursive: true });
}

export const createSocialImage = async ({ sourceFilename, price, phone, city, propertyTitle }) => {
  const sourcePath = path.join(UPLOADS_DIR, sourceFilename);
  if (!fs.existsSync(sourcePath)) return null;

  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const outputFilename = `social-${uniqueSuffix}.jpg`;
  const outputPath = path.join(SOCIAL_DIR, outputFilename);

  const W = 1080;
  const H = 1080;

  try {
    const baseImage = await sharp(sourcePath)
      .resize(W, H, { fit: 'cover', position: 'center' })
      .toBuffer();

    const priceText = price ? `${parseInt(price).toLocaleString()} MKD` : '';
    const phoneText = phone ? `Tel: ${phone}` : '';
    const cityText = city ? `${city}, Makedonija` : '';

    const svg = `
      <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="black" stop-opacity="0"/>
            <stop offset="40%" stop-color="black" stop-opacity="0.55"/>
            <stop offset="100%" stop-color="black" stop-opacity="0.93"/>
          </linearGradient>
        </defs>
        <rect width="${W}" height="${H}" fill="url(#grad)"/>

        <!-- smestime.com top right -->
        <text x="${W - 50}" y="65" font-family="DejaVu Sans,Arial,sans-serif" font-size="34" fill="white" font-weight="bold" text-anchor="end" opacity="0.9">smestime.com</text>

        <!-- City -->
        ${cityText ? `<text x="${W / 2}" y="${H - 250}" font-family="DejaVu Sans,Arial,sans-serif" font-size="38" fill="rgba(255,255,255,0.85)" text-anchor="middle">${cityText}</text>` : ''}

        <!-- Price big -->
        <text x="${W / 2}" y="${H - 150}" font-family="DejaVu Sans,Arial,sans-serif" font-weight="bold" font-size="100" fill="white" text-anchor="middle">${priceText}</text>

        <!-- Per night -->
        <text x="${W / 2}" y="${H - 80}" font-family="DejaVu Sans,Arial,sans-serif" font-size="42" fill="rgba(255,255,255,0.75)" text-anchor="middle">po nok</text>

        <!-- Phone -->
        <text x="${W / 2}" y="${H - 25}" font-family="DejaVu Sans,Arial,sans-serif" font-size="46" fill="white" font-weight="bold" text-anchor="middle">${phoneText}</text>
      </svg>
    `;

    const compositeOps = [{ input: Buffer.from(svg), top: 0, left: 0 }];

    if (fs.existsSync(OVERLAY_PATH)) {
      const logoResized = await sharp(OVERLAY_PATH)
        .resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toBuffer();
      compositeOps.push({ input: logoResized, top: 30, left: 40, blend: 'over' });
    }

    await sharp(baseImage)
      .composite(compositeOps)
      .jpeg({ quality: 92 })
      .toFile(outputPath);

    return outputFilename;
  } catch (err) {
    console.error('Social image error:', err.message);
    return null;
  }
};

export const deleteSocialImage = (filename) => {
  if (!filename) return;
  const filePath = path.join(SOCIAL_DIR, filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
};
