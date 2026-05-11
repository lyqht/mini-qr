/**
 * Drop-in replacement for the `qr-code-styling` type surface used by mini-qr.
 *
 * Re-exported from `./index` as `Options`, `DotType`, etc., so existing import
 * sites can be migrated by changing the source path only. The shape is
 * intentionally identical to the upstream package so saved configs in
 * localStorage load unchanged.
 */

export type DotType = 'dots' | 'rounded' | 'classy' | 'classy-rounded' | 'square' | 'extra-rounded'
export type CornerDotType = 'dot' | 'square' | DotType
export type CornerSquareType = 'dot' | 'square' | 'extra-rounded' | DotType
export type FileExtension = 'svg' | 'png' | 'jpeg' | 'webp'
export type GradientType = 'radial' | 'linear'
export type DrawType = 'canvas' | 'svg'
export type ShapeType = 'square' | 'circle'

export type Gradient = {
  type: GradientType
  rotation?: number
  colorStops: { offset: number; color: string }[]
}

export type TypeNumber =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30
  | 31
  | 32
  | 33
  | 34
  | 35
  | 36
  | 37
  | 38
  | 39
  | 40

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'
export type Mode = 'Numeric' | 'Alphanumeric' | 'Byte' | 'Kanji'

export type Options = {
  type?: DrawType
  shape?: ShapeType
  width?: number
  height?: number
  margin?: number
  data?: string
  image?: string
  qrOptions?: {
    typeNumber?: TypeNumber
    mode?: Mode
    errorCorrectionLevel?: ErrorCorrectionLevel
  }
  imageOptions?: {
    saveAsBlob?: boolean
    hideBackgroundDots?: boolean
    imageSize?: number
    crossOrigin?: string
    margin?: number
  }
  dotsOptions?: {
    type?: DotType
    color?: string
    gradient?: Gradient
    roundSize?: boolean
  }
  cornersSquareOptions?: {
    type?: CornerSquareType
    color?: string
    gradient?: Gradient
  }
  cornersDotOptions?: {
    type?: CornerDotType
    color?: string
    gradient?: Gradient
  }
  backgroundOptions?: {
    round?: number
    color?: string
    gradient?: Gradient
  }
}
