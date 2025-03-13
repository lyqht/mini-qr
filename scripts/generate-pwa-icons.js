import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import process from 'process'

const sizes = [192, 512]
const inputFile = 'public/favicon.svg'
const outputDir = 'public'

async function generateIcons() {
  try {
    for (const size of sizes) {
      const outputFile = path.join(outputDir, `pwa-${size}x${size}.png`)
      await sharp(inputFile).resize(size, size).png().toFile(outputFile)
      console.log(`Generated ${outputFile}`)
    }

    // Generate apple touch icon
    await sharp(inputFile)
      .resize(180, 180)
      .png()
      .toFile(path.join(outputDir, 'apple-touch-icon.png'))
    console.log('Generated apple-touch-icon.png')

    // Copy favicon.svg to mask-icon.svg
    fs.copyFileSync(inputFile, path.join(outputDir, 'mask-icon.svg'))
    console.log('Generated mask-icon.svg')
  } catch (error) {
    console.error('Error generating icons:', error)
    process.exit(1)
  }
}

generateIcons()
