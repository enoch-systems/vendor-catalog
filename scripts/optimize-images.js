#!/usr/bin/env node

/**
 * Image optimization script (sharp).
 *
 * Produces:
 *   - /public/optimized/<name>.webp and .avif (full, max-width)
 *   - responsive srcset variants (e.g. <name>-768.webp)
 *   - /public/optimized/manifest.json (srcset + placeholder)
 *
 * Run:
 *   node scripts/optimize-images.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const INPUT_DIR = path.resolve(__dirname, '../public');
const OUTPUT_DIR = path.resolve(__dirname, '../public/optimized');

// Quality presets (tweak for tradeoff between size / quality)
const QUALITY = {
  webp: 80,
  avif: 70,
  jpeg: 75
};

// Responsive widths (used for srcset generation)
const RESPONSIVE_WIDTHS = [320, 480, 768, 1024, 1280, 1536, 2048];

const SUPPORTED_INPUT_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];

const log = (...args) => console.log('[optimize-images]', ...args);

/**
 * Scan a directory for image files (excluding optimized output folder).
 */
function getImageFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      // Skip the output folder
      if (entry.name === path.basename(OUTPUT_DIR)) continue;
      files.push(...getImageFiles(path.join(dir, entry.name)));
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (SUPPORTED_INPUT_EXTENSIONS.includes(ext)) {
      files.push(path.join(dir, entry.name));
    }
  }

  return files;
}

/**
 * Generate a tiny blur placeholder for a fast LCP-friendly load.
 */
async function generatePlaceholder(inputPath) {
  try {
    const buffer = await sharp(inputPath)
      .rotate()
      .resize(20, 20, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 30 })
      .toBuffer();

    return `data:image/webp;base64,${buffer.toString('base64')}`;
  } catch (error) {
    return undefined;
  }
}

/**
 * Build an output filename prefix for a source image.
 */
function buildBaseName(inputPath) {
  const name = path.basename(inputPath);
  const base = name.split('.').slice(0, -1).join('.');
  return base;
}

async function ensureOutputDir() {
  await fs.promises.mkdir(OUTPUT_DIR, { recursive: true });
}

async function optimizeFile(inputPath) {
  const ext = path.extname(inputPath).toLowerCase();
  const base = buildBaseName(inputPath);
  const outputBase = path.join(OUTPUT_DIR, base);
  const publicBase = `/optimized/${base}`;

  const metadata = await sharp(inputPath).metadata();
  const maxWidth = metadata.width || RESPONSIVE_WIDTHS[RESPONSIVE_WIDTHS.length - 1];

  const sizes = RESPONSIVE_WIDTHS.filter((w) => w <= maxWidth);
  if (!sizes.includes(maxWidth) && maxWidth > 0) {
    sizes.push(maxWidth);
  }

  const placeholder = await generatePlaceholder(inputPath);

  const sources = {
    webp: [],
    avif: []
  };

  // Produce a full-size (max) variant for each format
  const baseFormats = ['webp', 'avif'];
  await Promise.all(
    baseFormats.map(async (format) => {
      const outputPath = `${outputBase}.${format}`;
      const transformer = sharp(inputPath).rotate().resize({ width: maxWidth, withoutEnlargement: true });

      if (format === 'webp') {
        await transformer.webp({ quality: QUALITY.webp, effort: 4, smartSubsample: true }).toFile(outputPath);
      } else if (format === 'avif') {
        await transformer.avif({ quality: QUALITY.avif, effort: 4, chromaSubsampling: '4:2:0' }).toFile(outputPath);
      }

      sources[format].push({ width: maxWidth, file: `${publicBase}.${format}` });
    })
  );

  // Make responsive versions
  for (const width of sizes) {
    const resizeOptions = { width, withoutEnlargement: true, fit: 'inside' };

    // WebP
    const webpPath = `${outputBase}-${width}.webp`;
    await sharp(inputPath)
      .rotate()
      .resize(resizeOptions)
      .webp({ quality: QUALITY.webp, effort: 4, smartSubsample: true })
      .toFile(webpPath);
    sources.webp.push({ width, file: `${publicBase}-${width}.webp` });

    // AVIF
    const avifPath = `${outputBase}-${width}.avif`;
    await sharp(inputPath)
      .rotate()
      .resize(resizeOptions)
      .avif({ quality: QUALITY.avif, effort: 4, chromaSubsampling: '4:2:0' })
      .toFile(avifPath);
    sources.avif.push({ width, file: `${publicBase}-${width}.avif` });
  }

  return {
    name: path.basename(inputPath),
    sources,
    placeholder,
  };
}

async function writeManifest(manifest) {
  const manifestPath = path.join(OUTPUT_DIR, 'manifest.json');
  await fs.promises.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  log('Wrote manifest:', manifestPath);
}

async function run() {
  await ensureOutputDir();

  const files = getImageFiles(INPUT_DIR);
  if (!files.length) {
    log('No images found to optimize. Make sure there are images in', INPUT_DIR);
    return;
  }

  const manifest = {};

  for (const file of files) {
    try {
      log('Optimizing', path.relative(INPUT_DIR, file));
      const entry = await optimizeFile(file);
      manifest[entry.name] = entry;
      log('✅ Done', entry.name);
    } catch (error) {
      log('❌ Failed to optimize', file, error.message || error);
    }
  }

  await writeManifest(manifest);
  log('🎉 Image optimization complete!');
}

run().catch((error) => {
  console.error('[optimize-images] Unhandled error:', error);
  process.exit(1);
});
