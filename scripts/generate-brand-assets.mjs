import sharp from "sharp";
import { readFile } from "node:fs/promises";

const source = await readFile("assets/branding/offerme-logo.svg");
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

await render("assets/icon.png", 1024, 680);
await render("assets/android-icon-foreground.png", 1024, 560);
await render("assets/splash-icon.png", 2048, 760);
await render("assets/favicon.png", 512, 380);
