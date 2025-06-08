<script setup lang="ts">
import CopyImageModal from '@/components/CopyImageModal.vue'
import DataTemplatesModal from '@/components/DataTemplatesModal.vue'
import QRCodeFrame from '@/components/QRCodeFrame.vue'
import StyledQRCode from '@/components/StyledQRCode.vue'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import { Combobox } from '@/components/ui/Combobox'
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import VCardPreview from '@/components/VCardPreview.vue'
import { createRandomColor, getRandomItemInArray } from '@/utils/color'
import {
  copyImageToClipboard,
  downloadJpgElement,
  downloadPngElement,
  downloadSvgElement,
  getJpgElement,
  getPngElement,
  getSvgString,
  IS_COPY_IMAGE_TO_CLIPBOARD_SUPPORTED
} from '@/utils/convertToImage'
import { parseCSV, validateCSVData } from '@/utils/csv'
import { generateVCardData } from '@/utils/dataEncoding'
import { getNumericCSSValue } from '@/utils/formatting'
import { allQrCodePresets, defaultPreset, type Preset } from '@/utils/qrCodePresets'
import { allFramePresets, defaultFramePreset, type FramePreset } from '@/utils/framePresets'
import { useMediaQuery } from '@vueuse/core'
import JSZip from 'jszip'
import {
  type CornerDotType,
  type CornerSquareType,
  type DotType,
  type ErrorCorrectionLevel,
  type Options as StyledQRCodeProps
} from 'qr-code-styling'
import { computed, onMounted, ref, watch, nextTick } from 'vue'
import 'vue-i18n'
import { useI18n } from 'vue-i18n'

interface FrameStyle {
  textColor: string
  backgroundColor: string
  borderColor: string
  borderWidth: string
  borderRadius: string
  padding: string
}

const props = defineProps<{
  initialData?: string
}>()

const mainContentContainer = ref<HTMLElement | null>(null)
const isLarge = useMediaQuery('(min-width: 768px)')
const isLikelyMobileDevice = computed(() => {
  return typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0
})

//#region /** locale */
const { t } = useI18n()
//#endregion

//#region /* QR code style settings */
const data = ref(props.initialData || import.meta.env.VITE_DEFAULT_DATA_TO_ENCODE || '')
const debouncedData = ref(data.value)
let dataDebounceTimer: ReturnType<typeof setTimeout>

watch(
  data,
  (newVal) => {
    clearTimeout(dataDebounceTimer)
    dataDebounceTimer = setTimeout(() => {
      debouncedData.value = newVal
    }, 500)
  },
  { immediate: true }
)
const image = ref()
const width = ref()
const height = ref()
const margin = ref()
const imageMargin = ref()

watch(
  () => props.initialData,
  (newValue) => {
    if (newValue) {
      data.value = newValue
    }
  }
)

const dotsOptionsColor = ref()
const dotsOptionsType = ref()
const cornersSquareOptionsColor = ref()
const cornersSquareOptionsType = ref()
const cornersDotOptionsColor = ref()
const cornersDotOptionsType = ref()
const styleBorderRadius = ref()
const styledBorderRadiusFormatted = computed(() => `${styleBorderRadius.value}px`)
const styleBackground = ref(defaultPreset.style.background)
const lastBackground = ref(defaultPreset.style.background)
const includeBackground = ref(true)
watch(
  includeBackground,
  (newIncludeBackground) => {
    if (!newIncludeBackground) {
      lastBackground.value = styleBackground.value
      styleBackground.value = 'transparent'
    } else {
      styleBackground.value = lastBackground.value
    }
  },
  {
    immediate: true
  }
)

const dotsOptions = computed(() => ({
  color: dotsOptionsColor.value,
  type: dotsOptionsType.value
}))
const cornersSquareOptions = computed(() => ({
  color: cornersSquareOptionsColor.value,
  type: cornersSquareOptionsType.value
}))
const cornersDotOptions = computed(() => ({
  color: cornersDotOptionsColor.value,
  type: cornersDotOptionsType.value
}))
const style = computed(() => ({
  borderRadius: styledBorderRadiusFormatted.value,
  background: styleBackground.value
}))
const imageOptions = computed(() => ({
  margin: imageMargin.value
}))
const qrOptions = computed(() => ({
  errorCorrectionLevel: errorCorrectionLevel.value
}))

const qrCodeProps = computed<StyledQRCodeProps>(() => ({
  data: debouncedData.value || 'Have a beautiful day!',
  image: image.value,
  width: width.value,
  height: height.value,
  margin: margin.value,
  dotsOptions: dotsOptions.value,
  cornersSquareOptions: cornersSquareOptions.value,
  cornersDotOptions: cornersDotOptions.value,
  imageOptions: imageOptions.value,
  qrOptions: qrOptions.value
}))

function randomizeStyleSettings() {
  const dotTypes: DotType[] = [
    'dots',
    'rounded',
    'classy',
    'classy-rounded',
    'square',
    'extra-rounded'
  ]
  const cornerSquareTypes: CornerSquareType[] = ['dot', 'square', 'extra-rounded']
  const cornerDotTypes: CornerDotType[] = ['dot', 'square']

  dotsOptionsType.value = getRandomItemInArray(dotTypes)
  dotsOptionsColor.value = createRandomColor()

  cornersSquareOptionsType.value = getRandomItemInArray(cornerSquareTypes)
  cornersSquareOptionsColor.value = createRandomColor()

  cornersDotOptionsType.value = getRandomItemInArray(cornerDotTypes)
  cornersDotOptionsColor.value = createRandomColor()

  styleBackground.value = createRandomColor()
}

function uploadImage() {
  console.debug('Uploading image')
  const imageInput = document.createElement('input')
  imageInput.type = 'file'
  imageInput.accept = 'image/*'
  imageInput.onchange = (event: Event) => {
    const target = event.target as HTMLInputElement
    if (target.files) {
      const file = target.files[0]
      const reader = new FileReader()
      reader.onload = (event: ProgressEvent<FileReader>) => {
        const target = event.target as FileReader
        const result = target.result as string
        image.value = result
      }
      reader.readAsDataURL(file)
    }
  }
  imageInput.click()
}
// #endregion

// #region /* Preset settings */
const isPresetSelectOpen = ref(false)
const allPresetOptions = computed(() => {
  const options = lastCustomLoadedPreset.value
    ? [lastCustomLoadedPreset.value, ...allQrCodePresets]
    : allQrCodePresets
  return options.map((preset) => ({ value: preset.name, label: t(preset.name) }))
})
const selectedPreset = ref<
  Preset & { key?: string; qrOptions?: { errorCorrectionLevel: ErrorCorrectionLevel } }
>(defaultPreset)
watch(selectedPreset, () => {
  // Only update data from preset if there's no initialData or if data is empty
  if (!props.initialData || data.value === '') {
    data.value = selectedPreset.value.data
  }

  image.value = selectedPreset.value.image
  width.value = selectedPreset.value.width
  height.value = selectedPreset.value.height
  margin.value = selectedPreset.value.margin
  imageMargin.value = selectedPreset.value.imageOptions.margin
  dotsOptionsColor.value = selectedPreset.value.dotsOptions.color
  dotsOptionsType.value = selectedPreset.value.dotsOptions.type
  cornersSquareOptionsColor.value = selectedPreset.value.cornersSquareOptions.color
  cornersSquareOptionsType.value = selectedPreset.value.cornersSquareOptions.type
  cornersDotOptionsColor.value = selectedPreset.value.cornersDotOptions.color
  cornersDotOptionsType.value = selectedPreset.value.cornersDotOptions.type
  styleBorderRadius.value = getNumericCSSValue(selectedPreset.value.style.borderRadius as string)
  styleBackground.value = selectedPreset.value.style.background
  includeBackground.value = selectedPreset.value.style.background !== 'transparent'
  errorCorrectionLevel.value =
    selectedPreset.value.qrOptions && selectedPreset.value.qrOptions.errorCorrectionLevel
      ? selectedPreset.value.qrOptions.errorCorrectionLevel
      : 'Q'
  // Most presets don't have a frame, so we set it to false by default
})

