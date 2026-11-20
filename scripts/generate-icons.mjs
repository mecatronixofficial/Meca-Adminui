/**
 * Builds every icon and share image from the master logo.
 *
 *   bun run icons        (or: npm run icons)
 *
 * Source:  src/assets/logos/mecatronix-logo.png  (keep this as the high-resolution master)
 * Output:  public/favicon.ico, public/icons/* (icon-512.png is also the link-preview image),
 *          src/assets/logos/mecatronix-logo.webp  (the lightweight copy the UI imports)
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = resolve(root, "src/assets/logos/mecatronix-logo.png");
const INK = "#0b0d12";
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

/** The mark with transparent edges trimmed, so padding below is exact. */
const mark = await sharp(SOURCE).trim({ threshold: 1 }).png().toBuffer();

/**
 * The mark centred on a square canvas.
 * @param {number} size     canvas edge in px
 * @param {number} fill     share of the canvas the mark's longest side may use (0–1)
 * @param {string|object} background
 */
async function square(size, fill, background = TRANSPARENT) {
  const inner = Math.round(size * fill);
  const logo = await sharp(mark).resize(inner, inner, { fit: "inside", kernel: "lanczos3" }).toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: logo, gravity: "centre" }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/** Packs PNG images into one .ico (PNG-compressed entries are supported by every current browser). */
function ico(images) {
  const header = Buffer.alloc(6 + images.length * 16);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, data }, i) => {
    const entry = 6 + i * 16;
    header.writeUInt8(size >= 256 ? 0 : size, entry); // width
    header.writeUInt8(size >= 256 ? 0 : size, entry + 1); // height
    header.writeUInt8(0, entry + 2); // palette
    header.writeUInt8(0, entry + 3); // reserved
    header.writeUInt16LE(1, entry + 4); // colour planes
    header.writeUInt16LE(32, entry + 6); // bits per pixel
    header.writeUInt32LE(data.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...images.map((image) => image.data)]);
}

const outputs = {
  "public/favicon.ico": ico(
    await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await square(size, 0.96) }))),
  ),
  "public/icons/icon-192.png": await square(192, 0.86),
  "public/icons/icon-512.png": await square(512, 0.86),
  // Maskable icons are cropped to a circle or squircle: keep the mark inside the 80% safe zone.
  "public/icons/icon-maskable-512.png": await square(512, 0.6, INK),
  // iOS fills transparency with black, so give the home-screen icon a white tile.
  "public/icons/apple-touch-icon.png": await square(180, 0.72, "#ffffff"),
  // In-app logo: displayed at most 36px tall, so 4× is plenty for high-density screens.
  "src/assets/logos/mecatronix-logo.webp": await sharp(mark).resize({ height: 144 }).webp({ quality: 90, alphaQuality: 100 }).toBuffer(),
};

for (const [path, data] of Object.entries(outputs)) {
  const file = resolve(root, path);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, data);
  console.log(`${path.padEnd(42)} ${(data.length / 1024).toFixed(1).padStart(6)} KB`);
}
