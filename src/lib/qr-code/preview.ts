/**
 * The app's live preview draws the QR at a fixed size, and every frame value a
 * user edits (padding, border width/radius, caption width, QR corner radius)
 * is expressed in that preview's pixels. Exports scale those values by
 * `exportSize / PREVIEW_QR_SIZE` so they keep the preview's proportions.
 *
 * Used by QRCodeCreate.vue and QRCodeFrame.vue for the preview, and by
 * svg-export.ts for the export — change it here and all three stay in sync.
 */
export const PREVIEW_QR_SIZE = 200

/** Caption font size in the framed preview (set explicitly in QRCodeFrame.vue). */
export const PREVIEW_FRAME_FONT_SIZE = 18