const LAST_LOADED_LOCALLY_PRESET_KEY = 'Last saved locally'
const LOADED_FROM_FILE_PRESET_KEY = 'Loaded from file'
const CUSTOM_LOADED_PRESET_KEYS = [LAST_LOADED_LOCALLY_PRESET_KEY, LOADED_FROM_FILE_PRESET_KEY]
const selectedPresetKey = ref<string>(
  import.meta.env.VITE_DISABLE_LOCAL_STORAGE === 'true'
    ? defaultPreset.name
    : localStorage.getItem('qrCodeConfig')
      ? LAST_LOADED_LOCALLY_PRESET_KEY
      : defaultPreset.name
)
const lastCustomLoadedPreset = ref<Preset>()
watch(
  selectedPresetKey,
  (newKey, prevKey) => {
    if (newKey === prevKey || !newKey) return

    if (
      import.meta.env.VITE_DISABLE_LOCAL_STORAGE !== 'true' &&
      CUSTOM_LOADED_PRESET_KEYS.includes(newKey) &&
      lastCustomLoadedPreset.value
    ) {
      selectedPreset.value = lastCustomLoadedPreset.value
      return
    }

    const updatedPreset = allQrCodePresets.find((preset) => preset.name === newKey)
    if (updatedPreset) {
      selectedPreset.value = updatedPreset
    }
  },
  { immediate: true }
)
//#endregion

//#region /* Error correction level */
const errorCorrectionLevels: ErrorCorrectionLevel[] = ['L', 'M', 'Q', 'H']
const errorCorrectionLevel = ref<ErrorCorrectionLevel>('Q')
const ERROR_CORRECTION_LEVEL_LABELS: Record<ErrorCorrectionLevel, string> = {
  L: `Low (7%)`,
  M: `Medium (15%)`,
  Q: `High (25%)`,
  H: `Highest (30%)`
}
const recommendedErrorCorrectionLevel = computed<ErrorCorrectionLevel | null>(() => {
  if (!data.value) return null
  if (data.value.length <= 50) {
    return 'H'
  } else if (data.value.length <= 150) {
    return 'Q'
  } else if (data.value.length <= 500) {
    return 'M'
  } else {
    return 'L'
  }
})
//#endregion

//#region /* Frame settings */
const DEFAULT_FRAME_TEXT = 'Scan for more info'
const frameText = ref(DEFAULT_FRAME_TEXT)
const frameTextPosition = ref<'top' | 'bottom' | 'left' | 'right'>('bottom')
const showFrame = ref(false)
const frameStyle = ref<FrameStyle>({
  textColor: '#000000',
  backgroundColor: '#ffffff',
  borderColor: '#000000',
  borderWidth: '1px',
  borderRadius: '8px',
  padding: '16px'
})
const selectedFramePresetKey = ref<string>(defaultFramePreset.name)
const lastCustomLoadedFramePreset = ref<FramePreset>()
const CUSTOM_LOADED_FRAME_PRESET_KEYS = [
  LAST_LOADED_LOCALLY_PRESET_KEY,
  LOADED_FROM_FILE_PRESET_KEY
]
const allFramePresetOptions = computed(() => {
  const options = lastCustomLoadedFramePreset.value
    ? [lastCustomLoadedFramePreset.value, ...allFramePresets]
    : allFramePresets
  return options.map((preset) => ({ value: preset.name, label: t(preset.name) }))
})
function applyFramePreset(preset: FramePreset) {
  if (preset.style) {
    frameStyle.value = { ...frameStyle.value, ...preset.style }
  }
  if (preset.text) frameText.value = preset.text
  if (preset.position) frameTextPosition.value = preset.position
  showFrame.value = true
}
watch(
  selectedFramePresetKey,
  (newKey, prevKey) => {
    if (newKey === prevKey || !newKey) return

    if (
      import.meta.env.VITE_DISABLE_LOCAL_STORAGE !== 'true' &&
      CUSTOM_LOADED_FRAME_PRESET_KEYS.includes(newKey) &&
      lastCustomLoadedFramePreset.value
    ) {
      applyFramePreset(lastCustomLoadedFramePreset.value)
      return
    }

    const preset = allFramePresets.find((p) => p.name === newKey)
    if (preset) {
      applyFramePreset(preset)
    }
  },
  { immediate: true }
)
const frameSettings = computed(() => ({
  text: frameText.value,
  position: frameTextPosition.value,
  style: frameStyle.value
}))
//#endregion

//#region /* General Export - download qr code and copy to clipboard */
const isExportButtonDisabled = computed(() => {
  if (exportMode.value === ExportMode.Single) {
    return !data.value
  }
  return dataStringsFromCsv.value.length === 0
})

const PREVIEW_QRCODE_DIM_UNIT = 200

/**
 * Calculates the dimensions for QR code export
 * When frame is enabled (showFrame = true), dimensions are calculated from the actual rendered element
 * to include the frame's size. Otherwise, uses the configured width and height values.
 */
function getExportDimensions() {
  if (!showFrame.value) {
    return {
      width: width.value,
      height: height.value
    }
  }
  const el = document.getElementById('element-to-export')
  if (!el) {
    return {
      width: width.value,
      height: height.value
    }
  }

  // Calculate the scale factor based on the preview size
  const scaleFactor = width.value / PREVIEW_QRCODE_DIM_UNIT

  const elWidth = el.offsetWidth
  const elHeight = el.offsetHeight

  // Get the actual dimensions including the frame and apply the scale factor
  return {
    width: elWidth * scaleFactor,
    height: elHeight * scaleFactor
  }
}

// #region Copy image modal (Safari fallback)
const showSafariCopyImageModal = ref(false)
const copyModalIsLoading = ref(false)
const copyModalImageSrc = ref<string | null>(null)

async function openCopyModal() {
  const el = document.getElementById('element-to-export')
  if (!el) return
  copyModalIsLoading.value = true
  try {
    copyModalImageSrc.value = await getPngElement(
      el,
      getExportDimensions(),
      styledBorderRadiusFormatted.value
    )
    showSafariCopyImageModal.value = true
  } catch (error) {
    console.error('Error preparing image for copy modal:', error)
  } finally {
    copyModalIsLoading.value = false
  }
}

function closeCopyModal() {
  showSafariCopyImageModal.value = false
  copyModalImageSrc.value = null
}
// #endregion

function copyQRToClipboard() {
  const el = document.getElementById('element-to-export')
  if (!el) {
    return
  }
  if (IS_COPY_IMAGE_TO_CLIPBOARD_SUPPORTED) {
    copyImageToClipboard(el, getExportDimensions(), styledBorderRadiusFormatted.value)
  } else if (!isLikelyMobileDevice.value) {
    // for now we only open the copy image modal on safari desktop because
    // this modal will be hidden behind the export image modal on mobile viewport.
    openCopyModal()
  }
}

/**
 * Downloads QR code in specified format, handling both single and batch exports
 * @param format The format to download: 'png', 'svg', or 'jpg'
 */
function downloadQRImage(format: 'png' | 'svg' | 'jpg') {
  if (exportMode.value === ExportMode.Single) {
    const formatConfig = {
      png: { fn: downloadPngElement, filename: 'qr-code.png' },
      svg: { fn: downloadSvgElement, filename: 'qr-code.svg' },
      jpg: { fn: downloadJpgElement, filename: 'qr-code.jpg', extraOptions: { bgcolor: 'white' } }
    }[format]

    const el = document.getElementById('element-to-export')
    if (!el) {
      return
    }

    formatConfig.fn(
      el,
      formatConfig.filename,
      { ...getExportDimensions(), ...formatConfig.extraOptions },
      styledBorderRadiusFormatted.value
    )
  } else {
    generateBatchQRCodes(format)
  }
}
//#endregion

//#region /* QR Config Utils - Saving, Loading and Downloading */
interface QRCodeConfig {
  props: StyledQRCodeProps & {
    name?: string
  }
  style: {
    borderRadius: string
    background?: string
  }
  frame?: {
    text: string
    position: 'top' | 'bottom' | 'left' | 'right'
    style: FrameStyle
  } | null
}

