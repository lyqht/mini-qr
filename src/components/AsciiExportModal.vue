<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  copyAsciiTextToClipboard,
  downloadAsciiText,
  getAsciiText,
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
}

const cards = computed<FormatCard[]>(() => [
  {
    id: 'ascii',
    label: t('ASCII'),
    description: t('7-bit characters — works in plain text, email, and terminals.')
  },
  {
    id: 'unicode-half',
    label: t('Unicode (half-blocks)'),
    description: t('Compact: two rows packed into one line using ▀ ▄ █ characters.')
  },
  {
    id: 'unicode-full',
    label: t('Unicode (full-blocks)'),
    description: t('Solid block characters (██) — best fidelity in modern fonts.')
  }
])

function preview(format: AsciiFormat): string {
  if (!props.matrix.length) return ''
  return getAsciiText({ matrix: props.matrix, format })
}

const copiedFormat = ref<AsciiFormat | null>(null)

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
          <pre
            class="max-h-64 overflow-auto whitespace-pre rounded bg-zinc-50 p-2 font-mono text-xs leading-tight dark:bg-zinc-800"
            >{{ preview(card.id) }}</pre
          >
          <div class="mt-2 flex flex-wrap gap-2">
            <button class="button text-sm" @click="onDownload(card.id, 'md')">
              {{ t('Download .md') }}
            </button>
            <button class="button text-sm" @click="onDownload(card.id, 'txt')">
              {{ t('Download .txt') }}
            </button>
            <button class="button text-sm" @click="onCopy(card.id)">
              {{ copiedFormat === card.id ? t('Copied') : t('Copy to clipboard') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
