/**
 * Texture Optimization Script
 * 
 * This Node.js script optimizes textures in the project to improve loading times.
 * It creates multiple resolution versions of each texture and converts them to 
 * more efficient formats (WebP).
 * 
 * To use this script:
 * 1. Install dependencies: npm install sharp glob
 * 2. Run: node scripts/optimize-textures.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const sharp = require('sharp');

// Configuration
const config = {
  // Source directory containing original textures
  sourceDir: 'public/textures',
  
  // Output directory for optimized textures
  outputDir: 'public/textures/optimized',
  
  // Quality settings for WebP compression (0-100)
  quality: 80,
  
  // Generate multiple resolutions for different device capabilities
  resolutions: [
    { name: 'high', scale: 1.0 },      // Original size
    { name: 'medium', scale: 0.5 },    // Half size
    { name: 'low', scale: 0.25 },      // Quarter size
    { name: 'thumbnail', scale: 0.1 }  // Thumbnail for preloading
  ],
  
  // File extensions to process
  extensions: ['.jpg', '.jpeg', '.png', '.webp']
};

// Create output directory if it doesn't exist
if (!fs.existsSync(config.outputDir)) {
  fs.mkdirSync(config.outputDir, { recursive: true });
}

// Get all image files recursively
const getImageFiles = () => {
  const patterns = config.extensions.map(ext => `${config.sourceDir}/**/*${ext}`);
  return patterns.flatMap(pattern => glob.sync(pattern));
};

// Process a single image file
const processImage = async (imagePath) => {
  const filename = path.basename(imagePath);
  const fileNameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
  const relDir = path.dirname(imagePath).replace(config.sourceDir, '');
  const outputFolder = path.join(config.outputDir, relDir);
  
  // Create output subdirectory if it doesn't exist
  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
  }
  
  try {
    const image = sharp(imagePath);
    const metadata = await image.metadata();
    
    console.log(`Processing: ${imagePath} (${metadata.width}x${metadata.height})`);
    
    // Create different resolution versions
    for (const resolution of config.resolutions) {
      const newWidth = Math.round(metadata.width * resolution.scale);
      const newHeight = Math.round(metadata.height * resolution.scale);
      
      // Skip if resulting image would be too small
      if (newWidth < 32 || newHeight < 32) {
        continue;
      }
      
      const outputPath = path.join(
        outputFolder, 
        `${fileNameWithoutExt}_${resolution.name}.webp`
      );
      
      await image
        .resize(newWidth, newHeight)
        .webp({ quality: config.quality })
        .toFile(outputPath);
      
      console.log(`  Created: ${outputPath} (${newWidth}x${newHeight})`);
    }
  } catch (err) {
    console.error(`Error processing ${imagePath}:`, err);
  }
};

// Main function
const optimizeTextures = async () => {
  console.log('Starting texture optimization...');
  
  const imageFiles = getImageFiles();
  console.log(`Found ${imageFiles.length} image files to process.`);
  
  // Process images sequentially to avoid memory issues
  for (const file of imageFiles) {
    await processImage(file);
  }
  
  console.log('\nTexture optimization complete!');
  console.log(`Optimized textures are available in: ${config.outputDir}`);
  console.log('\nUsage in code:');
  console.log('1. Import the device detection function:');
  console.log('   import { isLowPerformanceDevice } from "../utils/textureUtils";');
  console.log('2. Select appropriate texture resolution based on device capability:');
  console.log('   const quality = isLowPerformanceDevice() ? "low" : "high";');
  console.log('   const textureUrl = `/textures/optimized/planets/earth_${quality}.webp`;');
};

// Run the optimization
optimizeTextures().catch(err => {
  console.error('Optimization failed:', err);
  process.exit(1);
});