function createQrConfig(): QRCodeConfig {
  return {
    props: qrCodeProps.value,
    style: style.value,
    frame: showFrame.value ? frameSettings.value : null
  }
}

function downloadQRConfig() {
  console.debug('Downloading QR code config')
  const qrCodeConfig = createQrConfig()
  const qrCodeConfigString = JSON.stringify(qrCodeConfig)
  const qrCodeConfigBlob = new Blob([qrCodeConfigString], { type: 'application/json' })
  const qrCodeConfigUrl = URL.createObjectURL(qrCodeConfigBlob)
  const qrCodeConfigLink = document.createElement('a')
  qrCodeConfigLink.href = qrCodeConfigUrl
  qrCodeConfigLink.download = 'qr-code-config.json'
  qrCodeConfigLink.click()
}

function saveQRConfigToLocalStorage() {
  const qrCodeConfig = createQrConfig()
  const qrCodeConfigString = JSON.stringify(qrCodeConfig)
  localStorage.setItem('qrCodeConfig', qrCodeConfigString)
}

function loadQRConfig(jsonString: string, key?: string) {
  const qrCodeConfig = JSON.parse(jsonString) as QRCodeConfig
  const qrCodeProps = qrCodeConfig.props
  const qrCodeStyle = qrCodeConfig.style
  const frameConfig = qrCodeConfig.frame

  const preset = {
    ...qrCodeProps,
    style: qrCodeStyle
  } as Preset

  if (key) {
    preset.name = key
    lastCustomLoadedPreset.value = preset
    selectedPresetKey.value = key
  }

  let framePreset: FramePreset | undefined

  selectedPreset.value = preset

  if (frameConfig) {
    showFrame.value = true
    frameText.value = frameConfig.text || DEFAULT_FRAME_TEXT
    frameTextPosition.value = frameConfig.position || 'bottom'
    frameStyle.value = {
      ...frameStyle.value,
      ...frameConfig.style
    }
    framePreset = {
      name: key || LAST_LOADED_LOCALLY_PRESET_KEY,
      style: frameConfig.style,
      text: frameConfig.text,
      position: frameConfig.position
    }
  }

  if (framePreset && key) {
    lastCustomLoadedFramePreset.value = framePreset
    selectedFramePresetKey.value = key
  }
}

function loadQrConfigFromFile() {
  console.debug('Loading QR code config')
  const qrCodeConfigInput = document.createElement('input')
  qrCodeConfigInput.type = 'file'
  qrCodeConfigInput.accept = 'application/json'
  qrCodeConfigInput.onchange = (event: Event) => {
    const target = event.target as HTMLInputElement
    if (target.files) {
      const file = target.files[0]
      const reader = new FileReader()
      reader.onload = (event: ProgressEvent<FileReader>) => {
        const target = event.target as FileReader
        const result = target.result as string
        loadQRConfig(result, LOADED_FROM_FILE_PRESET_KEY)
      }
      reader.readAsText(file)
    }
  }
  qrCodeConfigInput.click()
}

function loadQRConfigFromLocalStorage() {
  const qrCodeConfigString = localStorage.getItem('qrCodeConfig')
  if (qrCodeConfigString) {
    console.debug('Loading QR code config from local storage')
    loadQRConfig(qrCodeConfigString, LAST_LOADED_LOCALLY_PRESET_KEY)
  } else {
    selectedPreset.value = { ...defaultPreset }
  }
}

watch(
  [qrCodeProps, style, showFrame, frameSettings],
  () => {
    saveQRConfigToLocalStorage()
  },
  {
    deep: true
  }
)

onMounted(() => {
  if (import.meta.env.VITE_DISABLE_LOCAL_STORAGE !== 'true') {
    const qrCodeConfigString = localStorage.getItem('qrCodeConfig')
    if (qrCodeConfigString) {
      loadQRConfig(qrCodeConfigString, LAST_LOADED_LOCALLY_PRESET_KEY)
    } else {
      // No localStorage data found, use the environment variable default preset
      selectedPreset.value = { ...defaultPreset }
      selectedPresetKey.value = defaultPreset.name
    }
    // No separate frameConfig loading from localStorage noted,
    // assuming selectedFramePresetKey watcher handles it if lastCustomLoadedFramePreset was populated by loadQRConfig
  }

  // Set initial data if provided through props
  if (props.initialData) {
    data.value = props.initialData
  }
})
//#endregion

//#region /* Batch QR Code Generation */
enum ExportMode {
  Single = 'single',
  Batch = 'batch'
}

const exportMode = ref(ExportMode.Single)
const dataStringsFromCsv = ref<string[]>([])
const frameTextsFromCsv = ref<string[]>([])

const inputFileForBatchEncoding = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const isValidCsv = ref(true)

const isExportingBatchQRs = ref(false)
const isBatchExportSuccess = ref(false)
const currentExportedQrCodeIndex = ref<number | null>(null)

const parsedCsvResult = ref<{ data: any[] } | null>(null)
const previewRowIndex = ref(0)
const previewRow = computed(() => {
  const idx = previewRowIndex.value
  if (dataStringsFromCsv.value.length === 0) return null
  if (idx < 0 || idx >= dataStringsFromCsv.value.length) return null
  if (
    parsedCsvResult.value &&
    parsedCsvResult.value.data &&
    parsedCsvResult.value.data.length > idx
  ) {
    return parsedCsvResult.value.data[idx]
  }
  return null
})

const resetBatchExportProgress = () => {
  isExportingBatchQRs.value = false
  currentExportedQrCodeIndex.value = null
  usedFilenames.clear()
}

const resetData = () => {
  data.value = ''
  inputFileForBatchEncoding.value = null
  dataStringsFromCsv.value = []
  frameTextsFromCsv.value = []
  isValidCsv.value = true
  resetBatchExportProgress()
  isBatchExportSuccess.value = false
}

watch(exportMode, () => {
  resetData()
})

const getFileFromInputEvent = (event: InputEvent) => {
  const inputElement = event.target as HTMLInputElement
  if (inputElement.files && inputElement.files.length > 0) {
    return inputElement.files[0]
  }
  return null
}

