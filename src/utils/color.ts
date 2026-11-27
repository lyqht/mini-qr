import { contrastRatio } from './contrast'

export function getRandomItemInArray<T>(array: T[], random: () => number = Math.random) {
  return array[Math.floor(random() * array.length)]
}

export interface RandomPalette {
  dots: string
  cornersSquare: string
  cornersDot: string
  background: string
}

type PaletteScheme = 'monochrome' | 'analogous' | 'complementary' | 'split-complementary'

const MIN_PALETTE_CONTRAST = 4.5

function hslToHex(h: number, s: number, l: number): string {
  const hue = ((h % 360) + 360) % 360
  const sat = s / 100
  const light = l / 100
  const a = sat * Math.min(light, 1 - light)
  const channel = (n: number) => {
    const k = (n + hue / 30) % 12
    const value = light - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
    return Math.round(value * 255)
      .toString(16)
      .padStart(2, '0')
  }
  return `#${channel(0)}${channel(8)}${channel(4)}`
}

function between(random: () => number, min: number, max: number): number {
  return min + random() * (max - min)
}

function readableInk(hue: number, saturation: number, lightness: number, background: string) {
  let l = lightness
  let color = hslToHex(hue, saturation, l)
  while (l > 5 && (contrastRatio(color, background) ?? 0) < MIN_PALETTE_CONTRAST) {
    l -= 2
    color = hslToHex(hue, saturation, l)
  }
  return color
}

export function createHarmoniousPalette(random: () => number = Math.random): RandomPalette {
  const baseHue = between(random, 0, 360)
  const scheme = getRandomItemInArray<PaletteScheme>(
    ['monochrome', 'analogous', 'complementary', 'split-complementary'],
    random
  )
  const accentHues: Record<PaletteScheme, [number, number]> = {
    monochrome: [baseHue, baseHue],
    analogous: [baseHue - 30, baseHue + 30],
    complementary: [baseHue + 180, baseHue + 180],
    'split-complementary': [baseHue + 150, baseHue + 210]
  }
  const [cornersSquareHue, cornersDotHue] = accentHues[scheme]

  const background = hslToHex(baseHue, between(random, 25, 60), between(random, 92, 97))
  const dots = readableInk(baseHue, between(random, 45, 75), between(random, 22, 34), background)
  const cornersSquare = readableInk(
    cornersSquareHue,
    between(random, 50, 80),
    scheme === 'monochrome' ? between(random, 14, 22) : between(random, 24, 36),
    background
  )
  const cornersDot = readableInk(
    cornersDotHue,
    between(random, 55, 85),
    between(random, 26, 38),
    background
  )

  return { dots, cornersSquare, cornersDot, background }
}
