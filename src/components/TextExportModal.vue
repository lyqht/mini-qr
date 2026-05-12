<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import JSZip from 'jszip'
import { buildMatrix } from '@/lib/qr-code'
import { downloadBlob } from '@/utils/download'
import {
  copyAsciiTextToClipboard,
  downloadAsciiText,
  getAsciiText,
  getMarkdownText,
  type TextExportInput
} from '@/utils/convertToText'
import type { AsciiFormat } from '@/lib/qr-code'

interface BatchRow {
  data: string
  fileName: string
}

const props = withDefaults(
  defineProps<{
    open: boolean
    matrix: boolean[][]
    hasFrame: boolean
    filename: string
    isBatch?: boolean
    batchRows?: BatchRow[]
    ecLevel?: 'L' | 'M' | 'Q' | 'H'
  }>(),
  { isBatch: false, batchRows: () => [], ecLevel: 'Q' }
)

defineEmits<{ (e: 'close'): void }>()

const { t } = useI18n()

interface FormatCard {
  id: AsciiFormat
  label: string
  description: string
  warning?: string
}

const cards = computed<FormatCard[]>(() => [
  {
    id: 'unicode-half',
    label: t('Unicode (half-blocks)'),
    description: t('Compact: two rows packed into one line using ▀ ▄ █ characters.')
  },
  {
    id: 'unicode-full',
    label: t('Unicode (full-blocks)'),
    description: t('Solid block characters (██) — best fidelity in modern fonts.')
  },
  {
    id: 'ascii',
    label: t('ASCII'),
    description: t(
      '7-bit, inverted polarity (# is background) — works in plain text, email, and terminals.'
    ),
    warning: t(
      'Most QR scanners will not read this format because the # glyphs leave gaps between rows. Use Unicode (half/full blocks) for a scannable export.'
    )
  }
])

function preview(format: AsciiFormat): string {
  if (!props.matrix.length) return ''
  return getAsciiText({ matrix: props.matrix, format })
}

function batchPreview(format: AsciiFormat): string {
  if (props.isBatch && props.batchRows && props.batchRows.length > 0) {
    try {
      const m = buildMatrix(props.batchRows[0].data, props.ecLevel).matrix
      return getAsciiText({ matrix: m, format })
    } catch {
      return ''
    }
  }
  return preview(format)
}

const copiedFormat = ref<AsciiFormat | null>(null)
const isBatchDownloading = ref(false)
const batchProgress = ref({ current: 0, total: 0 })

async function downloadBatchZip(format: AsciiFormat, wrap: 'md' | 'txt') {
  if (!props.isBatch || !props.batchRows || props.batchRows.length === 0) return
  isBatchDownloading.value = true
  batchProgress.value = { current: 0, total: props.batchRows.length }
  try {
    const zip = new JSZip()
    const used = new Set<string>()
    for (let i = 0; i < props.batchRows.length; i++) {
      batchProgress.value.current = i + 1
      const row = props.batchRows[i]
      let matrix: boolean[][]
      try {
        matrix = buildMatrix(row.data, props.ecLevel).matrix
      } catch (err) {
        console.error(`Skipping row ${i}: failed to build matrix`, err)
        continue
      }
      const body =
        wrap === 'md' ? getMarkdownText({ matrix, format }) : getAsciiText({ matrix, format })
      let name = (row.fileName || `qr-${i}`).replace(/[^a-zA-Z0-9_-]/g, '_')
      let candidate = `${name}.${wrap}`
      let suffix = 1
      while (used.has(candidate)) {
        candidate = `${name}_${suffix}.${wrap}`
        suffix++
      }
      used.add(candidate)
      zip.file(candidate, body)
    }
    const blob = await zip.generateAsync({ type: 'blob' })
    downloadBlob(blob, `qr-codes-ascii-${format}.zip`)
  } catch (err) {
    console.error('Batch ASCII export failed:', err)
  } finally {
    isBatchDownloading.value = false
    batchProgress.value = { current: 0, total: 0 }
  }
}

function safeFilename(): string {
  return (props.filename || 'qr-code').replace(/[^a-zA-Z0-9_-]/g, '_')
}

function onDownload(format: AsciiFormat, wrap: 'md' | 'txt') {
  if (!props.matrix.length) return
  const input: TextExportInput = { matrix: props.matrix, format }
  downloadAsciiText(input, `${safeFilename()}.${wrap}`, wrap)
}

async function onCopy(format: AsciiFormat) {
  if (!props.matrix.length) return
  const ok = await copyAsciiTextToClipboard({ matrix: props.matrix, format })
  if (ok) {
    copiedFormat.value = format
    setTimeout(() => {
      if (copiedFormat.value === format) copiedFormat.value = null
    }, 1500)
  }
}

watch(
  () => props.open,
  (open) => {
    if (!open) copiedFormat.value = null
  }
)
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    role="dialog"
    aria-modal="true"
    @click.self="$emit('close')"
  >
    <div class="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg dark:bg-zinc-900">
      <button
        type="button"
        class="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
        @click="$emit('close')"
        :aria-label="t('Close')"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="size-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
      <h3 class="mb-4 text-lg font-medium">{{ t('Export as text') }}</h3>
      <div
        v-if="hasFrame"
        role="note"
        class="mb-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200"
      >
        {{ t('Text output excludes the frame and image') }}
      </div>

      <div class="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1">
        <div
          v-for="card in cards"
          :key="card.id"
          class="rounded-md border border-zinc-200 p-3 dark:border-zinc-700"
        >
          <div class="mb-2 flex items-baseline justify-between gap-2">
            <strong>{{ card.label }}</strong>
            <span class="text-xs text-zinc-500">{{ card.description }}</span>
          </div>
          <p
            v-if="card.warning"
            role="note"
            class="mb-2 rounded-md border border-amber-300 bg-amber-50 px-2 py-1.5 text-xs text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200"
          >
            {{ card.warning }}
          </p>
          <p v-if="isBatch" class="mb-1 text-xs text-zinc-500">
            {{ t('Preview of first row') }}
          </p>
          <pre
            class="max-h-[60vh] overflow-auto whitespace-pre rounded bg-white p-2 font-mono dark:bg-zinc-100 dark:text-zinc-900"
            :style="{
              lineHeight: 1,
              fontSize: card.id === 'unicode-half' ? '10px' : '6px'
            }"
            >{{ batchPreview(card.id) }}</pre
          >
          <div class="mt-2 flex flex-wrap gap-2">
            <template v-if="!isBatch">
              <button class="button text-sm" @click="onDownload(card.id, 'md')">
                {{ t('Download .md') }}
              </button>
              <button class="button text-sm" @click="onDownload(card.id, 'txt')">
                {{ t('Download .txt') }}
              </button>
              <button class="button text-sm" @click="onCopy(card.id)">
                {{ copiedFormat === card.id ? t('Copied') : t('Copy to clipboard') }}
              </button>
            </template>
            <template v-else>
              <button
                class="button text-sm"
                :disabled="isBatchDownloading || !batchRows?.length"
                @click="downloadBatchZip(card.id, 'md')"
              >
                {{ t('Download all as .md') }}
              </button>
              <button
                class="button text-sm"
                :disabled="isBatchDownloading || !batchRows?.length"
                @click="downloadBatchZip(card.id, 'txt')"
              >
                {{ t('Download all as .txt') }}
              </button>
            </template>
          </div>
        </div>
      </div>
      <p v-if="isBatchDownloading" class="mt-3 text-sm text-zinc-500">
        {{ t('Generating') }} {{ batchProgress.current }} / {{ batchProgress.total }}…
      </p>
    </div>
  </div>
</template>
