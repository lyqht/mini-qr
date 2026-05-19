export type DotShape = 'square' | 'rounded' | 'extra-rounded' | 'classy' | 'classy-rounded' | 'dots'
export type CornerSquareShape = 'square' | 'rounded' | 'extra-rounded' | 'dot'
export type CornerDotShape = 'square' | 'rounded' | 'dot'
export type ECLevel = 'L' | 'M' | 'Q' | 'H'
export type TextPosition = 'top' | 'bottom' | 'left' | 'right'

export type GradientType = 'linear' | 'radial'

export interface GradientColorStop {
  offset: number
  color: string
}

export interface GradientConfig {
  type: GradientType
  /** Rotation in radians, applied to linear gradients only. */
  rotation?: number
  colorStops: GradientColorStop[]
}

export interface DotsConfig {
  shape?: DotShape
  color?: string
  gradient?: GradientConfig
}

export interface CornerSquaresConfig {
  shape?: CornerSquareShape
  color?: string
  gradient?: GradientConfig
}

export interface CornerDotsConfig {
  shape?: CornerDotShape
  color?: string
  gradient?: GradientConfig
}

export interface BackgroundConfig {
  color?: string
  gradient?: GradientConfig
}

export interface ImageConfig {
  href: string
  sizeRatio?: number
  margin?: number
  hideBackgroundDots?: boolean
  crossOrigin?: 'anonymous' | 'use-credentials'
}

export interface FrameConfig {
  text: string
  textPosition: TextPosition
  textColor?: string
  backgroundColor?: string
  borderColor?: string
  borderWidth?: number
  borderRadius?: number
  padding?: number
  fontFamily?: string
  fontSize?: number
}

export interface QRCodeConfig {
  data: string
  size?: number
  margin?: number
  errorCorrectionLevel?: ECLevel
  dots?: DotsConfig
  cornerSquares?: CornerSquaresConfig
  cornerDots?: CornerDotsConfig
  background?: BackgroundConfig
  image?: ImageConfig
  frame?: FrameConfig
}

export interface RasterOptions {
  width?: number
  height?: number
  quality?: number
  background?: string
}

export interface QRCodeInstance {
  readonly svgElement: SVGSVGElement
  update(partial: Partial<QRCodeConfig>): void
  toSVGString(): string
  toPNGBlob(opts?: RasterOptions): Promise<Blob>
  toJPGBlob(opts?: RasterOptions): Promise<Blob>
  attachTo(el: HTMLElement): void
  dispose(): void
}

export interface ResolvedQRCodeConfig {
  data: string
  size: number
  margin: number
  errorCorrectionLevel: ECLevel
  dots: Required<Pick<DotsConfig, 'shape' | 'color'>> & { gradient?: GradientConfig }
  cornerSquares: Required<Pick<CornerSquaresConfig, 'shape' | 'color'>> & {
    gradient?: GradientConfig
  }
  cornerDots: Required<Pick<CornerDotsConfig, 'shape' | 'color'>> & { gradient?: GradientConfig }
  background: Required<Pick<BackgroundConfig, 'color'>> & { gradient?: GradientConfig }
  image?: ImageConfig
  frame?: FrameConfig
}

export const DEFAULT_CONFIG: Omit<ResolvedQRCodeConfig, 'data'> = {
  size: 200,
  margin: 0,
  errorCorrectionLevel: 'Q',
  dots: { shape: 'square', color: '#000000' },
  cornerSquares: { shape: 'square', color: '#000000' },
  cornerDots: { shape: 'square', color: '#000000' },
  background: { color: 'transparent' }
}
