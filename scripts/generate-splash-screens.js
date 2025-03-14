import sharp from 'sharp'
import path from 'path'
import process from 'process'

const SOURCE_ICON = 'public/app_icons/web/icon-512.png'
const OUTPUT_DIR = 'public/app_icons/web'

// Common sizes for iOS and Android splash screens
const SPLASH_SCREENS = [
  // iPhone SE, 4.7" iPhone
  { width: 750, height: 1334 },
  // 6.1" iPhone (iPhone 14, iPhone 13)
  { width: 1170, height: 2532 },
  // 6.7" iPhone
  { width: 1290, height: 2796 },
  // iPad Pro
  { width: 2048, height: 2732 }
]

async function generateSplashScreens() {
  try {
    // Create light version splash screens
    for (const size of SPLASH_SCREENS) {
      const outputFile = path.join(OUTPUT_DIR, `splash-${size.width}x${size.height}.png`)

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
                width: Math.floor(size.width * 0.4),
                height: Math.floor(size.width * 0.4),
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 0 }
              })
              .toBuffer(),
            gravity: 'center'
          }
        ])
        .png()
        .toFile(outputFile)

      console.log(`Generated ${outputFile}`)
    }

    // Create screenshots with proper background
    const screenshotSizes = [
      { name: 'narrow', width: 1170, height: 2532 },
      { name: 'wide', width: 2532, height: 1170 }
    ]

    for (const size of screenshotSizes) {
      const iconSize = Math.min(size.width, size.height) * 0.6

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
                background: { r: 255, g: 255, b: 255, alpha: 0 }
              })
              .toBuffer(),
            gravity: 'center'
          }
        ])
        .png()
        .toFile(path.join(OUTPUT_DIR, `screenshot-${size.name}.png`))

      console.log(`Generated screenshot-${size.name}.png`)
    }
  } catch (error) {
    console.error('Error generating splash screens:', error)
    process.exit(1)
  }
}

generateSplashScreens()
