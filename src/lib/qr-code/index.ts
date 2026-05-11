export { createQRCode } from './core'
export { renderQrFragment, wrapAsSvg } from './render/svg'
export { renderFramed } from './frame'
export { buildMatrix } from './matrix'
export { rasterizeSvg } from './render/canvas'
export { fromLegacyOptions } from './legacy-adapter'
export { buildSvgExportString } from './svg-export'
export type { SvgExportInput, LegacyFrameInput, LegacyFrameStyle } from './svg-export'

export type {
  BackgroundConfig,
  CornerDotShape,
  CornerDotsConfig,
  CornerSquareShape,
  CornerSquaresConfig,
  DotShape,
  DotsConfig,
  ECLevel,
  FrameConfig,
  ImageConfig,
  QRCodeConfig,
  QRCodeInstance,
  RasterOptions,
  ResolvedQRCodeConfig,
  TextPosition
} from './types'

// Legacy compatibility re-exports — drop-in for `qr-code-styling` types so
// existing import sites in the app change source path only.
export type {
  CornerDotType,
  CornerSquareType,
  DotType,
  DrawType,
  ErrorCorrectionLevel,
  FileExtension,
  Gradient,
  GradientType,
  Mode,
  Options,
  ShapeType,
  TypeNumber
} from './legacy-types'