const onBatchInputFileUpload = (event: Event) => {
  isBatchExportSuccess.value = false
  let file: File | null = getFileFromInputEvent(event as InputEvent)

  // If it is not input event, then it might be a drag and drop event
  if (file == null) {
    const dt = (event as DragEvent).dataTransfer
    if (!dt || !dt.files || dt.files.length === 0) {
      return
    }
    file = dt.files[0]
  }

  inputFileForBatchEncoding.value = file
  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result
    if (typeof content !== 'string') {
      isValidCsv.value = false
      return
    }

    const result = parseCSV(content)
    parsedCsvResult.value = result
    if (!result.isValid) {
      isValidCsv.value = false
      return
    }

    if (!validateCSVData(result.data)) {
      isValidCsv.value = false
      return
    }

    const urls: string[] = []
    const frameTexts: string[] = []

    result.data.forEach((row) => {
      const isVCard = 'firstName' in row
      if (isVCard) {
        // Handle vCard data
        const vCardString = generateVCardData({
          firstName: row.firstName,
          lastName: row.lastName,
          org: row.org,
          position: row.position,
          phoneWork: row.phonework,
          phonePrivate: row.phoneprivate,
          phoneMobile: row.phonemobile,
          email: row.email,
          website: row.website,
          street: row.street,
          zipcode: row.zipcode,
          city: row.city,
          state: row.state,
          country: row.country,
          version: row.version
        })
        urls.push(vCardString)
      } else {
        // Handle simple URL/text data
        urls.push(row.url)
      }

      if (row.frameText) {
        frameTexts.push(row.frameText)
      }
    })

    // If any non-default frame text is detected, enable frame settings
    const hasCustomFrameText = frameTexts.length > 0
    showFrame.value = hasCustomFrameText

    dataStringsFromCsv.value = urls
    frameTextsFromCsv.value = frameTexts
    isValidCsv.value = true
    previewRowIndex.value = 0 // Reset preview to first row on new upload
  }

  reader.readAsText(file)
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const usedFilenames = new Set() // zip folders cannot have duplicate filenames, otherwise they override each other
const createZipFile = (
  zip: typeof JSZip,
  dataUrl: string,
  index: number,
  format: 'png' | 'svg' | 'jpg'
) => {
  const dataString = dataStringsFromCsv.value[index]
  const frameText = frameTextsFromCsv.value[index]
  let fileName = ''

  // If frame text is provided, use it as the filename
  if (frameText) {
    fileName = frameText
  } else {
    // For vCard data, use firstName_lastName
    if (dataString.startsWith('BEGIN:VCARD')) {
      const match = dataString.match(/FN:([^\r\n]+)/)
      if (match) {
        const fullName = match[1].trim()
        fileName = fullName.replace(/\s+/g, '_')
      }
    } else {
      // For simple URL/text, use the data string
      if (dataString.startsWith('http')) {
        const pathSegments = dataString.split('/')
        const lastPathSegment = pathSegments[pathSegments.length - 1]
        // Check if lastPathSegment is only alphanumeric or underscores
        const isValidFileName = /^[a-zA-Z0-9_]+$/.test(lastPathSegment)
        fileName = isValidFileName
          ? lastPathSegment
          : pathSegments[pathSegments.length - 2] || `qr_code_${index}`
      } else {
        fileName = dataString.trim()
      }
    }
  }

  // Sanitize filename to remove invalid characters
  fileName = fileName.replace(/[^a-zA-Z0-9_-]/g, '_')

  // Ensure unique filenames
  if (usedFilenames.has(fileName)) {
    fileName = `${fileName}-${index}`
  }

  usedFilenames.add(fileName)

  if (format === 'png' || format === 'jpg') {
    zip.file(`${fileName}.${format}`, dataUrl.split(',')[1], { base64: true })
  } else {
    // For SVG, we don't need to split and use base64
    zip.file(`${fileName}.${format}`, dataUrl)
  }
}
async function generateBatchQRCodes(format: 'png' | 'svg' | 'jpg') {
  isExportingBatchQRs.value = true
  const zip = new JSZip()
  let numQrCodesCreated = 0
  const el = document.getElementById('element-to-export')
  if (!el) {
    return
  }

  try {
    for (let index = 0; index < dataStringsFromCsv.value.length; index++) {
      currentExportedQrCodeIndex.value = index
      const url = dataStringsFromCsv.value[index]
      const currentFrameText = frameTextsFromCsv.value[index]
      data.value = url
      frameText.value = currentFrameText
      await sleep(1000)
      let dataUrl: string = ''
      if (format === 'png') {
        dataUrl = await getPngElement(el, getExportDimensions(), styledBorderRadiusFormatted.value)
      } else if (format === 'jpg') {
        dataUrl = await getJpgElement(el, getExportDimensions(), styledBorderRadiusFormatted.value)
      } else {
        dataUrl = await getSvgString(el, getExportDimensions(), styledBorderRadiusFormatted.value)
      }
      createZipFile(zip, dataUrl, index, format)
      numQrCodesCreated++
    }

    while (numQrCodesCreated !== dataStringsFromCsv.value.length) {
      await sleep(100)
    }

    zip.generateAsync({ type: 'blob' }).then((content) => {
      const link = document.createElement('a')
      link.href = URL.createObjectURL(content)
      link.download = `qr-codes.zip`
      link.click()
      isBatchExportSuccess.value = true
    })
  } catch (error) {
    console.error('Error generating batch QR codes', error)
    isBatchExportSuccess.value = false
  } finally {
    resetBatchExportProgress()
  }
}
// #endregion

//#region /* Data modal */
const isDataModalVisible = ref(false)
const openDataModal = () => {
  isDataModalVisible.value = true
}

const closeDataModal = () => {
  isDataModalVisible.value = false
}

const updateDataFromModal = (newData: string) => {
  data.value = newData
  // Optionally trigger QR code regeneration here if needed
}
// #endregion

//#region /* Dynamic padding for mobile drawer */
const drawerTriggerHeight = ref(0)
const BUFFER_PADDING = 20 // Extra space below the drawer trigger

function updateDrawerTriggerHeight() {
  nextTick(() => {
    const el = document.getElementById('drawer-preview-container')
    if (el) {
      drawerTriggerHeight.value = el.offsetHeight
    } else {
      drawerTriggerHeight.value = 0 // Fallback if element not found
    }
  })
}

watch(
  isLarge,
  (newIsLarge) => {
    if (!newIsLarge) {
      updateDrawerTriggerHeight() // Drawer is now visible
    } else {
      drawerTriggerHeight.value = 0 // Drawer is hidden, reset padding effect
    }
  },
  { immediate: true } // Run on initial load
)

// Watch for changes that might affect the drawer trigger's height
watch(showFrame, () => {
  if (!isLarge.value) {
    updateDrawerTriggerHeight()
  }
})

const mainDivPaddingStyle = computed(() => {
  if (!isLarge.value && drawerTriggerHeight.value > 0) {
    return { paddingBottom: `${drawerTriggerHeight.value + BUFFER_PADDING}px` }
  }
  return { paddingBottom: '0px' } // Default for large screens or if height is 0
})
//#endregion
</script>

