import { copyFileSync, existsSync } from 'fs';
import { join } from 'path';

// Source logo file
const sourceLogo = join(process.cwd(), 'src', 'assets', 'main_logo.png');

// Destination directories
const mipmapDirs = [
  'android/app/src/main/res/mipmap-mdpi',
  'android/app/src/main/res/mipmap-hdpi',
  'android/app/src/main/res/mipmap-xhdpi',
  'android/app/src/main/res/mipmap-xxhdpi',
  'android/app/src/main/res/mipmap-xxxhdpi'
];

// Files to replace
const filesToReplace = [
  'ic_launcher.png',
  'ic_launcher_foreground.png',
  'ic_launcher_round.png'
];

console.log('Changing APK logo to main_logo.png...');

// Check if source logo exists
if (!existsSync(sourceLogo)) {
  console.error('Error: main_logo.png not found in src/assets/');
  process.exit(1);
}

// Copy logo to all mipmap directories
mipmapDirs.forEach(dir => {
  const fullPath = join(process.cwd(), dir);
  
  if (existsSync(fullPath)) {
    filesToReplace.forEach(file => {
      const destPath = join(fullPath, file);
      
      try {
        copyFileSync(sourceLogo, destPath);
        console.log(`✓ Updated ${destPath}`);
      } catch (err) {
        console.error(`✗ Failed to update ${destPath}: ${err.message}`);
      }
    });
  } else {
    console.warn(`⚠ Directory not found: ${fullPath}`);
  }
});

console.log('App icon update complete!');

// Instructions for adaptive icon
console.log('\nNote: For adaptive icons, you may also need to:');
console.log('1. Update android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml');
console.log('2. Consider using a maskable icon for better adaptive icon display');