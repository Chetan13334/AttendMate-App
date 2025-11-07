import { createCanvas, loadImage } from 'canvas';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// Source logo file
const sourceLogo = join(process.cwd(), 'src', 'assets', 'main_logo.png');

// Destination directories and sizes
const iconSizes = [
  { dir: 'android/app/src/main/res/mipmap-mdpi', size: 48 },
  { dir: 'android/app/src/main/res/mipmap-hdpi', size: 72 },
  { dir: 'android/app/src/main/res/mipmap-xhdpi', size: 96 },
  { dir: 'android/app/src/main/res/mipmap-xxhdpi', size: 144 },
  { dir: 'android/app/src/main/res/mipmap-xxxhdpi', size: 192 }
];

// Files to create
const filesToCreate = [
  'ic_launcher.png',
  'ic_launcher_foreground.png',
  'ic_launcher_round.png'
];

console.log('Resizing APK icons...');

// Check if source logo exists
if (!existsSync(sourceLogo)) {
  console.error('Error: main_logo.png not found in src/assets/');
  process.exit(1);
}

// Function to resize and save image
async function resizeAndSaveImage(inputPath, outputPath, size) {
  try {
    const image = await loadImage(inputPath);
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Draw image centered and scaled to fit
    ctx.drawImage(image, 0, 0, size, size);
    
    // Save as PNG
    const buffer = canvas.toBuffer('image/png');
    writeFileSync(outputPath, buffer);
    
    return true;
  } catch (err) {
    console.error(`Error processing ${outputPath}: ${err.message}`);
    return false;
  }
}

// Process all icon sizes
async function processIcons() {
  try {
    // Load the source image to check if it's valid
    await loadImage(sourceLogo);
    
    for (const { dir, size } of iconSizes) {
      const fullPath = join(process.cwd(), dir);
      
      // Create directory if it doesn't exist
      if (!existsSync(fullPath)) {
        mkdirSync(fullPath, { recursive: true });
      }
      
      // Create all required icon files at this size
      for (const file of filesToCreate) {
        const destPath = join(fullPath, file);
        const success = await resizeAndSaveImage(sourceLogo, destPath, size);
        
        if (success) {
          console.log(`✓ Created ${destPath} (${size}x${size})`);
        } else {
          console.error(`✗ Failed to create ${destPath}`);
        }
      }
    }
    
    console.log('App icon resizing complete!');
  } catch (err) {
    console.error(`Error loading source image: ${err.message}`);
    process.exit(1);
  }
}

// Run the process
processIcons();