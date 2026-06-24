// scripts/optimize-images.js
// Converts PNG/JPG images to WebP format with resizing
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../public');

const images = [
  // [input, outputWebP, maxWidth, quality]
  ['hero.png',         'hero.webp',         1280, 80],
  ['neighborhood.png', 'neighborhood.webp', 1024, 78],
  ['interior.png',     'interior.webp',      800, 78],
  ['house_exterior.png','house_exterior.webp',800, 78],
  ['house_komersil.png','house_komersil.webp',800, 78],
  ['house_subsidi.png', 'house_subsidi.webp', 800, 78],
  ['award_1.jpg',      'award_1.webp',       800, 75],
  ['award_2.jpg',      'award_2.webp',       800, 75],
  ['award_3.jpg',      'award_3.webp',       800, 75],
  ['award_4.jpeg',     'award_4.webp',       800, 75],
  ['award_5.jpeg',     'award_5.webp',       600, 75],
  ['award_6.jpeg',     'award_6.webp',       600, 75],
  ['award_7.jpeg',     'award_7.webp',       600, 75],
  ['award_8.jpeg',     'award_8.webp',       600, 75],
  ['news_1.jpg',       'news_1.webp',        600, 75],
  ['news_2.jpg',       'news_2.webp',        600, 75],
  ['news_3.jpeg',      'news_3.webp',        600, 75],
  ['news_4.jpg',       'news_4.webp',        600, 75],
  ['news_5.jpeg',      'news_5.webp',        600, 75],
  ['news_6.jpeg',      'news_6.webp',        600, 75],
];

async function optimizeImages() {
  console.log('🖼️  Starting image optimization...\n');
  
  for (const [input, outputWebP, maxWidth, quality] of images) {
    const inputPath = path.join(publicDir, input);
    const outputPath = path.join(publicDir, outputWebP);
    
    if (!fs.existsSync(inputPath)) {
      console.log(`  ⚠️  Skipping ${input} (not found)`);
      continue;
    }

    try {
      const inputSize = fs.statSync(inputPath).size;
      
      await sharp(inputPath)
        .resize({ width: maxWidth, withoutEnlargement: true })
        .webp({ quality })
        .toFile(outputPath);
      
      const outputSize = fs.statSync(outputPath).size;
      const savings = ((1 - outputSize / inputSize) * 100).toFixed(0);
      console.log(`  ✅ ${input} → ${outputWebP}: ${(inputSize/1024).toFixed(0)}KB → ${(outputSize/1024).toFixed(0)}KB (saved ${savings}%)`);
    } catch (err) {
      console.error(`  ❌ Failed: ${input}: ${err.message}`);
    }
  }
  
  console.log('\n✅ Image optimization complete!');
}

optimizeImages();