<template>
  <div
    class="flex items-start justify-center gap-4 md:flex-row md:gap-6 lg:gap-12 lg:pb-0"
    :style="mainDivPaddingStyle"
  >
    <!-- Sticky sidebar on large screens -->
    <div
      v-if="isLarge"
      ref="mainContentContainer"
      id="main-content-container"
      class="sticky top-0 flex w-full shrink-0 flex-col items-center justify-center p-4 md:w-fit"
    ></div>
    <!-- Bottom sheet on small screens -->
    <Drawer v-else>
      <DrawerTrigger
        id="drawer-preview-container"
        class="fixed inset-x-0 bottom-0 z-10 rounded-t-lg border-t border-solid border-slate-300 bg-white shadow-2xl outline-none focus-visible:ring-1 focus-visible:ring-zinc-700 dark:bg-black dark:focus-visible:ring-zinc-200"
      >
        <div class="flex flex-col items-center">
          <!-- Handle indicator for bottom sheet -->
          <div class="mt-2 h-1 w-16 rounded-full bg-gray-300 dark:bg-gray-700"></div>
          <div :class="['w-full', '-my-8']">
            <div class="flex origin-center scale-[0.7] items-center justify-center md:scale-100">
              <QRCodeFrame
                v-if="showFrame"
                :frame-text="frameText"
                :text-position="frameTextPosition"
                :frame-style="frameStyle"
              >
                <template #qr-code>
                  <div id="qr-code-container" class="grid place-items-center">
                    <div
                      class="grid place-items-center overflow-hidden"
                      :style="[
                        style,
                        {
                          width: `${PREVIEW_QRCODE_DIM_UNIT}px`,
                          height: `${PREVIEW_QRCODE_DIM_UNIT}px`
                        }
                      ]"
                    >
                      <StyledQRCode
                        v-bind="{
                          ...qrCodeProps,
                          data: data?.length > 0 ? data : t('Have nice day!'),
                          width: PREVIEW_QRCODE_DIM_UNIT,
                          height: PREVIEW_QRCODE_DIM_UNIT
                        }"
                        role="img"
                        aria-label="QR code"
                      />
                    </div>
                  </div>
                </template>
              </QRCodeFrame>
              <template v-else>
                <div class="grid place-items-center">
                  <div
                    class="grid place-items-center overflow-hidden"
                    :style="[
                      style,
                      {
                        width: `${PREVIEW_QRCODE_DIM_UNIT}px`,
                        height: `${PREVIEW_QRCODE_DIM_UNIT}px`
                      }
                    ]"
                  >
                    <StyledQRCode
                      v-bind="{
                        ...qrCodeProps,
                        data: data?.length > 0 ? data : t('Have nice day!'),
                        width: PREVIEW_QRCODE_DIM_UNIT,
                        height: PREVIEW_QRCODE_DIM_UNIT
                      }"
                      role="img"
                      aria-label="QR code preview"
                    />
                  </div>
                </div>
              </template>
            </div>
          </div>
          <div
            class="flex items-center gap-1 py-2 text-center text-sm text-gray-600 dark:text-gray-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              class="inline"
            >
              <path fill="currentColor" d="M12 8l-6 6l1.41 1.41L12 10.83l4.59 4.58L18 14z" />
            </svg>
            {{ t('Export') }}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              class="inline"
            >
              <path fill="currentColor" d="M12 8l-6 6l1.41 1.41L12 10.83l4.59 4.58L18 14z" />
            </svg>
          </div>
        </div>
      </DrawerTrigger>
      <DrawerContent class="flex h-screen flex-col items-center justify-between">
        <div class="flex grow flex-col items-center justify-center gap-4">
          <DrawerTitle>{{ t('Export') }}</DrawerTitle>
          <div ref="mainContentContainer" id="main-content-container" class="w-full"></div>
        </div>
      </DrawerContent>
    </Drawer>

    <!-- Main content -->
    <Teleport to="#main-content-container" v-if="mainContentContainer != null">
      <div id="main-content">
        <div
          id="qr-code-container"
          :class="[
            'grid origin-center place-items-center',
            showFrame && ['left', 'right'].includes(frameTextPosition) && 'scale-[0.7] md:scale-100'
          ]"
        >
          <div v-if="showFrame" id="element-to-export">
            <QRCodeFrame
              :frame-text="frameText"
              :text-position="frameTextPosition"
              :frame-style="frameStyle"
            >
              <template #qr-code>
                <div id="qr-code-container" class="grid place-items-center">
                  <div
                    class="grid place-items-center overflow-hidden"
                    :style="[
                      style,
                      {
                        width: `${PREVIEW_QRCODE_DIM_UNIT}px`,
                        height: `${PREVIEW_QRCODE_DIM_UNIT}px`
                      }
                    ]"
                  >
                    <StyledQRCode
                      v-bind="{
                        ...qrCodeProps,
                        data: data?.length > 0 ? data : t('Have nice day!'),
                        width: PREVIEW_QRCODE_DIM_UNIT,
                        height: PREVIEW_QRCODE_DIM_UNIT
                      }"
                      role="img"
                      aria-label="QR code"
                    />
                  </div>
                </div>
              </template>
            </QRCodeFrame>
          </div>
          <div
            v-else
            id="element-to-export"
            class="grid place-items-center overflow-hidden"
            :style="[
              style,
              {
                width: `${PREVIEW_QRCODE_DIM_UNIT}px`,
                height: `${PREVIEW_QRCODE_DIM_UNIT}px`
              }
            ]"
          >
            <StyledQRCode
              v-bind="{
                ...qrCodeProps,
                data: data?.length > 0 ? data : t('Have nice day!'),
                width: PREVIEW_QRCODE_DIM_UNIT,
                height: PREVIEW_QRCODE_DIM_UNIT
              }"
              role="img"
              aria-label="QR code"
            />
          </div>
        </div>
        <div class="mt-4 flex flex-col items-center gap-8">
          <div class="flex flex-col items-center justify-center gap-3">
            <button
              v-if="exportMode !== ExportMode.Batch"
              id="copy-qr-image-button"
              class="button flex w-fit max-w-full flex-row items-center gap-1"
              @click="copyQRToClipboard"
              :disabled="isExportButtonDisabled"
              :title="
                isExportButtonDisabled
                  ? t('Please enter data to encode first')
                  : t('Copy QR Code to clipboard')
              "
              :aria-label="t('Copy QR Code to clipboard')"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <g
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                >
                  <path d="M8 10a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2z" />
                  <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
                </g>
              </svg>
              <p>{{ t('Copy QR Code to clipboard') }}</p>
            </button>
            <button
              id="save-qr-code-config-button"
              class="button flex w-fit max-w-full flex-row items-center gap-1"
              @click="downloadQRConfig"
              :title="t('Save QR Code configuration')"
              :aria-label="t('Save QR Code configuration')"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <g
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                >
                  <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                  <path
                    d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2zm-5-4v-6"
                  />
                  <path d="M9.5 13.5L12 11l2.5 2.5" />
                </g>
              </svg>
              <p>{{ t('Save QR Code configuration') }}</p>
            </button>
            <button
              id="load-qr-code-config-button"
              class="button flex w-fit max-w-full flex-row items-center gap-1"
              @click="loadQrConfigFromFile"
              :aria-label="t('Load QR Code configuration')"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <g
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                >
                  <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                  <path
                    d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2zm-5-10v6"
                  />
                  <path d="M9.5 13.5L12 11l2.5 2.5" />
                </g>
              </svg>
              <p>{{ t('Load QR Code configuration') }}</p>
            </button>
          </div>
          <div id="export-options" class="grid place-items-center gap-4">
            <p class="text-zinc-900 dark:text-zinc-100">{{ t('Export as') }}</p>
            <div class="flex flex-row items-center justify-center gap-2">
              <button
                id="download-qr-image-button-png"
                class="button"
                @click="() => downloadQRImage('png')"
                :disabled="isExportButtonDisabled"
                :title="
                  isExportButtonDisabled
                    ? t('Please enter data to encode first')
                    : t('Download QR Code as PNG')
                "
                :aria-label="t('Download QR Code as PNG')"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <g fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                    <path d="M5 12V5a2 2 0 0 1 2-2h7l5 5v4" />
                    <text
                      x="1"
                      y="22"
                      fill="currentColor"
                      stroke="none"
                      font-size="11px"
                      font-family="monospace"
                      font-weight="600"
                    >
                      PNG
                    </text>
                  </g>
                </svg>
              </button>
              <button
                id="download-qr-image-button-jpg"
                class="button"
                @click="() => downloadQRImage('jpg')"
                :disabled="isExportButtonDisabled"
                :title="
                  isExportButtonDisabled
                    ? t('Please enter data to encode first')
                    : t('Download QR Code as JPG')
                "
                :aria-label="t('Download QR Code as JPG')"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <g fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                    <path d="M5 12V5a2 2 0 0 1 2-2h7l5 5v4" />
                    <text
                      x="1"
                      y="22"
                      fill="currentColor"
                      stroke="none"
                      font-size="11px"
                      font-family="monospace"
                      font-weight="600"
                    >
                      JPG
                    </text>
                  </g>
                </svg>
              </button>
              <button
                id="download-qr-image-button-svg"
                class="button"
                @click="() => downloadQRImage('svg')"
                :disabled="isExportButtonDisabled"
                :title="
                  isExportButtonDisabled
                    ? t('Please enter data to encode first')
                    : t('Download QR Code as SVG')
                "
                :aria-label="t('Download QR Code as SVG')"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <g fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                    <path d="M5 12V5a2 2 0 0 1 2-2h7l5 5v4" />
                    <text
                      x="1"
                      y="22"
                      fill="currentColor"
                      stroke="none"
                      font-size="11px"
                      font-family="monospace"
                      font-weight="600"
                    >
                      SVG
                    </text>
                  </g>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <div id="settings" class="flex w-full grow flex-col items-start gap-8 text-start">
      <Accordion
        type="multiple"
        collapsible
        class="flex w-full flex-col gap-4"
        :default-value="['qr-code-settings']"
      >
        <AccordionItem value="frame-settings">
          <AccordionTrigger
            class="button !px-4 text-2xl text-gray-700 outline-none dark:text-gray-100 md:!px-6 lg:!px-8"
            ><span class="flex flex-row items-center gap-2"
              ><span id="frame-settings-title">{{ t('Frame settings') }}</span>
              <span
                class="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200"
              >
                {{ t('New!') }}
              </span></span
            ></AccordionTrigger
          >
          <AccordionContent class="px-2 pb-8 pt-4">
            <section class="space-y-4" aria-labelledby="frame-settings-title">
              <div class="flex flex-row items-center gap-2">
                <label for="show-frame">{{ t('Add frame') }}</label>
                <input id="show-frame" type="checkbox" v-model="showFrame" />
              </div>

              <template v-if="showFrame">
                <div class="flex flex-col sm:flex-row sm:items-center sm:gap-8">
                  <div class="flex flex-col sm:w-1/2">
                    <label>{{ t('Frame preset') }}</label>
                    <Combobox
                      :items="allFramePresetOptions"
                      v-model:value="selectedFramePresetKey"
                      :button-label="t('Select frame preset')"
                    />
                  </div>
                </div>
                <div class="flex flex-col">
                  <label class="mb-2 block">{{ t('Text position') }}</label>
                  <fieldset class="flex-1" role="radio" tabindex="0">
                    <div
                      class="radio"
                      v-for="position in ['top', 'bottom', 'right', 'left']"
                      :key="position"
                    >
                      <input
                        :id="'frameTextPosition-' + position"
                        type="radio"
                        v-model="frameTextPosition"
                        :value="position"
                      />
                      <label :for="'frameTextPosition-' + position">{{ t(position) }}</label>
                    </div>
                  </fieldset>
                </div>

                <div>
                  <div class="mb-2 flex flex-row items-center gap-2">
                    <label for="frame-text">{{ t('Frame text') }}</label>
                  </div>
                  <textarea
                    name="frame-text"
                    class="text-input"
                    id="frame-text"
                    rows="2"
                    :placeholder="t('Scan for more info')"
                    v-model="frameText"
                  />
                </div>

                <div>
                  <label class="mb-2 block">{{ t('Frame style') }}</label>
                  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label for="frame-text-color" class="mb-1 block text-sm">{{
                        t('Text color')
                      }}</label>
                      <input
                        id="frame-text-color"
                        type="color"
                        class="color-input"
                        v-model="frameStyle.textColor"
                      />
                    </div>
                    <div>
                      <label for="frame-bg-color" class="mb-1 block text-sm">{{
                        t('Background color')
                      }}</label>
                      <input
                        id="frame-bg-color"
                        type="color"
                        class="color-input"
                        v-model="frameStyle.backgroundColor"
                      />
                    </div>
                    <div>
                      <label for="frame-border-color" class="mb-1 block text-sm">{{
                        t('Border color')
                      }}</label>
                      <input
                        id="frame-border-color"
                        type="color"
                        class="color-input"
                        v-model="frameStyle.borderColor"
                      />
                    </div>
                    <div>
                      <label for="frame-border-width" class="mb-1 block text-sm">{{
                        t('Border width')
                      }}</label>
                      <input
                        id="frame-border-width"
                        type="text"
                        class="text-input"
                        v-model="frameStyle.borderWidth"
                        placeholder="1px"
                      />
                    </div>
                    <div>
                      <label for="frame-border-radius" class="mb-1 block text-sm">{{
                        t('Border radius')
                      }}</label>
                      <input
                        id="frame-border-radius"
                        type="text"
                        class="text-input"
                        v-model="frameStyle.borderRadius"
                        placeholder="8px"
                      />
                    </div>
                    <div>
                      <label for="frame-padding" class="mb-1 block text-sm">{{
                        t('Padding')
                      }}</label>
                      <input
                        id="frame-padding"
                        type="text"
                        class="text-input"
                        v-model="frameStyle.padding"
                        placeholder="16px"
                      />
                    </div>
                  </div>
                </div>
              </template>
            </section>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="qr-code-settings">
          <AccordionTrigger
            class="button !px-4 text-2xl text-gray-700 outline-none dark:text-gray-100 md:!px-6 lg:!px-8"
            ><span id="qr-code-settings-title">{{ t('QR code settings') }}</span></AccordionTrigger
          >
          <AccordionContent class="px-2 pb-8 pt-4">
            <section class="space-y-8" aria-labelledby="qr-code-settings-title">
              <div>
                <label>{{ t('Preset') }}</label>
                <div class="flex flex-row items-center justify-start gap-2">
                  <Combobox
                    :items="allPresetOptions"
                    v-model:value="selectedPresetKey"
                    v-model:open="isPresetSelectOpen"
                    :button-label="t('Select QR code preset')"
                    :insert-divider-at-indexes="[0, 2]"
                  />
                  <button
                    class="button grid size-10 place-items-center"
                    @click="randomizeStyleSettings"
                    :aria-label="t('Randomize style')"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 640 512"
                    >
                      <path
                        fill="#888888"
                        d="M274.9 34.3c-28.1-28.1-73.7-28.1-101.8 0L34.3 173.1c-28.1 28.1-28.1 73.7 0 101.8l138.8 138.8c28.1 28.1 73.7 28.1 101.8 0l138.8-138.8c28.1-28.1 28.1-73.7 0-101.8L274.9 34.3zM200 224a24 24 0 1 1 48 0a24 24 0 1 1-48 0zM96 200a24 24 0 1 1 0 48a24 24 0 1 1 0-48zm128 176a24 24 0 1 1 0-48a24 24 0 1 1 0 48zm128-176a24 24 0 1 1 0 48a24 24 0 1 1 0-48zm-128-80a24 24 0 1 1 0-48a24 24 0 1 1 0 48zm96 328c0 35.3 28.7 64 64 64h192c35.3 0 64-28.7 64-64V256c0-35.3-28.7-64-64-64H461.7c11.6 36 3.1 77-25.4 105.5L320 413.8V448zm160-120a24 24 0 1 1 0 48a24 24 0 1 1 0-48z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div class="w-full">
                <div class="flex w-full flex-col flex-wrap gap-4 sm:flex-row sm:gap-x-8">
                  <!-- Data to encode area -->
                  <div class="grow">
                    <!-- Header row: Label + Mode Toggles + Batch Options -->
                    <div class="mb-2 flex items-center gap-4">
                      <label for="data">{{ t('Data to encode') }}</label>
                      <!-- Mode Toggle Buttons -->
                      <div class="flex grow items-center gap-2">
                        <button
                          :class="[
                            'secondary-button',
                            { 'opacity-50': exportMode === ExportMode.Single } // Dim if active
                          ]"
                          @click="exportMode = ExportMode.Single"
                        >
                          {{ $t('Single export') }}
                        </button>
                        <button
                          :class="[
                            'secondary-button',
                            { 'opacity-50': exportMode === ExportMode.Batch } // Dim if active
                          ]"
                          @click="exportMode = ExportMode.Batch"
                        >
                          {{ $t('Batch export') }}
                        </button>
                        <!-- Batch specific options -->
                        <div
                          v-if="exportMode === ExportMode.Batch"
                          :class="[
                            'flex grow items-center justify-end gap-2',
                            dataStringsFromCsv.length > 0 && 'opacity-80'
                          ]"
                        ></div>
                      </div>
                    </div>
                    <!-- Single Mode Input -->
                    <div v-if="exportMode === ExportMode.Single" class="flex flex-col items-start">
                      <textarea
                        id="data"
                        v-model="data"
                        class="mr-2 grow text-input"
                        :placeholder="t('data to encode e.g. a URL or a string')"
                      ></textarea>
                      <button
                        @click="openDataModal"
                        aria-haspopup="dialog"
                        :aria-expanded="isDataModalVisible"
                        class="secondary-button mt-2 flex items-center gap-1 self-end"
                        :aria-label="t('Open data type generator')"
                      >
                        <span>{{ t('Data templates') }}</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                        >
                          <!-- Icon from Tabler Icons by Paweł Kuna - https://github.com/tabler/tabler-icons/blob/master/LICENSE -->
                          <path
                            fill="none"
                            stroke="#888888"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="m7 7l5 5l-5 5m6-10l5 5l-5 5"
                          />
                        </svg>
                      </button>
                    </div>
                    <template v-if="exportMode === ExportMode.Batch">
                      <template v-if="!inputFileForBatchEncoding">
                        <button
                          class="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-1 py-4 text-center text-input"
                          :aria-label="t('Choose a CSV file containing data to encode')"
                          @click="fileInput?.click()"
                          @keyup.enter="fileInput?.click()"
                          @keyup.space="fileInput?.click()"
                          @dragover.prevent
                          @drop.prevent="onBatchInputFileUpload"
                        >
                          <div class="flex flex-col items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="48"
                              height="48"
                              viewBox="0 0 24 24"
                              class="mb-2 text-gray-400"
                            >
                              <path
                                fill="currentColor"
                                d="M11 16V7.85l-2.6 2.6L7 9l5-5l5 5l-1.4 1.45l-2.6-2.6V16h-2Zm-5 4q-.825 0-1.413-.588T4 18v-3h2v3h12v-3h2v3q0 .825-.588 1.413T18 20H6Z"
                              />
                            </svg>
                            <p aria-hidden="true" class="text-sm">
                              {{ $t('Upload a CSV file') }}
                            </p>
                          </div>
                          <input
                            ref="fileInput"
                            type="file"
                            accept=".csv,.txt"
                            class="hidden"
                            @change="onBatchInputFileUpload"
                          />
                        </button>
                        <div class="flex flex-wrap justify-end gap-x-4 pt-1">
                          <p class="gap-1">
                            <a
                              href="/6_strings_batch.csv"
                              download
                              class="inline-flex items-center gap-1 text-sm text-zinc-500 outline-none hover:text-zinc-700 hover:underline focus-visible:ring-1 focus-visible:ring-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 dark:focus-visible:ring-zinc-200"
                            >
                              {{ t('Example file (simple)') }}
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                class="inline"
                              >
                                <path
                                  fill="currentColor"
                                  d="M12 15.575q-.2 0-.375-.063q-.175-.062-.325-.212l-3.6-3.6q-.275-.275-.275-.7q0-.425.275-.7q.275-.275.7-.275q.425 0 .7.275l1.9 1.9V4q0-.425.288-.713Q11.575 3 12 3t.713.287Q13 3.575 13 4v8.2l1.9-1.9q.275-.275.7-.275q.425 0 .7.275q.275.275.275.7q0 .425-.275.7l-3.6 3.6q-.15.15-.325.212q-.175.063-.375.063M6 21q-.825 0-1.413-.587Q4 19.825 4 19v-2q0-.425.287-.713Q4.575 16 5 16t.713.287Q6 16.575 6 17v2h12v-2q0-.425.288-.713Q18.575 16 19 16t.712.287Q20 16.575 20 17v2q0 .825-.587 1.413Q18.825 21 18 21m0-2q3.35 0 5.675-2.325T20 12t-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20m.1-12.3q.625 0 1.088.4t.462 1q0 .55-.337.975t-.763.8q-.575.5-1.012 1.1t-.438 1.35q0 .35.263.588t.612.237q.375 0 .638-.25t.337-.625q.1-.525.45-.937t.75-.788q.575-.55.988-1.2t.412-1.45q0-1.275-1.037-2.087T12.1 6q-.95 0-1.812.4T8.975 7.625q-.175.3-.112.638t.337.512q.35.2.725.125t.625-.425q.275-.375.688-.575t.862-.2"
                                />
                              </svg>
                            </a>
                          </p>
                          <p class="gap-1">
                            <a
                              href="/vcard_sample.csv"
                              download
                              class="inline-flex items-center gap-1 text-sm text-zinc-500 outline-none hover:text-zinc-700 hover:underline focus-visible:ring-1 focus-visible:ring-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 dark:focus-visible:ring-zinc-200"
                            >
                              {{ t('Example file (vCard)') }}
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                class="inline"
                              >
                                <path
                                  fill="currentColor"
                                  d="M12 15.575q-.2 0-.375-.063q-.175-.062-.325-.212l-3.6-3.6q-.275-.275-.275-.7q0-.425.275-.7q.275-.275.7-.275q.425 0 .7.275l1.9 1.9V4q0-.425.288-.713Q11.575 3 12 3t.713.287Q13 3.575 13 4v8.2l1.9-1.9q.275-.275.7-.275q.425 0 .7.275q.275.275.275.7q0 .425-.275.7l-3.6 3.6q-.15.15-.325.212q-.175.063-.375.063M6 21q-.825 0-1.413-.587Q4 19.825 4 19v-2q0-.425.287-.713Q4.575 16 5 16t.713.287Q6 16.575 6 17v2h12v-2q0-.425.288-.713Q18.575 16 19 16t.712.287Q20 16.575 20 17v2q0 .825-.587 1.413Q18.825 21 18 21m0-2q3.35 0 5.675-2.325T20 12t-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20m.1-12.3q.625 0 1.088.4t.462 1q0 .55-.337.975t-.763.8q-.575.5-1.012 1.1t-.438 1.35q0 .35.263.588t.612.237q.375 0 .638-.25t.337-.625q.1-.525.45-.937t.75-.788q.575-.55.988-1.2t.412-1.45q0-1.275-1.037-2.087T12.1 6q-.95 0-1.812.4T8.975 7.625q-.175.3-.112.638t.337.512q.35.2.725.125t.625-.425q.275-.375.688-.575t.862-.2"
                                />
                              </svg>
                            </a>
                          </p>
                        </div>
                      </template>
                      <div v-else-if="isValidCsv" class="p-4 text-center">
                        <div v-if="isBatchExportSuccess">
                          <p>{{ $t('QR codes have been successfully exported.') }}</p>
                          <button class="button mt-4" @click="inputFileForBatchEncoding = null">
                            {{ $t('Start new batch export') }}
                          </button>
                        </div>
                        <div v-else-if="currentExportedQrCodeIndex == null && !isExportingBatchQRs">
                          <div v-if="dataStringsFromCsv.length > 0" class="mt-4">
                            <div
                              class="flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800"
                            >
                              <div v-if="previewRow && 'firstName' in previewRow">
                                <VCardPreview :vCard="previewRow" />
                              </div>
                              <div v-else>
                                <div class="space-y-2">
                                  <div class="flex flex-col gap-1">
                                    <span
                                      class="text-xs font-medium text-gray-500 dark:text-gray-400"
                                      >{{ $t('Data:') }}</span
                                    >
                                    <code
                                      class="rounded bg-white px-2 py-1 font-mono text-sm dark:bg-gray-900"
                                    >
                                      {{ dataStringsFromCsv[previewRowIndex] }}
                                    </code>
                                  </div>
                                  <div v-if="frameTextsFromCsv.length > 0">
                                    <span
                                      class="text-xs font-medium text-gray-500 dark:text-gray-400"
                                      >{{ $t('Frame text:') }}</span
                                    >
                                    <code
                                      class="rounded bg-white px-2 py-1 font-mono text-sm dark:bg-gray-900"
                                    >
                                      {{ frameTextsFromCsv[previewRowIndex + 1] }}
                                    </code>
                                  </div>
                                </div>
                              </div>
                              <div class="mt-2 flex items-center justify-between">
                                <button
                                  class="rounded bg-gray-200 px-2 py-1 text-gray-700 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:disabled:opacity-60"
                                  :disabled="previewRowIndex === 0"
                                  @click="previewRowIndex--"
                                >
                                  &lt;
                                </button>
                                <span class="text-xs text-gray-500 dark:text-gray-400"
                                  >{{ previewRowIndex + 1 }} / {{ dataStringsFromCsv.length }}</span
                                >
                                <button
                                  class="rounded bg-gray-200 px-2 py-1 text-gray-700 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:disabled:opacity-60"
                                  :disabled="previewRowIndex === dataStringsFromCsv.length - 1"
                                  @click="previewRowIndex++"
                                >
                                  &gt;
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div v-else-if="currentExportedQrCodeIndex != null">
                          <p>{{ $t('Creating QR codes... This may take a while.') }}</p>
                          <p>
                            {{
                              $t('{index} / {count} QR codes have been created.', {
                                index: currentExportedQrCodeIndex + 1,
                                count: dataStringsFromCsv.length
                              })
                            }}
                          </p>
                        </div>
                      </div>
                      <div v-else class="p-4 text-center text-red-500">
                        <p>{{ $t('Invalid CSV') }}</p>
                      </div>
                    </template>
                  </div>

                  <!-- Error correction level -->
                  <div class="shrink-0">
                    <fieldset class="h-full" role="radio" tabindex="0">
                      <div class="flex flex-row items-center gap-2">
                        <legend>{{ t('Error correction level') }}</legend>
                        <a
                          href="https://docs.uniqode.com/en/articles/7219782-what-is-the-recommended-error-correction-level-for-printing-a-qr-code"
                          target="_blank"
                          class="icon-button flex flex-row items-center"
                          :aria-label="t('What is error correction level?')"
                        >
                          <svg
                            class="me-1"
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                          >
                            <path
                              fill="#888888"
                              d="M11.95 18q.525 0 .888-.363t.362-.887t-.362-.888t-.888-.362t-.887.363t-.363.887t.363.888t.887.362m.05 4q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m0-2q3.35 0 5.675-2.325T20 12t-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20m.1-12.3q.625 0 1.088.4t.462 1q0 .55-.337.975t-.763.8q-.575.5-1.012 1.1t-.438 1.35q0 .35.263.588t.612.237q.375 0 .638-.25t.337-.625q.1-.525.45-.937t.75-.788q.575-.55.988-1.2t.412-1.45q0-1.275-1.037-2.087T12.1 6q-.95 0-1.812.4T8.975 7.625q-.175.3-.112.638t.337.512q.35.2.725.125t.625-.425q.275-.375.688-.575t.862-.2"
                            />
                          </svg>
                        </a>
                      </div>
                      <div v-for="level in errorCorrectionLevels" class="radio" :key="level">
                        <input
                          :id="'errorCorrectionLevel-' + level"
                          type="radio"
                          v-model="errorCorrectionLevel"
                          :value="level"
                          :aria-describedby="
                            level === recommendedErrorCorrectionLevel
                              ? 'recommended-text'
                              : undefined
                          "
                        />
                        <div class="flex items-center gap-2">
                          <label :for="'errorCorrectionLevel-' + level">{{
                            t(ERROR_CORRECTION_LEVEL_LABELS[level])
                          }}</label>
                          <span
                            v-if="level === recommendedErrorCorrectionLevel"
                            class="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200"
                          >
                            {{ t('Suggested') }}
                          </span>
                        </div>
                      </div>
                    </fieldset>
                  </div>
                </div>
              </div>
              <div class="w-full">
                <div class="mb-2 flex flex-row items-center gap-2">
                  <label for="image-url">
                    {{ t('Logo image URL') }}
                  </label>
                  <button class="icon-button flex flex-row items-center" @click="uploadImage">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                    >
                      <g
                        fill="none"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                      >
                        <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                        <path
                          d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2zm-5-10v6"
                        />
                        <path d="M9.5 13.5L12 11l2.5 2.5" />
                      </g>
                    </svg>
                    <span>{{ t('Upload image') }}</span>
                  </button>
                </div>
                <textarea
                  name="image-url"
                  class="text-input"
                  id="image-url"
                  rows="1"
                  :placeholder="t('Logo image URL')"
                  v-model="image"
                />
              </div>
              <div class="flex flex-row items-center gap-2">
                <label for="with-background">
                  {{ t('With background') }}
                </label>
                <input id="with-background" type="checkbox" v-model="includeBackground" />
              </div>
              <div id="color-settings" :class="'flex w-full flex-row flex-wrap gap-4'">
                <div
                  :inert="!includeBackground"
                  :class="[!includeBackground && 'opacity-30', 'flex flex-row items-center gap-2']"
                >
                  <label for="background-color">{{ t('Background color') }}</label>
                  <input
                    id="background-color"
                    type="color"
                    class="color-input"
                    v-model="styleBackground"
                  />
                </div>
                <div class="flex flex-row items-center gap-2">
                  <label for="dots-color">{{ t('Dots color') }}</label>
                  <input
                    id="dots-color"
                    type="color"
                    class="color-input"
                    v-model="dotsOptionsColor"
                  />
                </div>
                <div class="flex flex-row items-center gap-2">
                  <label for="corners-square-color">{{ t('Corners Square color') }}</label>
                  <input
                    id="corners-square-color"
                    type="color"
                    class="color-input"
                    v-model="cornersSquareOptionsColor"
                  />
                </div>
                <div class="flex flex-row items-center gap-2">
                  <label for="corners-dot-color">{{ t('Corners Dot color') }}</label>
                  <input
                    id="corners-dot-color"
                    type="color"
                    class="color-input"
                    v-model="cornersDotOptionsColor"
                  />
                </div>
              </div>
              <div class="flex w-full flex-col gap-4 sm:flex-row sm:gap-8">
                <div class="w-full sm:w-1/3">
                  <label for="width">
                    {{ t('Width (px)') }}
                  </label>
                  <input
                    class="text-input"
                    id="width"
                    type="number"
                    placeholder="width in pixels"
                    v-model="width"
                  />
                </div>
                <div class="w-full sm:w-1/3">
                  <label for="height">
                    {{ t('Height (px)') }}
                  </label>
                  <input
                    class="text-input"
                    id="height"
                    type="number"
                    placeholder="height in pixels"
                    v-model="height"
                  />
                </div>
                <div class="w-full sm:w-1/3">
                  <label for="border-radius">
                    {{ t('Border radius (px)') }}
                  </label>
                  <input
                    class="text-input"
                    id="border-radius"
                    type="number"
                    placeholder="24"
                    v-model="styleBorderRadius"
                  />
                </div>
              </div>
              <div class="flex w-full flex-col gap-4 sm:flex-row sm:gap-8">
                <div class="w-full sm:w-1/2">
                  <label for="margin">
                    {{ t('Margin (px)') }}
                  </label>
                  <input
                    class="text-input"
                    id="margin"
                    type="number"
                    placeholder="0"
                    v-model="margin"
                  />
                </div>
                <div class="w-full sm:w-1/2">
                  <label for="image-margin">
                    {{ t('Image margin (px)') }}
                  </label>
                  <input
                    class="text-input"
                    id="image-margin"
                    type="number"
                    placeholder="0"
                    v-model="imageMargin"
                  />
                </div>
              </div>
              <div
                id="dots-squares-settings"
                class="mb-4 flex w-full flex-col flex-wrap gap-6 md:flex-row"
              >
                <fieldset class="flex-1" role="radio" tabindex="0">
                  <legend>{{ t('Dots type') }}</legend>
                  <div
                    class="radio"
                    v-for="type in [
                      'dots',
                      'rounded',
                      'classy',
                      'classy-rounded',
                      'square',
                      'extra-rounded'
                    ]"
                    :key="type"
                  >
                    <input
                      :id="'dotsOptionsType-' + type"
                      type="radio"
                      v-model="dotsOptionsType"
                      :value="type"
                    />
                    <label :for="'dotsOptionsType-' + type">{{ t(type) }}</label>
                  </div>
                </fieldset>
                <fieldset class="flex-1" role="radio" tabindex="0">
                  <legend>{{ t('Corners Square type') }}</legend>
                  <div class="radio" v-for="type in ['dot', 'square', 'extra-rounded']" :key="type">
                    <input
                      :id="'cornersSquareOptionsType-' + type"
                      type="radio"
                      v-model="cornersSquareOptionsType"
                      :value="type"
                    />
                    <label :for="'cornersSquareOptionsType-' + type">{{ t(type) }}</label>
                  </div>
                </fieldset>
                <fieldset class="flex-1" role="radio" tabindex="0">
                  <legend>{{ t('Corners Dot type') }}</legend>
                  <div class="radio" v-for="type in ['dot', 'square']" :key="type">
                    <input
                      :id="'cornersDotOptionsType-' + type"
                      type="radio"
                      v-model="cornersDotOptionsType"
                      :value="type"
                    />
                    <label :for="'cornersDotOptionsType-' + type">{{ t(type) }}</label>
                  </div>
                </fieldset>
              </div>
            </section>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  </div>

  <DataTemplatesModal
    :show="isDataModalVisible"
    :initial-data="data"
    @close="closeDataModal"
    @update:data="updateDataFromModal"
  />

  <!-- Fallback modal for manual copy in Safari -->
  <CopyImageModal
    v-if="showSafariCopyImageModal"
    :is-loading="copyModalIsLoading"
    :image-src="copyModalImageSrc"
    @close="closeCopyModal"
  />
</template>
