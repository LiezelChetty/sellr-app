import sharp from "sharp";
import { readFile } from "node:fs/promises";

const source = await readFile("assets/branding/offerme-logo.svg");
const sourceText = source.toString("utf8");
const tagArtwork = Buffer.from(
  sourceText.replace('viewBox="0 0 46.16 36.87"', 'viewBox="8 0 27 26"'),
);
async function render(path, size, artworkWidth, background = "#ffffff") {
  const artwork = await sharp(source)
    .resize({ width: artworkWidth, fit: "inside" })
    .png()
    .toBuffer();
  const meta = await sharp(artwork).metadata();
  await sharp({
    create: { width: size, height: size, channels: 4, background },
  })
    .composite([
      {
        input: artwork,
        left: Math.round((size - meta.width) / 2),
        top: Math.round((size - meta.height) / 2),
      },
    ])
    .png()
    .toFile(path);
}

await sharp(source)
  .resize({ width: 924, fit: "inside" })
  .png()
  .toFile("assets/branding/offerme-logo-runtime.png");

async function renderTag(path, size, artworkWidth, background) {
  const artwork = await sharp(tagArtwork)
    .resize({ width: artworkWidth, fit: "inside" })
    .png()
    .toBuffer();
  const meta = await sharp(artwork).metadata();
  await sharp({
    create: { width: size, height: size, channels: 4, background },
  })
    .composite([
      {
        input: artwork,
        left: Math.round((size - meta.width) / 2),
        top: Math.round((size - meta.height) / 2),
      },
    ])
    .png()
    .toFile(path);
}

await renderTag("assets/icon.png", 1024, 650, "#ffffff");
await renderTag("assets/android-icon-foreground.png", 1024, 560, {
  r: 0,
  g: 0,
  b: 0,
  alpha: 0,
});
await render("assets/splash-icon.png", 2048, 760);
await renderTag("assets/favicon.png", 512, 320, "#ffffff");
