import sharp from 'sharp';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public', 'brand');

async function optimizeLogos() {
  console.log('🖼️  Optimizing logos...\n');

  // Optimize logo-full.png
  const logoFullInput = join(publicDir, 'logo-full.png');
  const logoFullOutput = join(publicDir, 'logo-full-optimized.png');
  
  try {
    const fullImage = sharp(logoFullInput);
    const fullMetadata = await fullImage.metadata();
    console.log(`📷 logo-full.png original: ${fullMetadata.width}x${fullMetadata.height}px`);
    
    // Resize to max width 640px while maintaining aspect ratio
    await sharp(logoFullInput)
      .resize(640, null, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .png({ 
        compressionLevel: 9,
        effort: 10,
        quality: 90
      })
      .toFile(logoFullOutput);
    
    const fullStats = await sharp(logoFullOutput).metadata();
    console.log(`✅ logo-full optimized: ${fullStats.width}x${fullStats.height}px`);
    console.log(`   Saved to: ${logoFullOutput}\n`);
  } catch (err) {
    console.error('❌ Error optimizing logo-full:', err.message);
  }

  // Optimize logo-mark.png
  const logoMarkInput = join(publicDir, 'logo-mark.png');
  const logoMarkOutput = join(publicDir, 'logo-mark-optimized.png');
  
  try {
    const markImage = sharp(logoMarkInput);
    const markMetadata = await markImage.metadata();
    console.log(`📷 logo-mark.png original: ${markMetadata.width}x${markMetadata.height}px`);
    
    // Resize to 160x160px
    await sharp(logoMarkInput)
      .resize(160, 160, { 
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png({ 
        compressionLevel: 9,
        effort: 10,
        quality: 90
      })
      .toFile(logoMarkOutput);
    
    const markStats = await sharp(logoMarkOutput).metadata();
    console.log(`✅ logo-mark optimized: ${markStats.width}x${markStats.height}px`);
    console.log(`   Saved to: ${logoMarkOutput}\n`);
  } catch (err) {
    console.error('❌ Error optimizing logo-mark:', err.message);
  }

  console.log('🎉 Optimization complete!');
  console.log('\n📝 Next steps:');
  console.log('1. Check the optimized files in public/brand/');
  console.log('2. If satisfied, rename them to replace the originals:');
  console.log('   - logo-full-optimized.png → logo-full.png');
  console.log('   - logo-mark-optimized.png → logo-mark.png');
}

optimizeLogos().catch(console.error);
