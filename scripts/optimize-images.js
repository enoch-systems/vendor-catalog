const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = './public';
const outputDir = './public/optimized';

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const imageFiles = [
  'wig.png',
  'wig2.jpeg',
  'wig3.jpeg',
  'wig4.jpeg',
  'wig5.jpeg',
  'wig9.jpeg',
  'wig10.jpeg',
  'wig15.jpeg',
  'avatar.jpeg',
  'access.png',
  'card.png',
  'delete.png',
  'eye-1024.avif',
  'hamburger.png',
  'home.png',
  'shopwigs.png',
  'shopping-bag.png',
  'sold_out.png',
  'soldout.png',
  'whatsapp.png'
];

async function optimizeImages() {
  for (const file of imageFiles) {
    const inputPath = path.join(inputDir, file);
    const ext = path.extname(file).toLowerCase();
    const baseName = path.basename(file, ext);
    
    if (!fs.existsSync(inputPath)) {
      console.log(`Skipping ${file} - not found`);
      continue;
    }

    try {
      // Generate WebP version
      await sharp(inputPath)
        .webp({ 
          quality: 85,
          effort: 6,
          smartSubsample: true
        })
        .toFile(path.join(outputDir, `${baseName}.webp`));

      // Generate AVIF version (if not already AVIF)
      if (ext !== '.avif') {
        await sharp(inputPath)
          .avif({ 
            quality: 80,
            effort: 6,
            chromaSubsampling: '4:2:0'
          })
          .toFile(path.join(outputDir, `${baseName}.avif`));
      }

      // Generate responsive sizes
      const sizes = [48, 96, 192, 384, 768, 1536];
      
      for (const size of sizes) {
        // WebP responsive
        await sharp(inputPath)
          .resize(size, null, { 
            withoutEnlargement: true,
            fit: 'inside'
          })
          .webp({ quality: 85, effort: 6 })
          .toFile(path.join(outputDir, `${baseName}-${size}.webp`));

        // AVIF responsive
        await sharp(inputPath)
          .resize(size, null, { 
            withoutEnlargement: true,
            fit: 'inside'
          })
          .avif({ quality: 80, effort: 6 })
          .toFile(path.join(outputDir, `${baseName}-${size}.avif`));
      }

      console.log(`✅ Optimized ${file}`);
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
    }
  }
  
  console.log('🎉 Image optimization complete!');
}

optimizeImages();
