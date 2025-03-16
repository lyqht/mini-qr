import sharp from 'sharp'
import path from 'path'
import process from 'process'

const SOURCE_ICON = 'public/app_icons/web/icon-512.png'
const OUTPUT_DIR = 'public/app_icons/web'

// Common sizes for iOS and Android splash screens with device pixel ratios
const SPLASH_SCREENS = [
  // iPhone SE, 4.7" iPhone (2x)
  { width: 750 * 2, height: 1334 * 2, name: '750x1334@2x' },
  // iPhone 14, 13 (3x)
  { width: 1170 * 3, height: 2532 * 3, name: '1170x2532@3x' },
  // iPhone Pro Max (3x)
  { width: 1290 * 3, height: 2796 * 3, name: '1290x2796@3x' },
  // iPad Pro 12.9" (2x)
  { width: 2048 * 2, height: 2732 * 2, name: '2048x2732@2x' }
]

async function generateSplashScreens() {
  try {
    // Create light version splash screens
    for (const size of SPLASH_SCREENS) {
      const outputFile = path.join(OUTPUT_DIR, `splash-${size.name}.png`)

      // Calculate icon size (40% of the smallest dimension)
      const minDimension = Math.min(size.width, size.height)
      const iconSize = Math.floor(minDimension * 0.4)

      // Create a new image with white background
      await sharp({
        create: {
          width: size.width,
          height: size.height,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        }
      })
        .composite([
          {
            input: await sharp(SOURCE_ICON)
              .resize({
                width: iconSize,
                height: iconSize,
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 0 },
                kernel: 'lanczos3' // Use high-quality resampling
              })
              .toBuffer(),
            gravity: 'center'
          }
        ])
        .png({ quality: 100 }) // Use maximum PNG quality
        .toFile(outputFile)

      console.log(`Generated ${outputFile}`)
    }

    // Create screenshots with proper background
    const screenshotSizes = [
      { name: 'narrow', width: 1170 * 3, height: 2532 * 3 }, // 3x for modern devices
      { name: 'wide', width: 2532 * 3, height: 1170 * 3 }
    ]

    for (const size of screenshotSizes) {
      const iconSize = Math.min(size.width, size.height) * 0.4 // Reduced to 40% for better proportion

      // Create a new image with white background
      await sharp({
        create: {
          width: size.width,
          height: size.height,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        }
      })
        .composite([
          {
            input: await sharp(SOURCE_ICON)
              .resize({
                width: Math.floor(iconSize),
                height: Math.floor(iconSize),
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 0 },
                kernel: 'lanczos3' // Use high-quality resampling
              })
              .toBuffer(),
            gravity: 'center'
          }
        ])
        .png({ quality: 100 }) // Use maximum PNG quality
        .toFile(path.join(OUTPUT_DIR, `screenshot-${size.name}.png`))

      console.log(`Generated screenshot-${size.name}.png`)
    }
  } catch (error) {
    console.error('Error generating splash screens:', error)
    process.exit(1)
  }
}

generateSplashScreens()
